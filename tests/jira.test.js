"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jira_1 = require("../src/jira");
const axios_1 = require("axios");
const luxon_1 = require("luxon");
const testStartDateTime = "2023-08-26T13:11:44.820+02:00";
const testEndDateTime = "2023-08-26T13:12:44.820+02:00";
const testTimeSpent = '1m';
const testTimeSpentSeconds = 60;
const testId = 'testWorklogId';
const testIssueKey = 'testIssueKey';
const testWorklogDTO = { timeSpent: testTimeSpent, id: testId, started: testStartDateTime, timeSpentSeconds: testTimeSpentSeconds };
class MockAxios extends axios_1.Axios {
    get(url, config) {
        return __awaiter(this, void 0, void 0, function* () {
            return [testWorklogDTO];
        });
    }
}
test('mapping worklogDTO to internal worklog type', () => {
    const mockAxios = new MockAxios();
    const jira = new jira_1.Jira(mockAxios, () => { });
    expect(jira.mapWorklogDTOToWorklog(testWorklogDTO, testIssueKey))
        .toStrictEqual({
        start: luxon_1.DateTime.fromISO(testStartDateTime),
        end: luxon_1.DateTime.fromISO(testEndDateTime),
        id: testId,
        issueKey: testIssueKey,
        timeSpent: testTimeSpent,
        timeSpentSeconds: testTimeSpentSeconds
    });
});
//# sourceMappingURL=jira.test.js.map