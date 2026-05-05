/**
 * Google Calendar API integration for session booking events.
 *
 * Required env variables (OAuth2):
 *   GOOGLE_OAUTH_CLIENT_ID       — OAuth2 client ID
 *   GOOGLE_OAUTH_CLIENT_SECRET   — OAuth2 client secret
 *   GOOGLE_OAUTH_REFRESH_TOKEN   — long-lived refresh token (from setupOAuth2.js)
 *   GOOGLE_CALENDAR_ID           — calendar ID, use "primary" for main Gmail calendar
 */

const { google } = require('googleapis');

let _calendarClient = null;

function getCalendarClient() {
  if (_calendarClient) return _calendarClient;

  const clientId     = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) return null;

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'http://localhost:3000/oauth2callback');
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    _calendarClient = google.calendar({ version: 'v3', auth: oauth2Client });
    return _calendarClient;
  } catch (err) {
    console.error('[GoogleCalendar] Failed to initialise OAuth2 client:', err.message);
    return null;
  }
}

/**
 * Build an end-time string by adding durationMinutes to a "HH:mm" start time.
 */
function buildEndTime(date, startTime, durationMinutes) {
  const [hh, mm] = startTime.split(':').map(Number);
  const totalMins = hh * 60 + mm + Number(durationMinutes || 60);
  const endHh = String(Math.floor(totalMins / 60) % 24).padStart(2, '0');
  const endMm = String(totalMins % 60).padStart(2, '0');
  return `${date}T${endHh}:${endMm}:00`;
}

/**
 * Create a calendar event for a session booking.
 * Returns the Google Calendar event ID (string) or null if not configured.
 *
 * @param {Object} opts
 * @param {string} opts.calendarId
 * @param {string} opts.summary        — event title
 * @param {string} opts.description    — event description
 * @param {string} opts.date           — "YYYY-MM-DD"
 * @param {string} opts.startTime      — "HH:mm"
 * @param {number} opts.durationMinutes
 * @param {string} opts.timezone       — IANA tz, e.g. "Asia/Calcutta"
 * @param {string} opts.attendeeEmail  — user's email
 * @param {string|null} opts.meetLink  — existing Google Meet / Zoom URL (optional)
 */
async function createBookingCalendarEvent(opts) {
  const calendar = getCalendarClient();
  const calendarId = opts.calendarId || process.env.GOOGLE_CALENDAR_ID;
  if (!calendar || !calendarId) return null;

  const startDt = `${opts.date}T${opts.startTime}:00`;
  const endDt = buildEndTime(opts.date, opts.startTime, opts.durationMinutes);

  let description = opts.description || '';
  if (opts.meetLink) {
    description = `${description}\n\nJoin session: ${opts.meetLink}`.trim();
  }

  const eventBody = {
    summary: opts.summary,
    description,
    start: { dateTime: startDt, timeZone: opts.timezone },
    end: { dateTime: endDt, timeZone: opts.timezone },
    attendees: opts.attendeeEmail ? [{ email: opts.attendeeEmail }] : [],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 60 },
        { method: 'popup', minutes: 15 },
      ],
    },
  };

  if (opts.meetLink) {
    eventBody.location = opts.meetLink;
  }

  const response = await calendar.events.insert({
    calendarId,
    requestBody: eventBody,
    sendUpdates: opts.attendeeEmail ? 'all' : 'none',
  });

  return response.data.id || null;
}

/**
 * Delete a previously-created calendar event.
 * Silently ignores errors (event may already be deleted).
 */
async function deleteBookingCalendarEvent(eventId) {
  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendar || !calendarId || !eventId) return;

  try {
    await calendar.events.delete({ calendarId, eventId });
  } catch (err) {
    // 404 means event already gone — safe to ignore
    if (err?.code !== 404) {
      console.error('[GoogleCalendar] Failed to delete event:', err.message);
    }
  }
}

module.exports = { createBookingCalendarEvent, deleteBookingCalendarEvent };
