import icalModule, { VEvent } from "node-ical";
import { DateTime } from "luxon";
import { ICalEvent } from "./models/ical_cal_event.model";
import { loggerFactory } from "./logger";
import { LogType } from "./models/log_type.model";
import { readFileSync } from "node:fs";
import { def } from "./util";

export class ICal {
  constructor(
    private calURL = process.env.ICAL_PRIVATE_URL || "ICAL_PRIVATE_URL not found in the environment. Did you add it to .env file?",
    private subs: { [key: string]: string } = def(() => JSON.parse(readFileSync("./subs.json", "utf-8")), {}),
    private ical = icalModule,
    private log = loggerFactory("ICAL"),
  ) {
    log(LogType.Inf, `ICAL_PRIVATE_URL = ${this.calURL}`);
  }

  /**
   * Maps Calendar Issue Keys to actual Jira keys.
   */
  private mapCalIssueKeyToActualKey(calendarIssueKey: string): string {
    Object.entries(this.subs).forEach(([key, value]) => {
      calendarIssueKey = calendarIssueKey.replace(key, value);
    });

    return calendarIssueKey;
  }

  /**
   * Lists the events on the user's ical calendar by URL.
   */
  public async getEvents(): Promise<ICalEvent[]> {
    let events;
    try {
      this.log(LogType.Try, `Trying to get/parse ical from the following url: ${this.calURL}`);
      events = await this.ical.async.fromURL(this.calURL);
    } catch (err) {
      this.log(LogType.Error, `Error trying to get/parse calendar events from the following url: ${this.calURL}\n\tGot the following error:`);
      console.error(err);
      return [];
    }
    this.log(LogType.Ok, `Successfuly downloaded and parsed events form ical file`);

    return Object.values(events).filter((e) => e.type == 'VEVENT').map((event) => {
      event = event as VEvent;
      const uid = event.uid;
      const start = DateTime.fromJSDate(event.start);
      const end = DateTime.fromJSDate(event.end);
      const summary = event.summary.split(" ");
      const issueKey = this.mapCalIssueKeyToActualKey(summary.shift() || "");
      const comment = summary.join(" ");
      const timeSpentSeconds = end.toSeconds() - start.toSeconds();
      return { issueKey, uid, start, end, comment, timeSpentSeconds };
    });
  }
}
