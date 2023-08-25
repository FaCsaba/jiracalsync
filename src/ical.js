const { DateTime } = require("luxon");
const ical = require("node-ical");
const subs = require("../subs.json");

/**
 * Maps Calendar Issue Keys to actual Jira keys.
 * 
 * @param {{[key: string]: string}} subs 
 * @param {string} calendarIssueKey 
 * @returns {string}
 */
function mapCalIssueKeyToActualKey(subs, calendarIssueKey) {
  Object.entries(subs).forEach(([key, value]) => {
    calendarIssueKey = calendarIssueKey.replace(key, value);
  });

  return calendarIssueKey;
}

/**
 * Lists the events on the user's ical calendar by URL.
 * @param {ical} ical
 * @param {string} calURL
 * @returns {Promise<{issueKey: string, start: DateTime, end: DateTime, comment: string}[]>}
 */
async function listEvents(ical, calURL) {
  const events = await ical.async.fromURL(calURL);

  return Object.values(events).filter((e) => e.type == 'VEVENT').map((event) => {
    const start = DateTime.fromJSDate(event.start);
    const end = DateTime.fromJSDate(event.end);
    const summary = event.summary.split(" ");
    const issueKey = mapCalIssueKeyToActualKey(subs, summary.shift());
    const comment = summary.join(" ");
    return { issueKey, start, end, comment };
  });
}

exports.listEvents = listEvents;
exports.mapCalIssueKeyToActualKey = mapCalIssueKeyToActualKey;