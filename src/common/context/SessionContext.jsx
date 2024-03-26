/* eslint-disable camelcase */
import React, { createContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { isWindow, getQueryString } from '../../utils';

const initialState = {
  utm_placement: '', // the ad placement
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
};

export const SessionContext = createContext({
  ...initialState,
});

function SessionProvider({ children }) {
  const [userSession, setUserSession] = useState(initialState);
  const router = useRouter();

  const setConversionUrl = () => {
    if (isWindow) {
      if (['/checkout', '/pricing'].some((path) => window.location.pathname.includes(path))) return;
      const session = {
        ...userSession,
        conversion_url: window.location.pathname,
      };
      setUserSession(session);
      localStorage.setItem('userSession', JSON.stringify(session));
    }
  };

  // validate non authorized and authorized users session information
  const handleUserSession = () => {
    if (isWindow) {
      const storedSession = JSON.parse(localStorage.getItem('userSession'));
      const { userAgent } = window.navigator;
      const landingUrl = storedSession?.landing_url && storedSession?.landing_url !== '' ? storedSession?.landing_url : window.location.pathname;

      let conversionUrl;
      if (['/checkout', '/pricing'].some((path) => window.location.pathname.includes(path))) conversionUrl = storedSession?.conversion_url;
      else conversionUrl = window.location.pathname;

      const utm_placement = getQueryString('utm_placement') || storedSession?.utm_placement;
      const utm_medium = getQueryString('utm_medium') || storedSession?.utm_medium;
      const utm_source = getQueryString('utm_source') || storedSession?.utm_source;
      const utm_term = getQueryString('utm_term') || storedSession?.utm_term;
      const utm_content = getQueryString('utm_content') || storedSession?.utm_content;
      const utm_campaign = getQueryString('utm_campaign') || storedSession?.utm_campaign;
      const internal_cta_placement = getQueryString('internal_cta_placement') || storedSession?.internal_cta_placement;
      const internal_cta_content = getQueryString('internal_cta_content') || storedSession?.internal_cta_content;
      const internal_cta_campaign = getQueryString('internal_cta_campaign') || storedSession?.internal_cta_campaign;

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
        utm_medium,
        utm_source,
        utm_term,
        utm_content,
        utm_campaign,
        internal_cta_placement,
        internal_cta_content,
        internal_cta_campaign,
      };
      setUserSession(session);
      localStorage.setItem('userSession', JSON.stringify(session));
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
          localStorage.setItem('userSession', JSON.stringify(session));
          setUserSession({
            ...userSession,
            ...session,
          });
        },
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
