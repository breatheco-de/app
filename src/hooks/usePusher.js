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
    const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY || '';
    const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2';

    console.log('[Pusher] Checking configuration - PUSHER_KEY exists:', !!PUSHER_KEY, 'PUSHER_CLUSTER:', PUSHER_CLUSTER);

    if (!PUSHER_KEY) {
      console.warn('[Pusher] ⚠️ Pusher key not configured. Surveys will not work.');
      console.warn('[Pusher] Please set NEXT_PUBLIC_PUSHER_KEY in your .env file');
      return undefined;
    }

    console.log('[Pusher] ✅ PUSHER_KEY found, initializing Pusher...');
    console.log('[Pusher] Initializing Pusher with cluster:', PUSHER_CLUSTER);

    // Initialize Pusher
    const pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      encrypted: true,
    });

    // Add connection event listeners for debugging
    pusher.connection.bind('connected', () => {
      console.log('[Pusher] Connected to Pusher');
    });

    pusher.connection.bind('disconnected', () => {
      console.log('[Pusher] Disconnected from Pusher');
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
