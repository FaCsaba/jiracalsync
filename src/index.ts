require("dotenv").config();
import { Jira } from "./jira";
import { ICal } from "./ical";
import { Mapper } from "./mapper";
import { scheduleJob } from "node-schedule";
import { argv } from "process";
import { loggerFactory } from "./logger";
import { LogType } from "./models/log_type.model";

const ical = new ICal();
const jira = new Jira();
const mapper = new Mapper(jira);
const log = loggerFactory('SYNC');

async function main() {
  log(LogType.Inf, "=== Starting sync ===")
  const events = await ical.getEvents();

  const uniqueIssueKeys = [...new Set(events.map((e) => e.issueKey))];
  const worklogs = (
    await Promise.all(
      uniqueIssueKeys.map(
        async (issueKey) => await jira.getWorklogsByIssueKey(issueKey)
      )
    )
  ).flat();

  mapper.mapEventsToWorklogs(events, worklogs);
}

main().then();
if (argv.includes("--watch"))
  scheduleJob("0 0 * * *", async () => main);
