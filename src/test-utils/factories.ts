import { faker } from '@faker-js/faker';

// INFINITY-LEVEL Test Data Factories 🚀
// These factories generate realistic test data for comprehensive testing

export interface TestUser {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  location: string;
  farm_size: number;
  farm_type: string;
  preferred_crops: string[];
  experience_years: number;
  credits_balance: number;
  subscription_tier: 'free' | 'pro' | 'premium';
  created_at: string;
  updated_at: string;
}

export interface TestFarm {
  id: string;
  user_id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  size_hectares: number;
  soil_type: string;
  elevation: number;
  water_source: string;
  irrigation_type: string;
  organic_certified: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestField {
  id: string;
  farm_id: string;
  user_id: string;
  name: string;
  crop_type: string;
  variety: string;
  planting_date: string;
  expected_harvest: string;
  size_hectares: number;
  soil_ph: number;
  growth_stage: string;
  health_status: string;
  yield_estimate: number;
  coordinates: number[][];
}

export interface TestMarketListing {
  id: string;
  crop_name: string;
  price: number;
  quantity: number;
  unit: string;
  location: string;
  seller_name: string;
  contact_info: string;
  description: string;
  listing_type: 'sell' | 'buy';
  status: 'active' | 'sold' | 'expired';
  quality_grade: 'A' | 'B' | 'C';
  currency: string;
  created_at: string;
}

export interface TestWeatherData {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  wind_direction: number;
  pressure: number;
  uv_index: number;
  visibility: number;
  weather_condition: string;
  recorded_at: string;
}

export interface TestCropDiseaseDetection {
  id: string;
  user_id: string;
  image_url: string;
  disease_name: string;
  confidence_score: number;
  treatment_recommendation: string;
  prevention_tips: string;
  severity: 'low' | 'medium' | 'high';
  affected_area_percentage: number;
  detected_at: string;
}

// Kenyan locations for realistic test data
const kenyanLocations = [
  { name: 'Nairobi', lat: -1.2921, lng: 36.8219 },
  { name: 'Mombasa', lat: -4.0435, lng: 39.6682 },
  { name: 'Kisumu', lat: -0.0917, lng: 34.7680 },
  { name: 'Nakuru', lat: -0.3031, lng: 36.0800 },
  { name: 'Eldoret', lat: 0.5143, lng: 35.2698 },
  { name: 'Thika', lat: -1.0332, lng: 37.0692 },
  { name: 'Kitale', lat: 1.0177, lng: 35.0062 },
  { name: 'Machakos', lat: -1.5177, lng: 37.2634 },
  { name: 'Meru', lat: 0.0467, lng: 37.6556 },
  { name: 'Nyeri', lat: -0.4167, lng: 36.9500 },
];

const cropTypes = [
  'maize', 'beans', 'wheat', 'rice', 'sorghum', 'millet',
  'tomatoes', 'onions', 'carrots', 'cabbage', 'kale', 'spinach',
  'coffee', 'tea', 'sugarcane', 'cotton', 'sunflower', 'groundnuts'
];

const cropVarieties = {
  maize: ['H614', 'H629', 'DK8031', 'SC627', 'PH4'],
  beans: ['KK8', 'KK15', 'Rosecoco', 'Canadian Wonder', 'GLP2'],
  wheat: ['Kenya Fahari', 'Kenya Tai', 'Njoro BW II', 'Eagle 10'],
  tomatoes: ['Anna F1', 'Prostar F1', 'Rambo F1', 'Eden F1'],
  coffee: ['Ruiru 11', 'Batian', 'SL28', 'SL34', 'K7'],
};

const soilTypes = [
  'clay', 'sandy', 'loam', 'clay_loam', 'sandy_loam', 'silt_loam'
];

const waterSources = [
  'borehole', 'river', 'rainwater', 'dam', 'well', 'municipal'
];

const irrigationTypes = [
  'drip', 'sprinkler', 'furrow', 'flood', 'center_pivot', 'manual'
];

const growthStages = [
  'germination', 'seedling', 'vegetative', 'flowering', 'fruiting', 
  'pod_filling', 'maturity', 'harvest_ready'
];

const healthStatuses = [
  'excellent', 'healthy', 'fair', 'poor', 'diseased', 'pest_damage'
];

const diseaseNames = [
  'Corn Leaf Blight', 'Bean Rust', 'Tomato Blight', 'Coffee Berry Disease',
  'Wheat Stripe Rust', 'Maize Streak Virus', 'Bean Mosaic Virus',
  'Tomato Wilt', 'Coffee Leaf Rust', 'Anthracnose'
];

const weatherConditions = [
  'sunny', 'partly_cloudy', 'cloudy', 'overcast', 'light_rain',
  'heavy_rain', 'thunderstorm', 'drizzle', 'fog', 'windy'
];

// Factory Functions

export const createTestUser = (overrides: Partial<TestUser> = {}): TestUser => {
  const location = faker.helpers.arrayElement(kenyanLocations);
  
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    full_name: faker.person.fullName(),
    phone: `+254${faker.string.numeric(9)}`,
    location: `${location.name}, Kenya`,
    farm_size: faker.number.float({ min: 0.5, max: 50, fractionDigits: 1 }),
    farm_type: faker.helpers.arrayElement(['crop', 'livestock', 'mixed', 'poultry']),
    preferred_crops: faker.helpers.arrayElements(cropTypes, { min: 2, max: 5 }),
    experience_years: faker.number.int({ min: 1, max: 40 }),
    credits_balance: faker.number.int({ min: 0, max: 500 }),
    subscription_tier: faker.helpers.arrayElement(['free', 'pro', 'premium']),
    created_at: faker.date.past({ years: 2 }).toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides,
  };
};

export const createTestFarm = (overrides: Partial<TestFarm> = {}): TestFarm => {
  const location = faker.helpers.arrayElement(kenyanLocations);
  
  return {
    id: faker.string.uuid(),
    user_id: faker.string.uuid(),
    name: `${faker.word.adjective()} ${faker.word.noun()} Farm`,
    location: `${location.name} County, Kenya`,
    latitude: location.lat + faker.number.float({ min: -0.1, max: 0.1, fractionDigits: 4 }),
    longitude: location.lng + faker.number.float({ min: -0.1, max: 0.1, fractionDigits: 4 }),
    size_hectares: faker.number.float({ min: 0.5, max: 100, fractionDigits: 1 }),
    soil_type: faker.helpers.arrayElement(soilTypes),
    elevation: faker.number.int({ min: 500, max: 3000 }),
    water_source: faker.helpers.arrayElement(waterSources),
    irrigation_type: faker.helpers.arrayElement(irrigationTypes),
    organic_certified: faker.datatype.boolean(),
    created_at: faker.date.past({ years: 1 }).toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides,
  };
};

export const createTestField = (overrides: Partial<TestField> = {}): TestField => {
  const cropType = faker.helpers.arrayElement(cropTypes);
  const variety = cropVarieties[cropType as keyof typeof cropVarieties] 
    ? faker.helpers.arrayElement(cropVarieties[cropType as keyof typeof cropVarieties])
    : `${cropType.toUpperCase()}-${faker.number.int({ min: 1, max: 99 })}`;
  
  const plantingDate = faker.date.past({ years: 0.5 });
  const harvestDate = new Date(plantingDate);
  harvestDate.setMonth(harvestDate.getMonth() + faker.number.int({ min: 3, max: 8 }));
  
  return {
    id: faker.string.uuid(),
    farm_id: faker.string.uuid(),
    user_id: faker.string.uuid(),
    name: `${faker.word.adjective()} Field`,
    crop_type: cropType,
    variety: variety,
    planting_date: plantingDate.toISOString(),
    expected_harvest: harvestDate.toISOString(),
    size_hectares: faker.number.float({ min: 0.1, max: 10, fractionDigits: 1 }),
    soil_ph: faker.number.float({ min: 5.5, max: 8.5, fractionDigits: 1 }),
    growth_stage: faker.helpers.arrayElement(growthStages),
    health_status: faker.helpers.arrayElement(healthStatuses),
    yield_estimate: faker.number.int({ min: 500, max: 5000 }),
    coordinates: [
      [faker.location.latitude(), faker.location.longitude()],
      [faker.location.latitude(), faker.location.longitude()],
      [faker.location.latitude(), faker.location.longitude()],
      [faker.location.latitude(), faker.location.longitude()],
    ],
    ...overrides,
  };
};

export const createTestMarketListing = (overrides: Partial<TestMarketListing> = {}): TestMarketListing => {
  const cropType = faker.helpers.arrayElement(cropTypes);
  const location = faker.helpers.arrayElement(kenyanLocations);
  
  return {
    id: faker.string.uuid(),
    crop_name: cropType,
    price: faker.number.float({ min: 20, max: 200, fractionDigits: 2 }),
    quantity: faker.number.int({ min: 10, max: 1000 }),
    unit: faker.helpers.arrayElement(['kg', 'bags', 'tonnes']),
    location: `${location.name}, Kenya`,
    seller_name: faker.person.fullName(),
    contact_info: `+254${faker.string.numeric(9)}`,
    description: `High quality ${cropType} from organic farm. ${faker.lorem.sentence()}`,
    listing_type: faker.helpers.arrayElement(['sell', 'buy']),
    status: faker.helpers.arrayElement(['active', 'sold', 'expired']),
    quality_grade: faker.helpers.arrayElement(['A', 'B', 'C']),
    currency: 'KES',
    created_at: faker.date.recent({ days: 30 }).toISOString(),
    ...overrides,
  };
};

export const createTestWeatherData = (overrides: Partial<TestWeatherData> = {}): TestWeatherData => {
  const location = faker.helpers.arrayElement(kenyanLocations);
  
  return {
    id: faker.string.uuid(),
    location: `${location.name}, Kenya`,
    latitude: location.lat,
    longitude: location.lng,
    temperature: faker.number.float({ min: 15, max: 35, fractionDigits: 1 }),
    humidity: faker.number.int({ min: 30, max: 95 }),
    rainfall: faker.number.float({ min: 0, max: 50, fractionDigits: 1 }),
    wind_speed: faker.number.float({ min: 0, max: 25, fractionDigits: 1 }),
    wind_direction: faker.number.int({ min: 0, max: 360 }),
    pressure: faker.number.float({ min: 1000, max: 1030, fractionDigits: 1 }),
    uv_index: faker.number.int({ min: 1, max: 11 }),
    visibility: faker.number.float({ min: 5, max: 20, fractionDigits: 1 }),
    weather_condition: faker.helpers.arrayElement(weatherConditions),
    recorded_at: faker.date.recent().toISOString(),
    ...overrides,
  };
};

export const createTestCropDiseaseDetection = (overrides: Partial<TestCropDiseaseDetection> = {}): TestCropDiseaseDetection => {
  const disease = faker.helpers.arrayElement(diseaseNames);
  
  return {
    id: faker.string.uuid(),
    user_id: faker.string.uuid(),
    image_url: `https://example.com/crop-images/${faker.string.uuid()}.jpg`,
    disease_name: disease,
    confidence_score: faker.number.float({ min: 0.7, max: 0.99, fractionDigits: 2 }),
    treatment_recommendation: `Apply ${faker.word.noun()} treatment. ${faker.lorem.sentence()}`,
    prevention_tips: `To prevent ${disease}, ${faker.lorem.sentence()}`,
    severity: faker.helpers.arrayElement(['low', 'medium', 'high']),
    affected_area_percentage: faker.number.int({ min: 5, max: 80 }),
    detected_at: faker.date.recent().toISOString(),
    ...overrides,
  };
};

// Batch creation functions
export const createTestUsers = (count: number, overrides: Partial<TestUser> = {}): TestUser[] => {
  return Array.from({ length: count }, () => createTestUser(overrides));
};

export const createTestFarms = (count: number, overrides: Partial<TestFarm> = {}): TestFarm[] => {
  return Array.from({ length: count }, () => createTestFarm(overrides));
};

export const createTestFields = (count: number, overrides: Partial<TestField> = {}): TestField[] => {
  return Array.from({ length: count }, () => createTestField(overrides));
};

export const createTestMarketListings = (count: number, overrides: Partial<TestMarketListing> = {}): TestMarketListing[] => {
  return Array.from({ length: count }, () => createTestMarketListing(overrides));
};

export const createTestWeatherDataPoints = (count: number, overrides: Partial<TestWeatherData> = {}): TestWeatherData[] => {
  return Array.from({ length: count }, () => createTestWeatherData(overrides));
};

export const createTestCropDiseaseDetections = (count: number, overrides: Partial<TestCropDiseaseDetection> = {}): TestCropDiseaseDetection[] => {
  return Array.from({ length: count }, () => createTestCropDiseaseDetection(overrides));
};

// Scenario-based factories for specific test cases

export const createFarmerWithMultipleFarms = () => {
  const user = createTestUser();
  const farms = createTestFarms(3, { user_id: user.id });
  const fields = farms.flatMap(farm => 
    createTestFields(faker.number.int({ min: 1, max: 4 }), { 
      farm_id: farm.id, 
      user_id: user.id 
    })
  );
  
  return { user, farms, fields };
};

export const createMarketScenario = () => {
  const listings = createTestMarketListings(20);
  const prices = cropTypes.map(crop => ({
    id: faker.string.uuid(),
    crop_name: crop,
    price: faker.number.float({ min: 20, max: 200, fractionDigits: 2 }),
    currency: 'KES',
    location: faker.helpers.arrayElement(kenyanLocations).name,
    date_recorded: faker.date.recent().toISOString(),
    source: 'market_survey',
  }));
  
  return { listings, prices };
};

export const createWeatherScenario = () => {
  const currentWeather = createTestWeatherData();
  const forecast = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + 1);
    
    return createTestWeatherData({
      recorded_at: date.toISOString(),
    });
  });
  
  return { currentWeather, forecast };
};

export const createCropDiseaseScenario = () => {
  const detections = createTestCropDiseaseDetections(10);
  const commonDiseases = diseaseNames.map(disease => ({
    name: disease,
    frequency: faker.number.int({ min: 1, max: 50 }),
    severity_distribution: {
      low: faker.number.int({ min: 10, max: 40 }),
      medium: faker.number.int({ min: 20, max: 50 }),
      high: faker.number.int({ min: 5, max: 30 }),
    },
  }));
  
  return { detections, commonDiseases };
};

// Edge case factories for testing error scenarios

export const createInvalidUser = (): Partial<TestUser> => ({
  id: '',
  email: 'invalid-email',
  full_name: '',
  phone: 'invalid-phone',
  farm_size: -1,
  credits_balance: -10,
});

export const createExpiredMarketListing = (): TestMarketListing => 
  createTestMarketListing({
    status: 'expired',
    created_at: faker.date.past({ years: 1 }).toISOString(),
  });

export const createSevereWeatherAlert = (): TestWeatherData => 
  createTestWeatherData({
    weather_condition: 'thunderstorm',
    rainfall: faker.number.float({ min: 50, max: 100 }),
    wind_speed: faker.number.float({ min: 25, max: 50 }),
  });

export const createHighSeverityDiseaseDetection = (): TestCropDiseaseDetection => 
  createTestCropDiseaseDetection({
    severity: 'high',
    confidence_score: faker.number.float({ min: 0.9, max: 0.99 }),
    affected_area_percentage: faker.number.int({ min: 60, max: 90 }),
  });