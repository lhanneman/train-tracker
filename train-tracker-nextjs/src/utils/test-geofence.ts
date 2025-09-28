import { validateGeofence, getContainingZones, getNearestZone } from '@/lib/geofence-utils';
import { GEOFENCE_ZONES } from '@/config/geofence';

// Test utility to validate geo-fence coordinates
// You can call this from browser console or create a test API endpoint

export function testGeofenceCoordinates(lat: number, lng: number, accuracy = 50) {
  console.log(`\n=== Testing coordinates: ${lat}, ${lng} ===`);

  // Test validation
  const validation = validateGeofence(lat, lng, accuracy);
  console.log('Validation result:', validation);

  // Test which zones contain the point
  const zones = getContainingZones({ lat, lng });
  console.log('Containing zones:', zones.map(z => z.name));

  // Test nearest zone
  const nearest = getNearestZone({ lat, lng });
  if (nearest) {
    console.log(`Nearest zone: ${nearest.zone.name} (${Math.round(nearest.distance)}m away)`);
  }

  return {
    isValid: validation.isValid,
    reason: validation.reason,
    zones: zones.map(z => z.name),
    nearest: nearest ? {
      name: nearest.zone.name,
      distance: Math.round(nearest.distance)
    } : null
  };
}

// Test various locations
export function runGeofenceTests() {
  console.log('Running geo-fence tests...\n');

  // Show configured zones
  console.log('Configured zones:');
  GEOFENCE_ZONES.forEach(zone => {
    console.log(`- ${zone.name}: ${zone.description} (${zone.polygon.length} points)`);
    if (zone.isTestZone) console.log('  (TEST ZONE)');
  });

  console.log('\n--- Test Results ---');

  // Test center of first polygon (should be inside)
  const firstZone = GEOFENCE_ZONES[0];
  if (firstZone) {
    const centerLat = firstZone.polygon.reduce((sum, p) => sum + p.lat, 0) / firstZone.polygon.length;
    const centerLng = firstZone.polygon.reduce((sum, p) => sum + p.lng, 0) / firstZone.polygon.length;

    console.log(`\nTesting center of ${firstZone.name}:`);
    testGeofenceCoordinates(centerLat, centerLng);
  }

  // Test a clearly outside location
  console.log('\nTesting clearly outside location (Portland airport):');
  testGeofenceCoordinates(45.5898, -122.5951);

  // Test example coordinates from your config
  console.log('\nTesting first polygon point:');
  if (GEOFENCE_ZONES[0]?.polygon[0]) {
    const point = GEOFENCE_ZONES[0].polygon[0];
    testGeofenceCoordinates(point.lat, point.lng);
  }
}

// Browser console helper
if (typeof window !== 'undefined') {
  (window as unknown as { testGeofence: typeof testGeofenceCoordinates }).testGeofence = testGeofenceCoordinates;
  (window as unknown as { runGeofenceTests: typeof runGeofenceTests }).runGeofenceTests = runGeofenceTests;
  console.log('Geo-fence test functions loaded:');
  console.log('- testGeofence(lat, lng, accuracy?)');
  console.log('- runGeofenceTests()');
}