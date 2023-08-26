
import ical from "node-ical";
import { ICal } from "../src/ical";
import { DateTime } from "luxon";

const mockICalLib = {
  ...ical,
  async: {
    ...ical.async,
    fromURL: ical.async.parseFile,
  },
};

test("ical gives back internal calendar event type", async () => {
  const ical = new ICal("./tests/fake.ical", {}, mockICalLib);
  const asdf = await ical.getEvents();

  expect(asdf).toStrictEqual([
    {
      issueKey: "TEST",
      start: DateTime.fromISO("2023-06-07T08:00:00.000+02:00"),
      end: DateTime.fromISO("2023-06-07T09:00:00.000+02:00"),
      timeSpentSeconds: 3600,
      uid: "this_is_an_id",
      comment: "some comment because its fun",
    },
  ]);
});


