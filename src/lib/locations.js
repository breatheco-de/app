/**
 * Canonical 4Geeks campus catalog. Slugs must stay aligned with CRM / website-v3.
 * city names are English, matching ip-api.
 */
const locations = [
  // usa-canada
  { slug: 'atlanta-usa', name: 'Atlanta', city: 'Atlanta', country: 'United States', country_code: 'US', latitude: 33.749, longitude: -84.388, region: 'usa-canada', default_language: 'en', timezone: 'America/New_York', visibility: 'listed' },
  { slug: 'austin-usa', name: 'Austin', city: 'Austin', country: 'United States', country_code: 'US', latitude: 30.2672, longitude: -97.7431, region: 'usa-canada', default_language: 'en', timezone: 'America/Chicago', visibility: 'listed' },
  { slug: 'chicago-usa', name: 'Chicago', city: 'Chicago', country: 'United States', country_code: 'US', latitude: 41.8781, longitude: -87.6298, region: 'usa-canada', default_language: 'en', timezone: 'America/Chicago', visibility: 'listed' },
  { slug: 'dallas-usa', name: 'Dallas', city: 'Dallas', country: 'United States', country_code: 'US', latitude: 32.7767, longitude: -96.797, region: 'usa-canada', default_language: 'en', timezone: 'America/Chicago', visibility: 'listed' },
  { slug: 'houston-usa', name: 'Houston', city: 'Houston', country: 'United States', country_code: 'US', latitude: 29.7604, longitude: -95.3698, region: 'usa-canada', default_language: 'en', timezone: 'America/Chicago', visibility: 'listed' },
  { slug: 'losangeles-usa', name: 'Los Angeles', city: 'Los Angeles', country: 'United States', country_code: 'US', latitude: 34.0522, longitude: -118.2437, region: 'usa-canada', default_language: 'en', timezone: 'America/Los_Angeles', visibility: 'listed' },
  { slug: 'miami-usa', name: 'Miami', city: 'Miami', country: 'United States', country_code: 'US', latitude: 25.7617, longitude: -80.1918, region: 'usa-canada', default_language: 'en', timezone: 'America/New_York', visibility: 'listed' },
  { slug: 'newyork-usa', name: 'New York', city: 'New York', country: 'United States', country_code: 'US', latitude: 40.7128, longitude: -74.006, region: 'usa-canada', default_language: 'en', timezone: 'America/New_York', visibility: 'listed' },
  { slug: 'orlando-usa', name: 'Orlando', city: 'Orlando', country: 'United States', country_code: 'US', latitude: 28.5383, longitude: -81.3792, region: 'usa-canada', default_language: 'en', timezone: 'America/New_York', visibility: 'listed' },
  { slug: 'tampa-usa', name: 'Tampa', city: 'Tampa', country: 'United States', country_code: 'US', latitude: 27.9506, longitude: -82.4572, region: 'usa-canada', default_language: 'en', timezone: 'America/New_York', visibility: 'listed' },
  { slug: 'toronto-canada', name: 'Toronto', city: 'Toronto', country: 'Canada', country_code: 'CA', latitude: 43.6532, longitude: -79.3832, region: 'usa-canada', default_language: 'en', timezone: 'America/Toronto', visibility: 'listed' },

  // europe
  { slug: 'barcelona-spain', name: 'Barcelona', city: 'Barcelona', country: 'Spain', country_code: 'ES', latitude: 41.3851, longitude: 2.1734, region: 'europe', default_language: 'es', timezone: 'Europe/Madrid', visibility: 'listed' },
  { slug: 'berlin-germany', name: 'Berlin', city: 'Berlin', country: 'Germany', country_code: 'DE', latitude: 52.52, longitude: 13.405, region: 'europe', default_language: 'en', timezone: 'Europe/Berlin', visibility: 'listed' },
  { slug: 'dublin-ireland', name: 'Dublin', city: 'Dublin', country: 'Ireland', country_code: 'IE', latitude: 53.3498, longitude: -6.2603, region: 'europe', default_language: 'en', timezone: 'Europe/Dublin', visibility: 'listed' },
  { slug: 'hamburg-germany', name: 'Hamburg', city: 'Hamburg', country: 'Germany', country_code: 'DE', latitude: 53.5511, longitude: 9.9937, region: 'europe', default_language: 'en', timezone: 'Europe/Berlin', visibility: 'listed' },
  { slug: 'lisbon-portugal', name: 'Lisbon', city: 'Lisbon', country: 'Portugal', country_code: 'PT', latitude: 38.7223, longitude: -9.1393, region: 'europe', default_language: 'en', timezone: 'Europe/Lisbon', visibility: 'listed' },
  { slug: 'madrid-spain', name: 'Madrid', city: 'Madrid', country: 'Spain', country_code: 'ES', latitude: 40.4168, longitude: -3.7038, region: 'europe', default_language: 'es', timezone: 'Europe/Madrid', visibility: 'listed' },
  { slug: 'malaga-spain', name: 'Malaga', city: 'Malaga', country: 'Spain', country_code: 'ES', latitude: 36.7213, longitude: -4.4214, region: 'europe', default_language: 'es', timezone: 'Europe/Madrid', visibility: 'listed' },
  { slug: 'milan-italy', name: 'Milan', city: 'Milan', country: 'Italy', country_code: 'IT', latitude: 45.4642, longitude: 9.19, region: 'europe', default_language: 'en', timezone: 'Europe/Rome', visibility: 'listed' },
  { slug: 'munich-germany', name: 'Munich', city: 'Munich', country: 'Germany', country_code: 'DE', latitude: 48.1351, longitude: 11.582, region: 'europe', default_language: 'en', timezone: 'Europe/Berlin', visibility: 'listed' },
  { slug: 'rome-italy', name: 'Rome', city: 'Rome', country: 'Italy', country_code: 'IT', latitude: 41.9028, longitude: 12.4964, region: 'europe', default_language: 'en', timezone: 'Europe/Rome', visibility: 'listed' },
  { slug: 'valencia-spain', name: 'Valencia', city: 'Valencia', country: 'Spain', country_code: 'ES', latitude: 39.4699, longitude: -0.3763, region: 'europe', default_language: 'es', timezone: 'Europe/Madrid', visibility: 'listed' },

  // latam
  { slug: 'bogota-colombia', name: 'Bogota', city: 'Bogota', country: 'Colombia', country_code: 'CO', latitude: 4.711, longitude: -74.0721, region: 'latam', default_language: 'es', timezone: 'America/Bogota', visibility: 'listed' },
  { slug: 'buenosaires-argentina', name: 'Buenos Aires', city: 'Buenos Aires', country: 'Argentina', country_code: 'AR', latitude: -34.6037, longitude: -58.3816, region: 'latam', default_language: 'es', timezone: 'America/Argentina/Buenos_Aires', visibility: 'listed' },
  { slug: 'caracas-venezuela', name: 'Caracas', city: 'Caracas', country: 'Venezuela', country_code: 'VE', latitude: 10.4806, longitude: -66.9036, region: 'latam', default_language: 'es', timezone: 'America/Caracas', visibility: 'listed' },
  { slug: 'costa-rica', name: 'Costa Rica', city: 'San Jose', country: 'Costa Rica', country_code: 'CR', latitude: 9.9281, longitude: -84.0907, region: 'latam', default_language: 'es', timezone: 'America/Costa_Rica', visibility: 'listed' },
  { slug: 'lapaz-bolivia', name: 'La Paz', city: 'La Paz', country: 'Bolivia', country_code: 'BO', latitude: -16.4897, longitude: -68.1193, region: 'latam', default_language: 'es', timezone: 'America/La_Paz', visibility: 'listed' },
  { slug: 'lima-peru', name: 'Lima', city: 'Lima', country: 'Peru', country_code: 'PE', latitude: -12.0464, longitude: -77.0428, region: 'latam', default_language: 'es', timezone: 'America/Lima', visibility: 'listed' },
  { slug: 'mexicocity-mexico', name: 'Mexico City', city: 'Mexico City', country: 'Mexico', country_code: 'MX', latitude: 19.4326, longitude: -99.1332, region: 'latam', default_language: 'es', timezone: 'America/Mexico_City', visibility: 'listed' },
  { slug: 'montevideo-uruguay', name: 'Montevideo', city: 'Montevideo', country: 'Uruguay', country_code: 'UY', latitude: -34.9011, longitude: -56.1645, region: 'latam', default_language: 'es', timezone: 'America/Montevideo', visibility: 'listed' },
  { slug: 'panamacity-panama', name: 'Panama City', city: 'Panama City', country: 'Panama', country_code: 'PA', latitude: 8.9824, longitude: -79.5199, region: 'latam', default_language: 'es', timezone: 'America/Panama', visibility: 'listed' },
  { slug: 'quito-ecuador', name: 'Quito', city: 'Quito', country: 'Ecuador', country_code: 'EC', latitude: -0.1807, longitude: -78.4678, region: 'latam', default_language: 'es', timezone: 'America/Guayaquil', visibility: 'listed' },
  { slug: 'santiago-chile', name: 'Santiago', city: 'Santiago', country: 'Chile', country_code: 'CL', latitude: -33.4489, longitude: -70.6693, region: 'latam', default_language: 'es', timezone: 'America/Santiago', visibility: 'listed' },
];

export const listedLocations = () => (
  locations.filter((loc) => loc.visibility === 'listed' && loc.slug !== 'online')
);

export const findCampusBySlug = (slug) => (
  listedLocations().find((loc) => loc.slug === slug) || null
);

export default locations;
