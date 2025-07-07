import { faker } from '@faker-js/faker';

export interface TestUser {
  email: string;
  password: string;
  phone: string;
  farmName: string;
  totalArea: string;
  location: {
    latitude: number;
    longitude: number;
    country: string;
    region: string;
  };
}

export const createTestUser = (): TestUser => ({
  email: `test-${Date.now()}@example.com`,
  password: 'Test123!',
  phone: '+254700000000',
  farmName: faker.company.name(),
  totalArea: '10',
  location: {
    latitude: -1.2921,
    longitude: 36.8219,
    country: 'Kenya',
    region: 'Nairobi'
  }
});
