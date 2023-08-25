require("dotenv").config();
const { listEvents, mapCalIssueKeyToActualKey } = require("./ical");
const {
  getWorklogsByIssueKey,
  getWorklogByIssueKeyAndStartDate,
  createWorklog,
  clearWorklogs,
} = require("./jira");
const ical = require('node-ical');

async function main() {
  const events = await listEvents(ical, process.env.ICAL_PRIVATE_URL);
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

main().then();
