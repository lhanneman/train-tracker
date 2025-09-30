import { validateCrossingGeofence, getDistanceDescription, calculateDistanceInMeters } from '@/lib/geofence-crossings-utils';
import { TRAIN_CROSSINGS } from '@/config/geofence-crossings';

// Test the new crossing-based geofence implementation
export function testCrossingGeofence() {
  console.log('🚂 Testing Crossing-Based Geofence Implementation\n');
  console.log('='.repeat(50));

  // Show configured crossings
  console.log('📍 Configured Crossings:');
  TRAIN_CROSSINGS.forEach(crossing => {
    console.log(`  - ${crossing.name}: ${crossing.lat}, ${crossing.lng}`);
  });
  console.log('');

  // Test cases
  const testLocations = [
    {
      name: 'Your home location',
      lat: 40.9240,
      lng: -96.5270,
      accuracy: 30
    },
    {
      name: 'Near first crossing',
      lat: 40.9165,
      lng: -96.5265,
      accuracy: 25
    },
    {
      name: 'Near second crossing',
      lat: 40.9125,
      lng: -96.5325,
      accuracy: 20
    },
    {
      name: 'Between crossings',
      lat: 40.9145,
      lng: -96.5295,
      accuracy: 35
    },
    {
      name: 'Far from crossings',
      lat: 40.9000,
      lng: -96.5000,
      accuracy: 40
    }
  ];

  console.log('🧪 Test Results:\n');

  testLocations.forEach((location, index) => {
    console.log(`Test ${index + 1}: ${location.name}`);
    console.log(`  Location: ${location.lat}, ${location.lng}`);
    console.log(`  GPS Accuracy: ${location.accuracy}m`);

    // Calculate distances to each crossing
    console.log('  Distances to crossings:');
    TRAIN_CROSSINGS.forEach(crossing => {
      const distance = calculateDistanceInMeters(
        location.lat,
        location.lng,
        crossing.lat,
        crossing.lng
      );
      console.log(`    - ${crossing.name}: ${Math.round(distance)}m`);
    });

    // Validate geofence
    const result = validateCrossingGeofence(
      location.lat,
      location.lng,
      location.accuracy
    );

    console.log(`  ✓ Valid: ${result.isValid}`);
    console.log(`  ✓ In Range: ${result.isInRange}`);
    console.log(`  ✓ Reason: ${result.reason}`);

    // Get user-friendly description
    const description = getDistanceDescription(location.lat, location.lng);
    console.log(`  ✓ Description: ${description}`);

    console.log('');
  });

  console.log('='.repeat(50));
  console.log('\n✅ Test complete!');
  console.log('\nNote: Update the crossing coordinates in geofence-crossings.ts');
  console.log('with the actual train crossing locations for production use.');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testCrossingGeofence();
}