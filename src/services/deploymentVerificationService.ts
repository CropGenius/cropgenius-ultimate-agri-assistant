import { supabase } from '../integrations/supabase/client';
import { systemMonitor } from './systemMonitoringService';
import { security } from './securityService';
import { analytics } from '../integrations/analytics';

export interface DeploymentHealth {
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  checks: Array<{
    name: string;
    status: boolean;
    error?: string;
  }>;
  timestamp: number;
}

export class DeploymentVerificationService {
  private static instance: DeploymentVerificationService;
  private readonly CRITICAL_CHECKS = [
    'database_connection',
    'auth_flow',
    'payment_flow',
    'api_endpoints',
    'third_party_integrations'
  ];

  private constructor() {
    this.initializeVerification();
  }

  public static getInstance(): DeploymentVerificationService {
    if (!DeploymentVerificationService.instance) {
      DeploymentVerificationService.instance = new DeploymentVerificationService();
    }
    return DeploymentVerificationService.instance;
  }

  private initializeVerification(): void {
    // Start periodic verification
    setInterval(async () => {
      const health = await this.verifyHealth();
      analytics.track('deployment_health_check', health);
    }, 60000); // Check every minute
  }

  public async verifyHealth(): Promise<DeploymentHealth> {
    const checks = await Promise.all([
      this.testDatabaseConnection(),
      this.testAuthFlow(),
      this.testPaymentFlow(),
      this.testAPIEndpoints(),
      this.testThirdPartyIntegrations(),
      this.testSecurity(),
      this.testPerformance()
    ]);

    const health: DeploymentHealth = {
      status: 'HEALTHY',
      checks: checks,
      timestamp: Date.now()
    };

    // Determine overall status
    const criticalFailures = checks
      .filter(c => this.CRITICAL_CHECKS.includes(c.name))
      .filter(c => !c.status);

    if (criticalFailures.length > 0) {
      health.status = 'CRITICAL';
      systemMonitor.triggerEmergencyShutdown();
    } else if (checks.filter(c => !c.status).length > 0) {
      health.status = 'WARNING';
    }

    return health;
  }

  private async testDatabaseConnection(): Promise<{ name: string; status: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('health_check')
        .select('id')
        .limit(1)
        .single();

      if (error) throw error;
      return { name: 'database_connection', status: true };
    } catch (error) {
      return {
        name: 'database_connection',
        status: false,
        error: error.message
      };
    }
  }

  private async testAuthFlow(): Promise<{ name: string; status: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'test123'
      });

      if (error) throw error;
      return { name: 'auth_flow', status: true };
    } catch (error) {
      return {
        name: 'auth_flow',
        status: false,
        error: error.message
      };
    }
  }

  private async testPaymentFlow(): Promise<{ name: string; status: boolean; error?: string }> {
    try {
      const validation = await security.validatePaymentFlow(
        'test-user-id',
        100,
        'USD'
      );

      if (!validation.isValid) throw new Error(validation.error);
      return { name: 'payment_flow', status: true };
    } catch (error) {
      return {
        name: 'payment_flow',
        status: false,
        error: error.message
      };
    }
  }

  private async testAPIEndpoints(): Promise<{ name: string; status: boolean; error?: string }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/health`);
      if (!response.ok) throw new Error('API health check failed');
      return { name: 'api_endpoints', status: true };
    } catch (error) {
      return {
        name: 'api_endpoints',
        status: false,
        error: error.message
      };
    }
  }

  private async testThirdPartyIntegrations(): Promise<{ name: string; status: boolean; error?: string }> {
    try {
      // Test WhatsApp integration
      const whatsappResponse = await fetch(`${import.meta.env.VITE_WHATSAPP_API_URL}/health`);
      if (!whatsappResponse.ok) throw new Error('WhatsApp integration failed');

      // Test PlantNet integration
      const plantNetResponse = await fetch(`${import.meta.env.VITE_PLANTNET_API_URL}/health`);
      if (!plantNetResponse.ok) throw new Error('PlantNet integration failed');

      return { name: 'third_party_integrations', status: true };
    } catch (error) {
      return {
        name: 'third_party_integrations',
        status: false,
        error: error.message
      };
    }
  }

  private async testSecurity(): Promise<{ name: string; status: boolean; error?: string }> {
    try {
      const validation = await security.validateRequest(
        new Request('http://localhost'),
        '127.0.0.1',
        'security_test'
      );

      if (!validation.isValid) throw new Error(validation.error);
      return { name: 'security', status: true };
    } catch (error) {
      return {
        name: 'security',
        status: false,
        error: error.message
      };
    }
  }

  private async testPerformance(): Promise<{ name: string; status: boolean; error?: string }> {
    try {
      const health = await systemMonitor.getSystemHealth();
      
      if (health.status === 'CRITICAL') {
        throw new Error('Performance metrics critical');
      }

      return { name: 'performance', status: true };
    } catch (error) {
      return {
        name: 'performance',
        status: false,
        error: error.message
      };
    }
  }

  public async verifyDeployment(): Promise<boolean> {
    const health = await this.verifyHealth();
    return health.status === 'HEALTHY';
  }

  public async triggerRollback(): Promise<void> {
    try {
      // Implementation of rollback logic
      console.log('Triggering deployment rollback...');
      analytics.track('deployment_rollback', {
        reason: 'health_check_failed',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Rollback failed:', error);
    }
  }
}

export const deploymentVerifier = DeploymentVerificationService.getInstance();
