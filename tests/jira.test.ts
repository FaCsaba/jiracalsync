import { WorklogDTO } from "../src/models/jira_worklogs_dto.model";
import { Jira } from "../src/jira";
import { Axios, AxiosRequestConfig, AxiosResponse } from "axios";
import { JiraWorklog } from "../src/models/jira_worklog.model";
import { DateTime } from "luxon";
import { readFileSync } from "node:fs";

const testStartDateTime = "2023-08-26T13:11:44.820+02:00";
const testEndDateTime = "2023-08-26T13:12:44.820+02:00"
const testTimeSpent = '1m';
const testTimeSpentSeconds = 60;
const testId = 'testWorklogId';
const testIssueKey = 'testIssueKey';
const testWorklogDTO = { timeSpent: testTimeSpent, id: testId, started: testStartDateTime, timeSpentSeconds: testTimeSpentSeconds } as WorklogDTO;

class MockAxios extends Axios {
  async get<T = any, R = AxiosResponse<T, any>, D = any>(url: string, config?: AxiosRequestConfig<D> | undefined): Promise<R> {
    return { data: JSON.parse(readFileSync('tests/fake_get_worklogs_dto_res.json', 'utf-8')) } as R;
  }
}
const mockAxios = new MockAxios();
const jira = new Jira(mockAxios, () => { }, undefined, "test@test.com");

test('mapping worklogDTO to internal worklog type', () => {
  expect(jira.mapWorklogDTOToWorklog(testWorklogDTO, testIssueKey))
    .toStrictEqual({
      start: DateTime.fromISO(testStartDateTime),
      end: DateTime.fromISO(testEndDateTime),
      id: testId,
      issueKey: testIssueKey,
      timeSpent: testTimeSpent,
      timeSpentSeconds: testTimeSpentSeconds
    } as JiraWorklog);
});

test("getting worklogs by issue key", async () => {
  expect(await jira.getWorklogsByIssueKey("10002")).toStrictEqual([{
    start: DateTime.fromISO("2021-01-17T12:34:00.000+0000"),
    end: DateTime.fromISO("2021-01-17T12:34:00.000+0000").plus({ seconds: 12000 }),
    timeSpent: "3h 20m",
    timeSpentSeconds: 12000,
    id: "100028",
    issueKey: "10002",
  } as JiraWorklog]);
});

test('getting worklog by issue key and start date', () => {
  const testWorklog = {
    start: DateTime.fromISO(testStartDateTime),
    end: DateTime.fromISO(testEndDateTime),
    id: testId,
    issueKey: testIssueKey,
    timeSpent: testTimeSpent,
    timeSpentSeconds: testTimeSpentSeconds
  } as JiraWorklog;
  expect(jira.getWorklogByIssueKeyAndStartDate([testWorklog], testIssueKey, DateTime.fromISO(testStartDateTime)))
    .toStrictEqual(testWorklog);

  expect(jira.getWorklogByIssueKeyAndStartDate([testWorklog], ":D", DateTime.fromISO(testStartDateTime)))
    .toBeUndefined();

  expect(jira.getWorklogByIssueKeyAndStartDate([testWorklog], testIssueKey, DateTime.fromISO(testStartDateTime).plus({ seconds: 1 })))
    .toBeUndefined();
})
