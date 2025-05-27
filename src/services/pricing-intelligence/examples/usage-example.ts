import { PricingIntelligenceService } from '../pricing-intelligence.service';
import { MarketDataResponse } from '../models/types';
import { format } from 'date-fns';

/**
 * Example usage of the PricingIntelligenceService
 * This demonstrates how to integrate the service in a real application
 */

// Environment variables would typically be set in a .env file
process.env.WFP_API_KEY = 'your_wfp_api_key';
process.env.TRADING_ECONOMICS_API_KEY = 'your_te_api_key';
process.env.OPEN_EXCHANGE_RATES_APP_ID = 'your_oxr_app_id';

// Example crop and location data
const CROPS = [
  'maize', 'wheat', 'rice', 'sorghum', 'millet',
  'cassava', 'sweet_potato', 'cowpea', 'groundnut', 'soybean'
];

const LOCATIONS = [
  'Nairobi', 'Kampala', 'Dar es Salaam', 'Kigali', 'Lagos',
  'Accra', 'Abidjan', 'Dakar', 'Lusaka', 'Harare'
];

/**
 * Main function to demonstrate the Pricing Intelligence Service
 */
async function main() {
  try {
    console.log('🚀 Starting Pricing Intelligence Service Demo\n');
    
    // Get the service instance
    const pricingService = PricingIntelligenceService.getInstance();
    
    // Example 1: Get market data for a specific crop and location
    await exampleGetMarketData(pricingService);
    
    // Example 2: Get market data with currency conversion
    await exampleWithCurrencyConversion(pricingService);
    
    // Example 3: Get market data in different output modes
    await exampleWithDifferentModes(pricingService);
    
    // Example 4: Get market data in different languages
    await exampleWithDifferentLanguages(pricingService);
    
    // Example 5: Batch process multiple crops and locations
    await exampleBatchProcessing(pricingService);
    
    console.log('\n✅ Demo completed successfully!');
  } catch (error) {
    console.error('❌ Error in demo:', error);
    process.exit(1);
  }
}

/**
 * Example 1: Basic usage - get market data for a specific crop and location
 */
async function exampleGetMarketData(service: PricingIntelligenceService) {
  console.log('📊 Example 1: Basic Market Data\n');
  
  const crop = 'maize';
  const location = 'Nairobi';
  
  console.log(`Fetching market data for ${crop} in ${location}...\n`);
  
  const result = await service.getMarketData(crop, location);
  
  console.log('📈 Market Data Result:');
  console.log(formatMarketData(result));
  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Example 2: Get market data with currency conversion
 */
async function exampleWithCurrencyConversion(service: PricingIntelligenceService) {
  console.log('💱 Example 2: Currency Conversion\n');
  
  const crop = 'wheat';
  const location = 'Kampala';
  const currency = 'UGX'; // Ugandan Shilling
  
  console.log(`Fetching ${crop} prices in ${currency} for ${location}...\n`);
  
  const result = await service.getMarketData(crop, location, currency);
  
  console.log(`💰 Price in ${currency}:`);
  console.log(`- Current: ${result.price_today?.toFixed(2)} ${currency}`);
  console.log(`- Last Week: ${result.price_last_week?.toFixed(2)} ${currency}`);
  console.log(`- Change: ${result.change_pct?.toFixed(2)}%`);
  console.log(`- Trend: ${result.trend}`);
  console.log(`- Advice (${Object.keys(result.advice)[0]}): ${Object.values(result.advice)[0]}`);
  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Example 3: Get market data in different output modes
 */
async function exampleWithDifferentModes(service: PricingIntelligenceService) {
  console.log('🎛️  Example 3: Different Output Modes\n');
  
  const crop = 'rice';
  const location = 'Lagos';
  
  // Dashboard mode (default)
  const dashboardResult = await service.getMarketData(crop, location, 'NGN', 'dashboard');
  console.log('📊 Dashboard Mode (detailed):');
  console.log(formatMarketData(dashboardResult, true));
  
  // SMS mode (concise)
  const smsResult = await service.getMarketData(crop, location, 'NGN', 'sms');
  console.log('\n📱 SMS Mode (concise):');
  console.log(`💬 ${Object.values(smsResult.advice)[0]}`);
  
  // Pro API mode (raw data)
  const proResult = await service.getMarketData(crop, location, 'NGN', 'pro_api');
  console.log('\n🔧 Pro API Mode (raw data):');
  console.log(JSON.stringify(proResult, null, 2).substring(0, 300) + '...');
  
  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Example 4: Get market data in different languages
 */
async function exampleWithDifferentLanguages(service: PricingIntelligenceService) {
  console.log('🌍 Example 4: Multiple Languages\n');
  
  const crop = 'cassava';
  const location = 'Dakar';
  
  // English
  const enResult = await service.getMarketData(crop, location, 'XOF', 'dashboard', 'en');
  console.log('🇬🇧 English Advice:');
  console.log(`   ${enResult.advice.en}\n`);
  
  // French
  const frResult = await service.getMarketData(crop, location, 'XOF', 'dashboard', 'fr');
  console.log('🇫🇷 French Advice:');
  console.log(`   ${frResult.advice.fr}\n`);
  
  // Swahili
  const swResult = await service.getMarketData(crop, location, 'XOF', 'dashboard', 'sw');
  console.log('🇹🇿 Swahili Advice:');
  console.log(`   ${swResult.advice.sw}\n`);
  
  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Example 5: Batch process multiple crops and locations
 */
async function exampleBatchProcessing(service: PricingIntelligenceService) {
  console.log('🔄 Example 5: Batch Processing\n');
  
  // Get a random sample of crops and locations
  const sampleCrops = getRandomItems(CROPS, 3);
  const sampleLocations = getRandomItems(LOCATIONS, 2);
  
  console.log(`Processing ${sampleCrops.length} crops x ${sampleLocations.length} locations...\n`);
  
  // Process in parallel
  const requests = [];
  
  for (const crop of sampleCrops) {
    for (const location of sampleLocations) {
      requests.push(
        service.getMarketData(crop, location, 'USD', 'dashboard')
          .then(result => ({
            crop,
            location,
            price: result.price_today,
            trend: result.trend,
            advice: Object.values(result.advice)[0]
          }))
          .catch(error => ({
            crop,
            location,
            error: error.message
          }))
      );
    }
  }
  
  // Wait for all requests to complete
  const results = await Promise.all(requests);
  
  // Display results
  console.log('📋 Batch Results:');
  console.table(results);
  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Helper function to format market data for display
 */
function formatMarketData(data: MarketDataResponse, detailed: boolean = false): string {
  const lines = [
    `🌱 Crop: ${data.crop}`,
    `📍 Location: ${data.location}`,
    `💰 Price: ${data.price_today?.toFixed(2)} ${data.currency}`,
    `📅 Last Week: ${data.price_last_week?.toFixed(2)} ${data.currency}`,
    `📈 Change: ${data.change_pct?.toFixed(2)}%`,
    `📊 Trend: ${data.trend}`,
    `📊 Volatility: ${(data.volatility_score * 100).toFixed(1)}%`,
    `🚨 Anomaly: ${data.anomaly_flag ? '⚠️ Detected' : '✅ Normal'}`,
    `💡 Advice: ${Object.values(data.advice)[0]}`,
    `📡 Source: ${data.source}`,
    `🔄 Updated: ${new Date(data.updated_at).toLocaleString()}`
  ];
  
  if (detailed && 'metadata' in data) {
    const meta = data.metadata as any;
    if (meta.min_price) lines.push(`📉 Min Price: ${meta.min_price.toFixed(2)} ${data.currency}`);
    if (meta.max_price) lines.push(`📈 Max Price: ${meta.max_price.toFixed(2)} ${data.currency}`);
    if (meta.confidence_indicators) {
      lines.push('\n🔍 Confidence Indicators:');
      lines.push(`   Data Freshness: ${(meta.confidence_indicators.data_freshness * 100).toFixed(0)}%`);
      lines.push(`   Source Reliability: ${(meta.confidence_indicators.source_reliability * 100).toFixed(0)}%`);
      lines.push(`   Data Consistency: ${(meta.confidence_indicators.data_consistency * 100).toFixed(0)}%`);
    }
  }
  
  return lines.join('\n');
}

/**
 * Helper function to get random items from an array
 */
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Run the example
main().catch(console.error);
