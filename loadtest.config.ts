import { config } from 'k6';
import { http } from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 }, // Ramp up to 100 users
    { duration: '1m', target: 100 }, // Stay at 100 users for 1 minute
    { duration: '30s', target: 500 }, // Ramp up to 500 users
    { duration: '1m', target: 500 }, // Stay at 500 users for 1 minute
    { duration: '30s', target: 1000 }, // Ramp up to 1000 users
    { duration: '1m', target: 1000 }, // Stay at 1000 users for 1 minute
    { duration: '30s', target: 5000 }, // Ramp up to 5000 users
    { duration: '1m', target: 5000 }, // Stay at 5000 users for 1 minute
    { duration: '30s', target: 10000 }, // Ramp up to 10000 users
    { duration: '1m', target: 10000 }, // Stay at 10000 users for 1 minute
    { duration: '30s', target: 50000 }, // Ramp up to 50000 users
    { duration: '1m', target: 50000 }, // Stay at 50000 users for 1 minute
    { duration: '5m', target: 50000 }, // Stay at 50000 users for 5 minutes
    { duration: '30s', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500'], // 95% of requests must complete below 1.5s
    http_req_failed: ['rate<0.01'], // Less than 1% of requests should fail
    checks: ['rate>0.99'] // At least 99% of checks should pass
  }
};

export default function () {
  const urls = [
    '/',
    '/auth',
    '/farm-plan',
    '/market',
    '/weather',
    '/fields',
    '/chat'
  ];

  const url = urls[Math.floor(Math.random() * urls.length)];
  const response = http.get(url);

  // Add random delays to simulate real user behavior
  const delay = Math.random() * 2; // Random delay between 0-2 seconds
  sleep(delay);

  // Check response status
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time is acceptable': (r) => r.timings.duration < 1500
  });
}
