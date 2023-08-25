const { mapCalIssueKeyToActualKey } = require("../src/ical")

test('Calendar Issue Key substitution', () => {
    expect(
        mapCalIssueKeyToActualKey({'sub': 'subscribe'}, 'sub')
    ).toBe('subscribe');
});