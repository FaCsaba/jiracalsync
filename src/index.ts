require("dotenv").config();
import { Jira } from "./jira";
import { ICal } from "./ical";
import { Mapper } from "./mapper";

const ical = new ICal();
const jira = new Jira();
const mapper = new Mapper(jira);

async function main() {
  const events = await ical.getEvents();

  const uniqueIssueKeys = [...new Set(events.map(e => e.issueKey))];
  const worklogs = (await Promise.all(uniqueIssueKeys.map(async (issueKey) => await jira.getWorklogsByIssueKey(issueKey)))).flat();

  mapper.mapEventsToWorklogs(events, worklogs);
}

main().then();
debugger;