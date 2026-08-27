/* eslint-disable camelcase */
import React, { createContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { isWindow, getQueryString } from '../utils';
import { loadUserSession, saveUserSession } from '../utils/sessionCookie';
import { error } from '../utils/logging';
import {
  buildAppLocation,
  findLocationForUser,
  getBrowserLanguage,
  resolveCampusFromQuery,
} from '../lib/findLocationForUser';

const LOCATION_STALE_MS = 24 * 60 * 60 * 1000;
const CLIENT_GEO_TIMEOUT_MS = 2500;
const WAIT_FOR_LOCATION_MS = 3000;

const initialUserSession = {
  utm_placement: '', // the ad placement
  utm_referrer: '', // The person or copmany who refered the user
  utm_medium: '', // facebook, tiktok, Instagram, google
  utm_source: '', // cpc, organic, etc.
  utm_term: '', // keyword from cpc
  utm_content: '', // banner or ad id
  utm_campaign: '', // campaign name
  conversion_url: '', // last URL the user saw before starting the checkout process.
  landing_url: '', // first URL the user saw when coming into the website
  user_agent: '', // front end user agent
  internal_cta_placement: '',
  internal_cta_content: '',
  internal_cta_campaign: '',
  ref: '',
};

export const SessionContext = createContext({
  userSession: initialUserSession,
  location: null,
  geo: null,
  campus: null,
  isLoadingLocation: true,
  waitForLocation: async () => null,
});

function isLocationFresh(campus, geo, timestamp) {
  const resolvedAt = geo?.resolved_at || campus?.resolved_at || timestamp;
  if (!resolvedAt) return false;
  return Date.now() - resolvedAt < LOCATION_STALE_MS;
}

function createLocationGate() {
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });
  return { promise, resolve, settled: false };
}

function readCachedLocationState() {
  if (typeof window === 'undefined') {
    return { location: null, geo: null, campus: null, ready: false };
  }

  const stored = loadUserSession() || {};
  const queryCampus = resolveCampusFromQuery(getQueryString('location'));
  if (queryCampus) {
    return {
      location: buildAppLocation({ geo: stored.geo, campus: queryCampus }),
      geo: stored.geo || null,
      campus: queryCampus,
      ready: true,
    };
  }

  const storedCampus = stored.location?.slug ? stored.location : null;
  const storedGeo = stored.geo || null;
  const fresh = storedCampus?.reliable !== false
    && isLocationFresh(storedCampus, storedGeo, stored.timestamp);

  if (storedCampus && fresh) {
    return {
      location: buildAppLocation({ geo: storedGeo, campus: storedCampus }),
      geo: storedGeo,
      campus: storedCampus,
      ready: true,
    };
  }

  return { location: null, geo: null, campus: null, ready: false };
}

function SessionProvider({ children }) {
  const [userSession, setUserSession] = useState(initialUserSession);
  const router = useRouter();
  const cachedLocation = useRef(readCachedLocationState());
  const locationGateRef = useRef(null);
  if (!locationGateRef.current) {
    locationGateRef.current = createLocationGate();
    if (cachedLocation.current.ready) {
      locationGateRef.current.settled = true;
      locationGateRef.current.resolve(cachedLocation.current.location);
    }
  }
  const [location, setLocation] = useState(cachedLocation.current.location);
  const [geo, setGeo] = useState(cachedLocation.current.geo);
  const [campus, setCampus] = useState(cachedLocation.current.campus);
  const [isLoadingLocation, setIsLoadingLocation] = useState(!cachedLocation.current.ready);
  const locationRef = useRef(cachedLocation.current.location);

  const persistCampus = (nextCampus, nextGeo, sessionBase = userSession) => {
    const campusWithTs = nextCampus
      ? { ...nextCampus, resolved_at: Date.now() }
      : null;
    const geoWithTs = nextGeo
      ? { ...nextGeo, resolved_at: Date.now() }
      : nextGeo;
    saveUserSession({
      ...sessionBase,
      location: campusWithTs,
      geo: geoWithTs,
    });
    setUserSession((prev) => ({
      ...prev,
      ...sessionBase,
      location: campusWithTs,
      geo: geoWithTs,
    }));
    return { campusWithTs, geoWithTs };
  };

  const settleLocation = (appLocation) => {
    locationRef.current = appLocation;
    const gate = locationGateRef.current;
    if (gate && !gate.settled) {
      gate.settled = true;
      gate.resolve(appLocation);
    }
  };

  const applyResolved = (nextCampus, nextGeo) => {
    const appLocation = buildAppLocation({ geo: nextGeo, campus: nextCampus });
    setCampus(nextCampus);
    setGeo(nextGeo || null);
    setLocation(appLocation);
    settleLocation(appLocation);
  };

  const languageFallbackLocation = () => {
    const fallbackCampus = findLocationForUser(null, getBrowserLanguage());
    return buildAppLocation({ geo: null, campus: fallbackCampus });
  };

  const waitForLocation = () => {
    if (locationGateRef.current.settled) {
      return Promise.resolve(locationRef.current);
    }

    return Promise.race([
      locationGateRef.current.promise,
      new Promise((resolve) => {
        setTimeout(() => {
          if (!locationGateRef.current.settled) {
            settleLocation(locationRef.current || languageFallbackLocation());
          }
          resolve(locationRef.current);
        }, WAIT_FOR_LOCATION_MS);
      }),
    ]);
  };

  const fetchGeo = async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CLIENT_GEO_TIMEOUT_MS);
    try {
      const response = await fetch('/api/geo', { signal: controller.signal });
      const data = await response.json();
      if (data?.status !== 'success') return null;
      const { status, ...rest } = data;
      return rest;
    } catch (e) {
      error('function fetchGeo()', e);
      return null;
    } finally {
      clearTimeout(timer);
    }
  };

  const initLocation = async (sessionBase = userSession) => {
    try {
      const stored = loadUserSession() || sessionBase || {};
      const queryCampus = resolveCampusFromQuery(getQueryString('location'));

      if (queryCampus) {
        const storedGeo = stored.geo || null;
        persistCampus(queryCampus, storedGeo, stored);
        applyResolved(queryCampus, storedGeo);
        return;
      }

      const storedCampus = stored.location?.slug ? stored.location : null;
      const storedGeo = stored.geo || null;
      const fresh = storedCampus?.reliable !== false
        && isLocationFresh(storedCampus, storedGeo, stored.timestamp);

      if (storedCampus && fresh) {
        applyResolved(storedCampus, storedGeo);
        return;
      }

      const nextGeo = storedGeo && isLocationFresh(null, storedGeo, stored.timestamp)
        ? storedGeo
        : await fetchGeo();
      const nextCampus = findLocationForUser(nextGeo, getBrowserLanguage());
      persistCampus(nextCampus, nextGeo, stored);
      applyResolved(nextCampus, nextGeo);
    } catch (e) {
      error('function initLocation()', e);
      const fallback = findLocationForUser(null, getBrowserLanguage());
      applyResolved(fallback, null);
    } finally {
      if (locationRef.current) {
        settleLocation(locationRef.current);
      } else {
        const fallback = findLocationForUser(null, getBrowserLanguage());
        applyResolved(fallback, null);
      }
      setIsLoadingLocation(false);
    }
  };

  useEffect(() => {
    if (cachedLocation.current.ready) {
      settleLocation(cachedLocation.current.location);
    }
    if (isWindow) {
      initLocation();
    }
  }, []);

  const setConversionUrl = () => {
    if (isWindow) {
      if (['/checkout', '/pricing'].some((path) => window.location.pathname.includes(path))) return;
      const session = {
        ...userSession,
        conversion_url: window.location.pathname,
      };
      setUserSession(session);
      saveUserSession(session);
    }
  };

  // validate non authorized and authorized users session information
  const handleUserSession = () => {
    if (isWindow) {
      const storedSession = loadUserSession() || {};
      const { userAgent } = window.navigator;
      const landingUrl = storedSession?.landing_url && storedSession?.landing_url !== '' ? storedSession?.landing_url : window.location.pathname;

      let conversionUrl;
      if (['/checkout', '/pricing'].some((path) => window.location.pathname.includes(path))) conversionUrl = storedSession?.conversion_url;
      else conversionUrl = window.location.pathname;

      const utm_placement = getQueryString('utm_placement') || storedSession?.utm_placement;
      const utm_referrer = getQueryString('utm_referrer') || getQueryString('utm_ref') || getQueryString('referrer') || getQueryString('ref') || storedSession?.utm_referrer;
      const utm_medium = getQueryString('utm_medium') || storedSession?.utm_medium;
      const utm_source = getQueryString('utm_source') || storedSession?.utm_source;
      const utm_term = getQueryString('utm_term') || storedSession?.utm_term;
      const utm_content = getQueryString('utm_content') || storedSession?.utm_content;
      const utm_campaign = getQueryString('utm_campaign') || storedSession?.utm_campaign;
      const internal_cta_placement = getQueryString('internal_cta_placement') || storedSession?.internal_cta_placement;
      const internal_cta_content = getQueryString('internal_cta_content') || storedSession?.internal_cta_content;
      const internal_cta_campaign = getQueryString('internal_cta_campaign') || storedSession?.internal_cta_campaign;
      const ref = getQueryString('ref') || storedSession?.ref;

      // remove translations for the endpoint
      const cleanedStore = {
        ...storedSession,
        translations: undefined,
      };

      const session = {
        ...cleanedStore,
        user_agent: userAgent,
        landing_url: landingUrl,
        conversion_url: conversionUrl,
        utm_placement,
        utm_referrer,
        utm_medium,
        utm_source,
        utm_term,
        utm_content,
        utm_campaign,
        internal_cta_placement,
        internal_cta_content,
        internal_cta_campaign,
        ref,
      };
      setUserSession(session);
      saveUserSession(session);
    }
  };

  useEffect(() => {
    handleUserSession();
  }, [router]);

  return (
    <SessionContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{
        userSession,
        setUserSession: (session) => {
          const newSession = {
            ...userSession,
            ...session,
          };
          saveUserSession(newSession);
          setUserSession(newSession);
        },
        location,
        geo,
        campus,
        isLoadingLocation,
        waitForLocation,
        setConversionUrl,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

SessionProvider.propTypes = {
  children: PropTypes.node,
};

SessionProvider.defaultProps = {
  children: null,
};

export default SessionProvider;
