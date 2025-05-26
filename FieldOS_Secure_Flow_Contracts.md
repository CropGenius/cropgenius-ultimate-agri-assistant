**FieldOS: Secure Flow Contracts**

---

**1. Authentication: Supabase JWT Verification (Prime Directive 1 & 4)**

*   **Applicability:** ALL Edge Functions. No exceptions.
*   **Mechanism:**
    1.  Client (Farmer Interface Layer, external systems) includes Supabase JWT in the `Authorization` header of every HTTP request (e.g., `Authorization: Bearer <JWT_TOKEN>`).
    2.  Edge Function retrieves the token.
    3.  Edge Function uses Supabase's provided libraries/SDKs (or a standard JWT library configured with Supabase public keys/secret) to verify the token's signature and claims (issuer, expiration, etc.).
    4.  **On Success:** Token is valid. Extract `userId` and other relevant claims (e.g., `role`, `app_metadata`). Proceed to RBAC.
    5.  **On Failure:** Invalid token (expired, tampered, incorrect issuer). Immediately return `401 Unauthorized`. Log security event. DO NOT PROCEED.
*   **No Fallbacks:** `FALLBACK_USER_ID` or similar mechanisms are strictly prohibited. If JWT is missing or invalid, access is denied.

---

**2. Authorization: Role-Based Access Control (RBAC) (Prime Directive 1 & 4)**

*   **Applicability:** ALL Edge Functions, after successful JWT verification. Also enforced internally by FieldBrainRuntime.
*   **Mechanism:**
    1.  `userId` and `role` (e.g., `farmer`, `pro_farmer`, `extension_officer`, `system_admin`) are extracted from the validated JWT.
    2.  Each Edge Function and FieldBrainRuntime service endpoint defines the required permissions/roles for accessing its resources or performing its actions.
        *   Example: Accessing `FieldMemoryLayer.getEvents(fieldId, ...)` requires that the `userId` from the JWT is the owner of `fieldId` OR has a role (`extension_officer`) with explicit delegation rights for that `fieldId`.
        *   Example: Triggering `LearningKernel.adaptAdvice(...)` might be restricted to `system_admin` or specific automated service roles.
    3.  The system checks if the requesting `userId`'s `role` and ownership context (e.g., `isOwner(userId, resourceId)`) satisfy the defined permissions.
    4.  **On Success:** Authorization granted. Proceed with the function logic.
    5.  **On Failure:** Authorization denied. Return `403 Forbidden`. Log security event.
*   **Granularity:** RBAC rules must be granular enough to protect individual farmer data, specific system functions, and different data types within FieldMemoryLayer.
*   **Centralized Management (Recommended):** RBAC policies should ideally be managed centrally (e.g., within Supabase or a dedicated authorization service) but enforced locally at each function/service.

---

**3. FieldBrainRuntime Broker (Prime Directive 4)**

*   **Purpose:** Centralize and secure access to the `FieldBrainRuntime`.
*   **Mechanism:**
    1.  All `field-ai-*` calls (e.g., requests for intelligence reports, scenario simulations initiated by users) are directed to a specific set of Edge Functions acting as API gateways.
    2.  These Edge Functions perform JWT & RBAC as defined above.
    3.  Upon successful authentication & authorization, the Edge Function does NOT call `FieldBrainRuntime` components directly. Instead, it publishes a request/job to a secure, internal message queue or an asynchronous task execution system (e.g., Supabase Realtime, RabbitMQ, Kafka, dedicated job queue).
    4.  The `FieldBrainRuntime` has worker instances that subscribe to this queue. These workers pick up validated requests.
    5.  **Benefits:**
        *   **Decoupling:** Edge Functions don't need to know `FieldBrainRuntime`'s internal architecture or location.
        *   **Scalability & Resilience:** The queue acts as a buffer, allowing `FieldBrainRuntime` to process tasks at its own pace and handle load spikes.
        *   **Enhanced Security:** Direct exposure of `FieldBrainRuntime` is minimized. It only accepts tasks from the trusted queue system.
        *   **Centralized Logging Point:** The broker (or queueing mechanism) can be an additional point for logging all incoming AI requests.
*   **Request Schema (Example for `runFieldBrain`):**
    ```json
    {
      "version": "1.0",
      "requestId": "uuid", // For tracking
      "timestamp": "iso8601",
      "userId": "verified_user_id_from_jwt",
      "fieldId": "target_field_id", // Ownership/access verified by RBAC
      "externalContext": { /* Optional: e.g., user query, manual overrides */ }
    }
    ```

---

**4. Secure Data Handling & Schemas**

*   **Input Validation:** All incoming data (from user interfaces, sensors, external APIs) MUST be validated against predefined schemas at the Edge Function/Data Ingestion Layer before processing or storage. Reject non-compliant data.
*   **Data Minimization:** Only request and store data that is necessary for the intended purpose.
*   **Encryption:**
    *   **In Transit:** All communication uses HTTPS/TLS.
    *   **At Rest:** Sensitive data in `FieldMemoryLayer` (e.g., PII, precise location if not essential for a query) should be encrypted. Farmer-specific encryption keys could be explored for ultimate data sovereignty.
*   **Anonymization/Aggregation for Cluster Insights:** Data used by `scanFarmerClusterInsights` or for global model training MUST be anonymized and aggregated to prevent re-identification of individual farmers or their specific field data, unless explicit consent is obtained for a specific purpose.
*   **Output Sanitization:** Data returned in `FieldIntelligenceReport` or other API responses should be sanitized to prevent injection attacks if displayed in web/mobile views.

---

**5. Logging for Evolution and Security (Prime Directive 4 & 5)**

*   **Comprehensive Logging:**
    *   **Access Logs:** Every request to Edge Functions (timestamp, source IP (hashed/anonymized where appropriate), JWT `userId`, requested resource, success/failure, RBAC decision).
    *   **Decision Logs (FieldBrainRuntime):**
        *   Input parameters received for `runFieldBrain`.
        *   Key intermediate results/data points used in decision-making (e.g., summary of historical analysis, key simulation outcomes considered).
        *   The final `FieldIntelligenceReport` generated (or a hash/reference to it).
        *   Version of models/rules used.
    *   **Feedback Logs (FieldMemoryLayer):** All farmer feedback, linked to the specific recommendation/report it pertains to. Includes `userId`, `fieldId`, feedback content, timestamp.
    *   **LearningKernel Logs:** Model updates, detected pattern drifts, A/B test configurations and results, regional data sync events.
    *   **Security Events:** Authentication failures, authorization failures, suspected malicious activity.
*   **Storage:** Logs should be stored securely, with appropriate retention policies and access controls. Consider a dedicated, immutable logging service.
*   **Purpose:**
    *   **Evolution (Prime Directive 5):** Provide the data needed for `LearningKernel` to adapt, for developers to understand system behavior, and to retrain models.
    *   **Security & Audit:** Detect and investigate security incidents, monitor for abuse, and ensure compliance.
    *   **Debugging & Troubleshooting:** Diagnose issues in the system.

---

**Contract Adherence:** All new development and modifications MUST adhere to these Secure Flow Contracts. Automated checks and code review processes should verify compliance.
