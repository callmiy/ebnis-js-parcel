/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { FieldType } from "./globalTypes";

// ====================================================
// GraphQL fragment: ExperienceRestFragment
// ====================================================

export interface ExperienceRestFragment_dataDefinitions {
  __typename: "DataDefinition";
  id: string;
  /**
   * Name of field e.g start, end, meal
   */
  name: string;
  /**
   * The data type of the field
   */
  type: FieldType;
  /**
   * String that uniquely identifies this data definition has been
   *   created offline. If an associated entry is also created
   *   offline, then `dataDefinition.definitionId` **MUST BE** the same as this
   *   field and will be validated as such.
   */
  clientId: string | null;
}

export interface ExperienceRestFragment_entries_pageInfo {
  __typename: "PageInfo";
  /**
   * When paginating forwards, are there more items?
   */
  hasNextPage: boolean;
  /**
   * When paginating backwards, are there more items?
   */
  hasPreviousPage: boolean;
}

export interface ExperienceRestFragment_entries_edges_node_dataObjects {
  __typename: "DataObject";
  id: string;
  data: any;
  definitionId: string;
}

export interface ExperienceRestFragment_entries_edges_node {
  __typename: "Entry";
  /**
   * The ID of an object
   */
  id: string;
  /**
   * The ID of experience to which this entry belongs.
   */
  experienceId: string;
  /**
   * The client ID which indicates that an entry has been created while server
   *   is offline and is to be saved. The client ID uniquely
   *   identifies this entry and will be used prevent conflict while saving entry
   *   created offline and must thus be non null in this situation.
   */
  clientId: string | null;
  insertedAt: any;
  updatedAt: any;
  /**
   * The list of data belonging to this entry
   */
  dataObjects: (ExperienceRestFragment_entries_edges_node_dataObjects | null)[];
}

export interface ExperienceRestFragment_entries_edges {
  __typename: "EntryEdge";
  /**
   * A cursor for use in pagination
   */
  cursor: string;
  /**
   * The item at the end of the edge
   */
  node: ExperienceRestFragment_entries_edges_node | null;
}

export interface ExperienceRestFragment_entries {
  __typename: "EntryConnection";
  pageInfo: ExperienceRestFragment_entries_pageInfo;
  edges: (ExperienceRestFragment_entries_edges | null)[] | null;
}

export interface ExperienceRestFragment {
  __typename: "Experience";
  /**
   * The ID of an object
   */
  id: string;
  /**
   * The field definitions used for the experience entries
   */
  dataDefinitions: (ExperienceRestFragment_dataDefinitions | null)[];
  /**
   * The entries of the experience - can be paginated
   */
  entries: ExperienceRestFragment_entries;
}
