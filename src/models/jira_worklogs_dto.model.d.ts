/**
 * File generated with: https://app.quicktype.io/
 * 
 * Generated with the example from [this](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-worklogs/#api-rest-api-3-issue-issueidorkey-worklog-get) API return DTO example
 * 
 * NOTE: I also manually changed the `Worklog` types name to `WorklogDTO` 
 */

export type WorklogsDTO = {
  startAt: number;
  maxResults: number;
  total: number;
  worklogs: WorklogDTO[];
}

export type WorklogDTO = {
  self: string;
  author: Author;
  updateAuthor: Author;
  comment: Comment;
  updated: string;
  visibility: Visibility;
  started: string;
  timeSpent: string;
  timeSpentSeconds: number;
  id: string;
  issueId: string;
}

type Author = {
  self: string;
  accountId: string;
  displayName: string;
  active: boolean;
  emailAddress?: string;
}

type Comment = {
  type: string;
  version: number;
  content: CommentContent[];
}

type CommentContent = {
  type: string;
  content: ContentContent[];
}

type ContentContent = {
  type: string;
  text: string;
}

type Visibility = {
  type: string;
  value: string;
  identifier: string;
}
