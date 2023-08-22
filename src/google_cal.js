const { DateTime } = require("luxon");
const { async } = require("node-ical");
const subs = require("../subs.json");

function mapCalIssueKeyToActualKey(calendarIssueKey) {
  Object.entries(subs).forEach(([key, value]) => {
    calendarIssueKey.replace(key, value);
  });
}

/**
 * Lists the events on the user's ical calendar by URL.
 * @param {string} calURL
 * @returns {Promise<{issueKey: string, start: DateTime, end: DateTime, comment: string}[]>}
 */
async function listEvents(calURL) {
  const events = await async.fromURL(calURL);

  return Object.values(events).map((event) => {
    const start = DateTime.fromISO(event.start);
    const end = DateTime.fromISO(event.end);
    const summary = event.summary.split(" ");
    const issueKey = mapCalIssueKeyToActualKey(summary.shift());
    const comment = summary.join(" ");
    return { issueKey, start, end, comment };
  });
}

exports.authorize = authorize;
exports.listEvents = listEvents;
