/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: CreateEntriesResponseFragment
// ====================================================

export interface CreateEntriesResponseFragment_successes_entry_fields {
  __typename: "Field";
  defId: string;
  data: any;
}

export interface CreateEntriesResponseFragment_successes_entry {
  __typename: "Entry";
  /**
   * The ID of an object
   */
  id: string;
  /**
   * The ID of experience to which this entry belongs
   */
  expId: string;
  /**
   * The data fields belonging to this entry
   */
  fields: (CreateEntriesResponseFragment_successes_entry_fields | null)[];
  insertedAt: any;
}

export interface CreateEntriesResponseFragment_successes {
  __typename: "CreateEntriesResponseEntry";
  index: number;
  entry: CreateEntriesResponseFragment_successes_entry;
}

export interface CreateEntriesResponseFragment_failures {
  __typename: "CreateEntriesResponseError";
  index: number;
  error: string;
}

export interface CreateEntriesResponseFragment {
  __typename: "CreateEntriesResponse";
  successes: (CreateEntriesResponseFragment_successes | null)[] | null;
  failures: (CreateEntriesResponseFragment_failures | null)[] | null;
}