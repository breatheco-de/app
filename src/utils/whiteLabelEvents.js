import bc from '../services/breathecode';
import { isWhiteLabelAcademy, WHITE_LABEL_ACADEMY } from './variables';

const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

export function areWhiteLabelEventsEnabled(features) {
  if (!isWhiteLabelAcademy || !WHITE_LABEL_ACADEMY) return true;
  if (!features) return true;
  return getNestedValue(features, 'events.enabled') !== false;
}

export function shouldFilterEventsByAcademy(features) {
  if (!isWhiteLabelAcademy || !WHITE_LABEL_ACADEMY) return false;
  if (!features) return true;
  return getNestedValue(features, 'events.allow_other_academy_events') === false;
}

export async function getWhiteLabelAcademyFeatures() {
  if (!isWhiteLabelAcademy || !WHITE_LABEL_ACADEMY) return null;
  try {
    const { data } = await bc.admissions().getAcademy(WHITE_LABEL_ACADEMY);
    return data?.academy_features || null;
  } catch (error) {
    console.error('Failed to fetch white label academy features for events:', error);
    return null;
  }
}

export function buildPublicEventsQueryParams(baseParams = {}, features) {
  const params = { ...baseParams };
  if (!isWhiteLabelAcademy || !WHITE_LABEL_ACADEMY) return params;
  if (!areWhiteLabelEventsEnabled(features)) return null;
  if (shouldFilterEventsByAcademy(features)) {
    params.academy = WHITE_LABEL_ACADEMY;
  }
  return params;
}

export function isEventVisibleForWhiteLabel(event, features) {
  if (!event) return false;
  if (!isWhiteLabelAcademy || !WHITE_LABEL_ACADEMY) return true;
  if (!areWhiteLabelEventsEnabled(features)) return false;
  if (!shouldFilterEventsByAcademy(features)) return true;
  const eventAcademyId = event?.academy?.id ?? event?.academy_id ?? event?.academy;
  if (eventAcademyId == null) return false;
  return String(eventAcademyId) === String(WHITE_LABEL_ACADEMY);
}

export async function fetchEventsForStaticGeneration(extraParams = {}) {
  const features = await getWhiteLabelAcademyFeatures();
  if (!areWhiteLabelEventsEnabled(features)) return [];
  const query = buildPublicEventsQueryParams({
    status: 'ACTIVE,FINISHED',
    all_time: true,
    ...extraParams,
  }, features);
  if (!query) return [];
  try {
    const { data } = await bc.events(query).allEvents();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch events for static generation:', error);
    return [];
  }
}
