import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 500 },
    { duration: '1m', target: 500 },
    { duration: '30s', target: 1000 },
    { duration: '1m', target: 1000 },
    { duration: '30s', target: 5000 },
    { duration: '1m', target: 5000 },
    { duration: '30s', target: 10000 },
    { duration: '1m', target: 10000 },
    { duration: '30s', target: 50000 },
    { duration: '1m', target: 50000 },
    { duration: '5m', target: 50000 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99']
  }
};

const urls = [
  '/',
  '/auth',
  '/farm-plan',
  '/market',
  '/weather',
  '/fields',
  '/chat'
];

export default function () {
  const url = urls[Math.floor(Math.random() * urls.length)];
  const response = http.get(`http://localhost:3000${url}`);

  sleep(Math.random() * 2);

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time is acceptable': (r) => r.timings.duration < 1500
  });
}
