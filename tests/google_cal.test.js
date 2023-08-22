const { listEvents } = require("../src/google_cal");

const mockGoogle = {
  calendar: () => ({
    events: {
      list: async () => ({
        data: {
          items: [
            {
              start: { dateTime: "mock start date" },
              end: { dateTime: "mock end date" },
              summary: 'issueKey some comment because its fun'
            },
          ],
        },
      }),
    },
  }),
};

test("google calendar gives back internal calendar event type", async () => {
//   console.log(listEvents(mockGoogle));
  expect(await listEvents(mockGoogle)).toStrictEqual([{issueKey: 'issueKey', start: 'mock start date', end: 'mock end date', comment: 'some comment because its fun'}]);
});
