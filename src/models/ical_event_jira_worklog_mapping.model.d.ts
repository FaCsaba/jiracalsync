import { DateTime } from "luxon"
import { JiraWorklog } from "./jira_worklog.model"
import { ICalEvent } from "./ical_cal_event.model"

/**
 * Internal representation of the link between a {@link JiraWorklog} and an {@link ICalEvent}
 */
export type ICalEventWorklogMapping = {
    icalId: string,
    issueKey: string,
    worklogId: string,
}