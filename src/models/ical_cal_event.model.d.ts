import { DateTime } from "luxon";

export type ICalEvent = {
  /** Used to identify which Jira issue the event is about */
  issueKey: string;
  /** Used to identify the event */
  uid: string,
  /** Start of the event */
  start: DateTime;
  /** End of the event */
  end: DateTime;
  /** Calculated from end - start, the amount of seconds spent on the task */
  timeSpentSeconds: number;
  /** A comment about this particular Jira worklog */
  comment: string;
}