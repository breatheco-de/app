/* eslint-disable camelcase */
import React, { createContext, useState } from 'react';
import Script from 'next/script';
import PropTypes from 'prop-types';
import { isWindow } from '../../utils';

export const RigoContext = createContext({
  rigo: null,
  isRigoInitialized: false,
});

function RigoProvider({ children }) {
  const [isRigoInitialized, setIsRigoInitialized] = useState(false);

  return (
    <RigoContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{
        rigo: isWindow && window.rigo,
        isRigoInitialized,
      }}
    >
      <Script
        src="https://unpkg.com/rigobot-chat-bubble@0.0.59/dist/main.js"
        onLoad={() => {
<<<<<<< HEAD
          window.rigo.init(process.env.RIGOBOT_HASH, {
            context: '',
          });
          window.rigo.show({
            showBubble: false,
          });
          setIsRigoInitialized(true);
=======
          const persistedRigoChat = localStorage.getItem('rigo_chat');
          const allowRigo = getQueryString('rigo_chat', persistedRigoChat);
          if (allowRigo && allowRigo.toLowerCase() === 'true') {
            localStorage.setItem('rigo_chat', 'true');
            window.rigo.init(process.env.RIGOBOT_HASH, {
              context: '',
            });
            window.rigo.show({
              collapsed: true,
              showBubble: false,
            });
            setIsRigoInitialized(true);
          }
>>>>>>> e124a8acbcf9e0dc076fed9eb19fd3a3531c4689
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
