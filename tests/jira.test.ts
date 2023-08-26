import { WorklogDTO } from "../src/models/jira_worklogs_dto.model";
import { Jira } from "../src/jira";
import { Axios, AxiosRequestConfig, AxiosResponse } from "axios";
import { JiraWorklog } from "../src/models/jira_worklog.model";
import { DateTime } from "luxon";

const testStartDateTime = "2023-08-26T13:11:44.820+02:00";
const testEndDateTime = "2023-08-26T13:12:44.820+02:00"
const testTimeSpent = '1m';
const testTimeSpentSeconds = 60;
const testId = 'testWorklogId';
const testIssueKey = 'testIssueKey';
const testWorklogDTO = { timeSpent: testTimeSpent, id: testId, started: testStartDateTime, timeSpentSeconds: testTimeSpentSeconds } as WorklogDTO;

class MockAxios extends Axios {
    async get<T = any, R = AxiosResponse<T, any>, D = any>(url: string, config?: AxiosRequestConfig<D> | undefined): Promise<R> {
        return [testWorklogDTO] as R;
    }
}

test('mapping worklogDTO to internal worklog type', () => {
    const mockAxios = new MockAxios();
    const jira = new Jira(mockAxios, () => { });
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