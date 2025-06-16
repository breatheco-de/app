import { useMemo } from 'react';
import { format, differenceInMinutes } from 'date-fns';

function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    console.error('Invalid date:', date);
    return '';
  }
  return format(d, "yyyyMMdd'T'HHmmss");
}

function getTimezoneOffset(date) {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    console.error('Invalid date:', date);
    return '';
  }
  const offsetMinutes = d.getTimezoneOffset();
  const sign = offsetMinutes > 0 ? '-' : '+';
  const hours = Math.floor(Math.abs(offsetMinutes) / 60).toString().padStart(2, '0');
  const minutes = (Math.abs(offsetMinutes) % 60).toString().padStart(2, '0');
  return `${sign}${hours}:${minutes}`;
}

function formatOutlookDate(date, offset) {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    console.error('Invalid date:', date);
    return '';
  }
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${offset}`;
}

function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return '0000';
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    console.error('Invalid dates:', { startTime, endTime });
    return '0000';
  }
  const diff = differenceInMinutes(end, start);
  const hours = Math.floor(diff / 60).toString().padStart(2, '0');
  const minutes = (diff % 60).toString().padStart(2, '0');
  return `${hours}${minutes}`;
}

function getRandomKey() {
  const n = Math.floor(Math.random() * 999999999999).toString();
  return `${Date.now()}_${n}`;
}

function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 768px)').matches;
}

function buildUrl(event, type) {
  let calendarUrl = '';

  switch (type) {
    case 'google':
      calendarUrl = 'https://calendar.google.com/calendar/render';
      calendarUrl += '?action=TEMPLATE';
      calendarUrl += `&dates=${formatTime(event.startTime)}/${formatTime(event.endTime)}`;
      calendarUrl += `&location=${encodeURIComponent(event.location)}`;
      calendarUrl += `&text=${encodeURIComponent(event.title)}`;
      calendarUrl += `&details=${encodeURIComponent(event.description)}`;
      break;

    case 'yahoo':
      calendarUrl = 'https://calendar.yahoo.com/?v=60&view=d&type=20';
      calendarUrl += `&title=${encodeURIComponent(event.title)}`;
      calendarUrl += `&st=${formatTime(event.startTime)}`;
      calendarUrl += `&dur=${calculateDuration(event.startTime, event.endTime)}`;
      calendarUrl += `&desc=${encodeURIComponent(event.description)}`;
      calendarUrl += `&in_loc=${encodeURIComponent(event.location)}`;
      break;

    case 'outlookcom': {
      calendarUrl = 'https://outlook.live.com/owa/?rru=addevent';
      const offset = getTimezoneOffset(event.startTime);
      calendarUrl += `&startdt=${encodeURIComponent(formatOutlookDate(event.startTime, offset))}`;
      calendarUrl += `&enddt=${encodeURIComponent(formatOutlookDate(event.endTime, offset))}`;
      calendarUrl += `&subject=${encodeURIComponent(event.title)}`;
      calendarUrl += `&location=${encodeURIComponent(event.location)}`;
      calendarUrl += `&body=${encodeURIComponent(event.description)}`;
      calendarUrl += '&allday=false';
      calendarUrl += `&uid=${getRandomKey()}`;
      calendarUrl += '&path=/calendar/view/Month';
      break;
    }

    case 'outlook':
    case 'apple':
    default: {
      const isCrappyIE = typeof window !== 'undefined' && /MSIE 9|MSIE 10|MSIE 11/.test(window.navigator?.userAgent);
      calendarUrl = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `URL:${typeof window !== 'undefined' ? document.URL : ''}`,
        `DTSTART:${formatTime(event.startTime)}`,
        `DTEND:${formatTime(event.endTime)}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description}`,
        `LOCATION:${event.location}`,
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\n');

      if (!isCrappyIE && isMobile()) {
        calendarUrl = encodeURI(`data:text/calendar;charset=utf8,${calendarUrl}`);
      }
      return calendarUrl;
    }
  }

  return calendarUrl;
}

const CALENDAR_TYPES = [
  { key: 'google', label: 'Google' },
  { key: 'outlookcom', label: 'Outlook.com' },
  { key: 'yahoo', label: 'Yahoo' },
  { key: 'apple', label: 'Apple Calendar' },
];

export default function useAddToCalendar(event) {
  return useMemo(() => {
    if (!event) return [];
    return CALENDAR_TYPES.map(({ key, label }) => ({
      key,
      label,
      url: buildUrl(event, key),
    }));
  }, [event]);
}

export { isMobile };

export function handleCalendarClick(url) {
  if (!isMobile() && (url.startsWith('data') || url.startsWith('BEGIN'))) {
    const filename = 'event.ics';
    let icsContent = url;
    if (url.startsWith('data')) {
      const commaIndex = url.indexOf(',');
      icsContent = decodeURIComponent(url.slice(commaIndex + 1));
    }
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    window.open(url, '_blank');
  }
}
