import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// This configures a request mocking server with the given request handlers.
export const server = setupServer(...handlers);

// Enable API mocking before tests run
export function enableMocking() {
  server.listen({ onUnhandledRequest: 'error' });
}

// Reset handlers after each test
export function resetMocking() {
  server.resetHandlers();
}

// Clean up after tests
export function disableMocking() {
  server.close();
}