const GEO_FIELDS = 'status,city,country,countryCode,regionName,timezone,lat,lon';
const TIMEOUT_MS = 5000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const LOCAL_IPS = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

const geoCache = new Map();

const isLocalIp = (ip) => !ip || LOCAL_IPS.has(ip);

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || '';
}

function normalizeGeo(data) {
  if (!data || data.status !== 'success') {
    return { status: 'fail' };
  }
  return {
    status: 'success',
    city: data.city || '',
    country: data.country || '',
    country_code: data.countryCode || '',
    region: data.regionName || '',
    timezone: data.timezone || '',
    latitude: data.lat,
    longitude: data.lon,
  };
}

function readCache(ip) {
  const entry = geoCache.get(ip);
  if (!entry) return null;
  if (Date.now() - entry.storedAt > CACHE_TTL_MS) {
    geoCache.delete(ip);
    return null;
  }
  return entry.geo;
}

function writeCache(ip, geo) {
  geoCache.set(ip, { geo, storedAt: Date.now() });
}

async function fetchIpApi(ip) {
  const key = process.env.IPAPI_PRO_KEY || process.env.NEXT_PUBLIC_IP_API_KEY || '';
  const pathIp = isLocalIp(ip) ? '' : ip;
  const url = key
    ? `https://pro.ip-api.com/json/${pathIp}?key=${encodeURIComponent(key)}&fields=${GEO_FIELDS}`
    : `http://ip-api.com/json/${pathIp}?fields=${GEO_FIELDS}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      return { status: 'fail' };
    }
    const data = await response.json();
    return normalizeGeo(data);
  } catch {
    return { status: 'fail' };
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ status: 'fail' });
    return;
  }

  const ip = clientIp(req);

  if (!isLocalIp(ip)) {
    const cached = readCache(ip);
    if (cached) {
      res.status(200).json(cached);
      return;
    }
  }

  const geo = await fetchIpApi(ip);
  if (geo.status !== 'success') {
    res.status(502).json(geo);
    return;
  }

  if (!isLocalIp(ip)) {
    writeCache(ip, geo);
  }

  res.status(200).json(geo);
}
