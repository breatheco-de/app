import { findCampusBySlug, listedLocations } from './locations';

const EARTH_RADIUS_KM = 6371;

const USA_CANADA = new Set(['US', 'CA']);
const LATAM = new Set([
  'MX', 'GT', 'BZ', 'SV', 'HN', 'NI', 'CR', 'PA',
  'CO', 'VE', 'EC', 'PE', 'BO', 'CL', 'AR', 'UY', 'PY', 'BR',
  'CU', 'DO', 'PR', 'JM', 'HT', 'TT',
]);
const EUROPE = new Set([
  'ES', 'PT', 'FR', 'DE', 'IT', 'GB', 'IE', 'NL', 'BE', 'AT', 'CH',
  'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'GR', 'SE', 'NO', 'DK', 'FI',
]);

export function getRegionFromCountry(countryCode) {
  const code = (countryCode || '').toUpperCase();
  if (USA_CANADA.has(code)) return 'usa-canada';
  if (LATAM.has(code)) return 'latam';
  if (EUROPE.has(code)) return 'europe';
  return null;
}

export function haversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos((lat1 * Math.PI) / 180)
    * Math.cos((lat2 * Math.PI) / 180)
    * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function closest(lat, lon, campuses) {
  return campuses.reduce((best, loc) => {
    const distance = haversineDistance(lat, lon, loc.latitude, loc.longitude);
    if (!best || distance < best.distance) return { loc, distance };
    return best;
  }, null)?.loc;
}

function withReliable(campus, reliable) {
  return campus ? { ...campus, reliable } : null;
}

export function getBrowserLanguage() {
  if (typeof navigator === 'undefined') return 'en';
  const list = navigator.languages
    || [navigator.language, navigator.browserLanguage, navigator.systemLanguage, navigator.userLanguage];
  const first = (list.find(Boolean) || 'en').toString();
  return first.slice(0, 2).toLowerCase();
}

function fallbackByLanguage(browserLang, catalog) {
  const lang = browserLang === 'es' ? 'es' : 'en';
  const byLang = catalog.filter((loc) => loc.default_language === lang);
  const preferred = lang === 'es' ? 'madrid-spain' : 'miami-usa';
  const hit = byLang.find((loc) => loc.slug === preferred)
    || byLang[0]
    || catalog.find((loc) => loc.slug === 'miami-usa')
    || catalog[0];
  return withReliable(hit, false);
}

export function findLocationForUser(geo, browserLang, catalog = listedLocations()) {
  const listed = catalog.filter((loc) => loc.visibility === 'listed' && loc.slug !== 'online');

  if (geo?.latitude != null && geo?.longitude != null && geo?.country_code) {
    const inCountry = listed.filter((loc) => loc.country_code === geo.country_code);
    if (inCountry.length) {
      const cityHit = inCountry.find(
        (loc) => loc.city.toLowerCase() === (geo.city || '').toLowerCase(),
      );
      if (cityHit) return withReliable(cityHit, true);
      return withReliable(closest(geo.latitude, geo.longitude, inCountry), true);
    }

    const region = getRegionFromCountry(geo.country_code);
    if (region) {
      const inRegion = listed.filter((loc) => loc.region === region);
      if (inRegion.length) {
        return withReliable(closest(geo.latitude, geo.longitude, inRegion), true);
      }
    }

    return withReliable(closest(geo.latitude, geo.longitude, listed), true);
  }

  return fallbackByLanguage(browserLang, listed);
}

export function resolveCampusFromQuery(slug) {
  const campus = findCampusBySlug(slug);
  return campus ? withReliable(campus, true) : null;
}

/**
 * Public app `location` keeps geo fields used by checkout/pricing (`countryShort`)
 * and adds the canonical campus slug.
 */
export function buildAppLocation({ geo, campus }) {
  if (!campus && !geo) return null;

  const latitude = geo?.latitude ?? campus?.latitude ?? null;
  const longitude = geo?.longitude ?? campus?.longitude ?? null;

  return {
    slug: campus?.slug || null,
    name: campus?.name || geo?.city || null,
    city: geo?.city || campus?.city || null,
    country: geo?.country || campus?.country || null,
    countryShort: geo?.country_code || campus?.country_code || null,
    country_code: geo?.country_code || campus?.country_code || null,
    region: geo?.region || null,
    campusRegion: campus?.region || null,
    timezone: geo?.timezone || campus?.timezone || null,
    coordinates: {
      latitude,
      longitude,
    },
    latitude,
    longitude,
    reliable: Boolean(campus?.reliable),
  };
}
