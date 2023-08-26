import { DateTime } from "luxon"

/** 
 * An internal representation of a Jira Worklog
 *
 * See also: [Jira Worklog API endpoint](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-worklogs/#api-rest-api-3-issue-issueidorkey-worklog-id-get)
 */
export type JiraWorklog = {
  /** Start of worklog */
  start: DateTime;
  /** End of worklog calculated from timeSpent */
  end: DateTime;
  /** A string representation of the amount of time spent on the work */
  timeSpent: string;
  /** A number representation of the amount of time spent on the work */
  timeSpentSeconds: number;
  /** Id of the worklog */
  id: string;
  /** Issue key of the Jira issue */
  issueKey: string;
}