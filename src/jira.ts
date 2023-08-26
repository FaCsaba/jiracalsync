import axiosInstance, { Axios, AxiosResponse } from "axios";
import { DateTime } from "luxon";
import { JiraWorklog } from "./models/jira_worklog.model";
import { WorklogDTO, WorklogsDTO } from "./models/jira_worklogs_dto.model";
import { ICalEvent } from "./models/ical_cal_event.model";
import { LogType } from "./models/log_type.model";
import { Logger, loggerFactory } from "./logger";

export class Jira {
  constructor(
    private axios: Axios = axiosInstance,
    private log: Logger = loggerFactory("JIRA"),
    RestApiVersion: number = 3,
    private email: string = process.env.JIRA_EMAIL || "JIRA_EMAIL not found in the environment. Did you add it to .env file?",
    private restApiBaseUrl: string = `https://${process.env.JIRA_TEAM_ID}.atlassian.net/rest/api/${RestApiVersion}`,
    private taskBaseUrl: string = `https://${process.env.JIRA_TEAM_ID}.atlassian.net/browse`,
    private authorization: string = `Basic ${btoa(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_KEY}`)}`
  ) {
    this.log(LogType.Inf, `JIRA EMAIL = ${email}`);
    this.log(LogType.Inf, `REST API VERSION = ${RestApiVersion}`);
    this.log(LogType.Inf, `REST API BASE URL = ${restApiBaseUrl}`);
    this.log(LogType.Inf, `REST API AUTH HEADER = ${authorization}`);
  }

  /**
 * Maps a worklog received from [this API endpoint](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-worklogs/#api-rest-api-3-issue-issueidorkey-worklog-get)
 * to internally used {@link JiraWorklog}
 */
  public mapWorklogDTOToWorklog(worklog: WorklogDTO, issueKey: string): JiraWorklog {
    const start = DateTime.fromISO(worklog.started);
    const timeSpent = worklog.timeSpent;
    const timeSpentSeconds = worklog.timeSpentSeconds;
    const end = DateTime.fromSeconds(
      start.toSeconds() + timeSpentSeconds
    );
    const id = worklog.id;

    return {
      start,
      end,
      id,
      issueKey,
      timeSpent,
      timeSpentSeconds
    };
  }

  public async getWorklogsByIssueKey(issueKey: string): Promise<JiraWorklog[]> {
    let res: AxiosResponse<WorklogsDTO>;
    try {
      this.log(LogType.Try, `Trying to get worklogs for the following issue with issueKey: ${issueKey}`)
      res = await this.axios.get<WorklogsDTO, any>(`${this.restApiBaseUrl}/issue/${issueKey}/worklog`, {
        headers: {
          Authorization: this.authorization,
          "Content-Type": "application/json",
        },
      });
    } catch (error: any) {
      this.log(LogType.Error, `Err while trying to get worklogs for issueKey: ${issueKey}\n\tGot back the following error:\n${JSON.stringify(error.response.data)}`)
      return [];
    }
    this.log(LogType.Ok, `Got ${res.data.total} worklogs for issueKey: ${issueKey}`);
    const worklogs = res.data.worklogs
      .filter((worklog) => worklog.author.emailAddress == this.email)
      .map((worklog) => this.mapWorklogDTOToWorklog(worklog, issueKey));
    return worklogs;
  }

  getWorklogByIssueKeyAndStartDate(worklogs: JiraWorklog[], issueKey: string, startDate: DateTime) {
    return worklogs.filter((wl) => wl.issueKey === issueKey)?.find(({ start }) => {
      return startDate.equals(start);
    });
  }

  /**
   * Creates a worklog for the specified issue
   */
  async createWorklog(event: ICalEvent) {
    const body = {
      started: event.start.toFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZZZ"),
      timeSpentSeconds: event.timeSpentSeconds
    };
    this.log(LogType.Try, `Creating worklog for ${event.issueKey}. Started at: ${event.start.toISO()}, spent: ${event.timeSpentSeconds} seconds.`);

    try {
      const res = await this.axios.post<WorklogDTO>(`${this.restApiBaseUrl}/issue/${event.issueKey}/worklog`, body, {
        headers: {
          Authorization: this.authorization,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      })
      this.log(LogType.Ok, `Successfully created worklog for ${event.issueKey}, worklog id: ${res.data.id}.\n\tA link to the task: ${this.taskBaseUrl}/${event.issueKey}`);
      return this.mapWorklogDTOToWorklog(res.data, event.issueKey);
    } catch (err: any) {
      this.log(LogType.Error, `Failed to create worklog for the following event:\n${JSON.stringify(event)}\nbecause:\n${JSON.stringify(err.response.data)}`);
    }
  }
}
