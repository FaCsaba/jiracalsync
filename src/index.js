const { google } = require("googleapis");
const { authorize, listEvents } = require("./google_cal");
const {
  getWorklogsByIssueKey,
  getWorklogByIssueKeyAndStartDate,
  createWorklog,
  clearWorklogs,
} = require("./jira");
const { DateTime } = require("luxon");
const { async } = require("node-ical");

const workCalendar =
  "efb90ebeae5211833c97691e80f69ea068eaad167069548956be340dd96dbd90@group.calendar.google.com";

async function main() {
  const client = await authorize();
  const events = await listEvents(google, client, workCalendar);
  let flatWorklogs = events.map(async (ev) => {
    try {
      return await getWorklogsByIssueKey(ev.issueKey);
    } catch (error) {
      console.log(error);
      return [];
    }
  });
  await Promise.all(flatWorklogs);

  events.forEach((event) => {
    let worklog = getWorklogByIssueKeyAndStartDate(event.issueKey, event.start);
    if (worklog == undefined) {
      createWorklog(event);
    }
  });

  clearWorklogs();

}

// main().then();
// createWorklog({issueKey: 'CC-5648', start: DateTime.fromISO('2023-08-23T09:00:00.00+02:00'), end: DateTime.fromISO('2023-08-23T09:00:00.00+02:00')});
