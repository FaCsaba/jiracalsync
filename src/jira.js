const axios = require("axios").default;
const { Duration, DateTime } = require("luxon");
const RestApiVersion = 3;
const RestApiBase = `https://${process.env.JIRA_TEAM_ID}.atlassian.net/rest/api/${RestApiVersion}`;
const Authorization = `Basic ${btoa(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_KEY}`)}`;

// Map<IssueKey, InternalWorklog>
const Worklogs = new Map();

/**
 * Parses a jira style duration into a luxon duration
 *
 * @param {string} duration Jira duration
 * @returns {Duration}
 */
function parseJiraDuration(duration) {
  let durationStr = duration.split(" ").join("").toUpperCase();
  durationStr = durationStr.replace(
    /((\d+W)?(\d+D)?)?((\d+H)?(\d+M))?/,
    "P$1T$4"
  );
  return Duration.fromISO(durationStr);
}

function mapWorklogToInternalFormat(worklog, issueKey) {
  const started = DateTime.fromISO(worklog.started);
  const ended = DateTime.fromMillis(
    started.toMillis() + parseJiraDuration(worklog.timeSpent)
  );
  const id = worklog.id;
  return {
    started,
    ended,
    id,
    issueKey,
  };
}

async function getWorklogsByIssueKey(issueKey) {
  if (Worklogs.has(issueKey)) return Worklogs.get(issueKey);
  const res = await axios.get(`${RestApiBase}/issue/${issueKey}/worklog`, {
    headers: {
      Authorization: Authorization,
      "Content-Type": "application/json",
    },
  });
  const worklog = res.data.worklogs
    .filter((worklog) => worklog.author.emailAddress == process.env.JIRA_EMAIL)
    .map((worklog) => mapWorklogToInternalFormat(worklog, issueKey));
  Worklogs.set(issueKey, worklog);
  return worklog;
}

/**
 * 
 * @param {string} issueKey 
 * @param {DateTime} startDate 
 * @returns 
 */
function getWorklogByIssueKeyAndStartDate(issueKey, startDate) {
  return Worklogs.get(issueKey).find(({ started }) => {
    return startDate.equals(started);
  });
}

/**
 * Creates a worklog for the specified issue
 * @param {{issueKey: string, start: DateTime, end: DateTime, comment: string}} event
 */
function createWorklog(event) {
  const timeSpentSeconds = DateTime.fromISO(event.end).toSeconds() - DateTime.fromISO(event.start).toSeconds();
  body = {
    started: DateTime.fromISO(event.start).toFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZZZ"),
    timeSpentSeconds
  };
  console.log(`[Jira][${new Date().toISOString()}][TRY] Creating worklog for ${event.issueKey}. Started at: ${event.start} spent: ${timeSpentSeconds} seconds`);

  axios.post(`${RestApiBase}/issue/${event.issueKey}/worklog`, body, {
    headers: {
      Authorization,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  }).then((res) => {
    console.log(`[Jira][${new Date().toISOString()}][OK] Successfully created worklog for ${event.issueKey}. Obtained Worklog id: ${res.data.id}`);
  }).catch(err => {
    console.error(`[Jira][${new Date().toISOString()}][FAIL] Failed to create worklog for ${event.issueKey} started at: ${event.start} because`);
    console.error(err.response.data);
  });
}

function clearWorklogs() {
  Worklogs.clear();
}

exports.getWorklogsByIssueKey = getWorklogsByIssueKey;
exports.parseDuration = parseJiraDuration;
exports.getWorklogByIssueKeyAndStartDate = getWorklogByIssueKeyAndStartDate;
exports.createWorklog = createWorklog;
exports.clearWorklogs = clearWorklogs;
