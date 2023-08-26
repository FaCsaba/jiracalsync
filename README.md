# ICal to Jira Sync
ICal to Jira sync is a simple command line tool to help you with managing tasks.

If you are like me you like you like to organize everything in one place and see all of the things that you have done in a day. With this tool you can block out the task that you have done in an iCal sharing capable calendar and it will be synced across to Jira. Just include the IssueId to the events name as the first thing and it's done.

## Getting started
1. Install the dependencies with your node package manager
```bash
npm install
```
2. Change the [.env](.env) file to suit your need
```bash
ICAL_PRIVATE_URL="<YOUR GOOGLE ICAL PRIVATE URL GOES HERE>"
JIRA_API_KEY="<YOUR JIRA API KEY GOES HERE>"
JIRA_EMAIL="<YOUR EMAIL ADDRESS GOES HERE>"
JIRA_TEAM_ID="<YOUR JIRA TEAM ID GOES HERE>"
```
3. Run
```bash
npm run start
```

## Getting Jira stuffs for the env file
1. Create a [Jira API key here](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Change the visibility of your email to anyone [here](https://id.atlassian.com/manage-profile/profile-and-visibility)
3. To get the team id go to any jira ticket you have and copy the team-[number] part
![team](res/finding_the_team_id.png)

## Getting an iCal URL
1. [Google](calendar.google.com)
    - Go to settings
    - Click on the calendar you want the iCal address for
    - Scroll all the way down until you find `Secret address in iCal format`
    - Copy into [.env](.env)

## What it is not
For now it isn't going to sync from Jira to a calendar provider