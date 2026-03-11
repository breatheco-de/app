import { useEffect, useState, useRef } from 'react';
import Pusher from 'pusher-js';
import PropTypes from 'prop-types';
import { isWindow } from '../utils';

function usePusher({ userId, onSurveyReceived, onCourseCompleted }) {
  const [pusherInstance, setPusherInstance] = useState(null);
  const [channel, setChannel] = useState(null);
  const pusherRef = useRef(null);
  const channelRef = useRef(null);

  useEffect(() => {
    console.log('[Pusher] useEffect triggered, userId:', userId, 'isWindow:', isWindow);
    if (!isWindow || !userId) {
      console.log('[Pusher] Skipping Pusher initialization - isWindow:', isWindow, 'userId:', userId);
      return undefined;
    }

    console.log('[Pusher] Passed initial checks, proceeding with initialization...');

    // Pusher configuration - these should be set as environment variables
    const SOKETI_KEY = process.env.NEXT_PUBLIC_SOKETI_KEY || '';
    const SOKETI_HOST = process.env.NEXT_PUBLIC_SOKETI_HOST || 'stream.4geeks.ai';
    const SOKETI_PORT = process.env.NEXT_PUBLIC_SOKETI_PORT || 443;

    console.log('[Pusher] Checking configuration - SOKETI_KEY exists:', !!SOKETI_KEY, 'SOKETI_HOST:', SOKETI_HOST);

    if (!SOKETI_KEY) {
      console.warn('[Pusher] ⚠️ Soketi key not configured. Surveys will not work.');
      console.warn('[Pusher] Please set NEXT_PUBLIC_SOKETI_KEY in your .env file');
      return undefined;
    }
    if (!SOKETI_HOST) {
      console.warn('[Pusher] ⚠️ Soketi host not configured. Surveys will not work.');
      console.warn('[Pusher] Please set NEXT_PUBLIC_SOKETI_HOST in your .env file');
      return undefined;
    }
    if (!SOKETI_PORT) {
      console.warn('[Pusher] ⚠️ Soketi port not configured. Surveys will not work.');
      console.warn('[Pusher] Please set NEXT_PUBLIC_SOKETI_PORT in your .env file');
      return undefined;
    }

    console.log('[Pusher] ✅ SOKETI_KEY found, initializing Pusher...');
    console.log('[Pusher] Initializing Pusher to connect to Soketi host:', SOKETI_HOST);

    // Initialize Pusher
    const pusher = new Pusher(SOKETI_KEY, {
      wsHost: SOKETI_HOST,
      wsPort: SOKETI_PORT,
      forceTLS: true,
      encrypted: true,
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
    });
    // Add connection event listeners for debugging
    pusher.connection.bind('connected', () => {
      console.log('[Pusher] Connected to Soketi');
    });

    pusher.connection.bind('disconnected', () => {
      console.log('[Pusher] Disconnected from Soketi');
    });

    pusher.connection.bind('error', (err) => {
      console.error('[Pusher] Connection error:', err);
    });

    pusherRef.current = pusher;
    setPusherInstance(pusher);

    // Subscribe to user's public channel
    const channelName = `public-user-${userId}`;
    console.log('[Pusher] Subscribing to channel:', channelName);
    const userChannel = pusher.subscribe(channelName);
    channelRef.current = userChannel;
    setChannel(userChannel);

    // Listen for subscription success
    userChannel.bind('pusher:subscription_succeeded', () => {
      console.log('[Pusher] Successfully subscribed to channel:', channelName);
    });

    // Listen for subscription errors
    userChannel.bind('pusher:subscription_error', (error) => {
      console.error('[Pusher] Subscription error:', error);
    });

    // Bind to survey event
    userChannel.bind('survey', (data) => {
      console.log('[Pusher] Survey event received:', data);
      // Check if this survey is triggered by course completion (graduation)
      const isCourseCompleted = data?.trigger_context?.trigger_type === 'course_completed';

      if (isCourseCompleted && onCourseCompleted && typeof onCourseCompleted === 'function') {
        console.log('[Pusher] Course completed detected, calling onCourseCompleted');
        // Call course completed callback with the survey data
        onCourseCompleted(data);
      }

      // Always call onSurveyReceived for all surveys (including course_completed)
      if (onSurveyReceived && typeof onSurveyReceived === 'function') {
        console.log('[Pusher] Calling onSurveyReceived');
        onSurveyReceived(data);
      }
    });

    // Cleanup function
    return function cleanup() {
      if (channelRef.current) {
        channelRef.current.unbind('survey');
        pusher.unsubscribe(`public-user-${userId}`);
      }
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    };
  }, [userId, onSurveyReceived, onCourseCompleted]);

  return { pusherInstance, channel };
}

usePusher.propTypes = {
  userId: PropTypes.number,
  onSurveyReceived: PropTypes.func,
  onCourseCompleted: PropTypes.func,
};

usePusher.defaultProps = {
  userId: null,
  onSurveyReceived: null,
  onCourseCompleted: null,
};

export default usePusher;
