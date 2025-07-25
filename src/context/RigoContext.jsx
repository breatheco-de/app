/* eslint-disable camelcase */
import React, { useEffect, createContext, useState } from 'react';
import Script from 'next/script';
import PropTypes from 'prop-types';
import { reportDatalayer } from '../utils/requests';
import { isWindow, getBrowserInfo } from '../utils';

export const RigoContext = createContext({
  rigo: null,
  isRigoInitialized: false,
});

function RigoProvider({ children }) {
  const [isRigoInitialized, setIsRigoInitialized] = useState(false);

  useEffect(() => {
    if (isRigoInitialized) {
      window.rigo.on('open_bubble', (data) => {
        reportDatalayer({
          dataLayer: {
            event: 'rigobot_open_bubble',
            agent: getBrowserInfo(),
            ...data,
          },
        });
      });

      window.rigo.on('incoming_message', (data) => {
        reportDatalayer({
          dataLayer: {
            event: 'rigobot_incoming_message',
            agent: getBrowserInfo(),
            ...data,
          },
        });
      });
    }
  }, [isRigoInitialized]);

  return (
    <RigoContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{
        rigo: isWindow && window.rigo,
        isRigoInitialized,
      }}
    >
      <Script
        src="https://unpkg.com/rigo-ai@0.1.10/dist/main.js"
        onLoad={() => {
          window.rigo.init(process.env.RIGOBOT_HASH, {
            context: '',
          });
          window.rigo.show({
            showBubble: false,
          });
          setIsRigoInitialized(true);
        }}
      />
      {children}
    </RigoContext.Provider>
  );
}

RigoProvider.propTypes = {
  children: PropTypes.node,
};

RigoProvider.defaultProps = {
  children: null,
};

export default RigoProvider;
