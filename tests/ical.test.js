const { listEvents } = require("../src/ical");
const { async } = require("node-ical");

const mockICalLib = {
  async: {
    fromURL: async.parseFile,
  },
};

test("google calendar gives back internal calendar event type", async () => {
  //   console.log(listEvents(mockGoogle));
  const asdf = await listEvents(mockICalLib, "./tests/fake.ical");

  expect(asdf).toStrictEqual([
    {
      issueKey: "TEST",
      start: "mock start date",
      end: "mock end date",
      comment: "some comment because its fun",
    },
  ]);
});
