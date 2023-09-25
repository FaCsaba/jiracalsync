import { ICalEventWorklogMapping } from "./models/ical_event_jira_worklog_mapping.model";
import { ICalEvent } from "./models/ical_cal_event.model";
import { JiraWorklog } from "./models/jira_worklog.model";
import { Jira } from "./jira";
import { tryOrDefault } from "./util";
import { Logger, loggerFactory } from "./logger";
import { LogType } from "./models/log_type.model";
import { readFileSync, writeFileSync } from "node:fs";

/**
 * We want to sort out our mappings and events into three categories
 * 1. `unmappedEvents` are events that are yet to be mapped either due to being 
 * recently added and a worklog does not exists for it or there is a worklog that it can be mapped to
 * 2. `mappedEvents` are events that we do know that exist and have a worklog associated with it
 * 3. `deletedEvents` are mappings that have an event associated with them but
 * that event can't be found, which most likely meanst that it was deleted
 * 
 * NOTE: deletedEventMappings are type ICalEventWorklogMappings because the event associated with the mapping has been deleted
 * ```
 *  Events
 * ┌─────────────────────────┐
 * │                         │
 * │ unmappedEvents          │
 * │ ICalEvent               │   Mappings
 * │          ┌──────────────┼───────────┐
 * │          │              │           │
 * │          │ mappedEvents │           │
 * │          │ ICalEvent    │           │
 * └──────────┼──────────────┘           │
 *            │                          │
 *            │            deletedEvents │
 *            │            Mapping       │
 *            └──────────────────────────┘
 * ```
 */
export class Mapper {
  constructor(
    private jira: Jira,
    private mappings: ICalEventWorklogMapping[] = tryOrDefault(() => JSON.parse(readFileSync("./mappings.json", { encoding: "utf-8" })), []),
    private log: Logger = loggerFactory("MAP")
  ) {
    this.log(LogType.Ok, `MAPPINGS =\n${JSON.stringify(mappings)}`);
  }

  public logMapping(mapping: ICalEventWorklogMapping) {
    this.log(LogType.Inf, `Mapping ${mapping.icalId} ==> ${mapping.issueKey}:${mapping.worklogId}`);
  }

  private mappingHelper(events: ICalEvent[]): { mappedEvents: ICalEvent[], unmappedEvents: ICalEvent[], deletedEventMappings: ICalEventWorklogMapping[] } {
    const mappedEvents: ICalEvent[] = [];
    const unmappedEvents: ICalEvent[] = [];
    const deletedEventMappings: ICalEventWorklogMapping[] = [];

    const savedMappingIcalIds = this.mappings.map(m => m.icalId);
    const eventIcalIds = events.map(e => e.uid);
    for (const event of events) {
      if (savedMappingIcalIds.includes(event.uid)) {
        mappedEvents.push(event);
      } else {
        unmappedEvents.push(event);
      }
    }

    for (const mapping of this.mappings) {
      if (!eventIcalIds.includes(mapping.icalId)) {
        deletedEventMappings.push(mapping);
      }
    }

    return { deletedEventMappings, mappedEvents, unmappedEvents };
  }

  public async mapEventsToWorklogs(events: ICalEvent[], worklogs: JiraWorklog[]) {
    const { mappedEvents, unmappedEvents, deletedEventMappings } = this.mappingHelper(events);

    for (const event of unmappedEvents) {
      // try and match event to existing worklog 
      let worklog = this.jira.getWorklogByIssueKeyAndStartDate(worklogs, event.issueKey, event.start);
      // if it doesn't exists we want to create it
      if (worklog == undefined) {
        worklog = await this.jira.createWorklog(event);
        if (worklog == undefined) {
          continue;
        }
      }
      // the worklog does exists but is unmapped so we need to map it
      const mapping = { icalId: event.uid, issueKey: worklog.issueKey, worklogId: worklog.id };
      this.logMapping(mapping);
      this.mappings.push(mapping);
      mappedEvents.push(event);
    }

    // TODO: check changes in the mapped events and dowloaded worklogs

    // TODO: delete worklogs that no longer have

    try {
      this.log(LogType.Try, "Trying to save mappings.json");
      writeFileSync('mappings.json', JSON.stringify(this.mappings), { encoding: 'utf-8' });
      this.log(LogType.Ok, "Successfully saved mappings.json");
    } catch (error) {
      this.log(LogType.Error, `Could not save mappings.json because:\n${error}`);
    }
    return this.mappings;
  }
}
