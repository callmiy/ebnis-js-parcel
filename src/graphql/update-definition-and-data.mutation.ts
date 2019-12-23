import gql from "graphql-tag";
import { DATA_OBJECT_FRAGMENT } from "./data-object-fragment";
import { DEFINITION_FRAGMENT } from "./data-definition.fragment";

export const UPDATE_DEFINITIONS_RESPONSE_FRAGMENT = gql`
  fragment UpdateDefinitionsResponseFragment on UpdateDefinitionsResponse {
    experience {
      id
      updatedAt
    }

    definitions {
      definition {
        ...DataDefinitionFragment
      }

      errors {
        id
        errors {
          definition
          name
        }
      }
    }
  }
  ${DEFINITION_FRAGMENT}
`;

export const UPDATE_DEFINITIONS_ONLINE_MUTATION = gql`
  mutation UpdateDefinitions($input: UpdateDefinitionsInput!) {
    updateDefinitions(input: $input) {
      ...UpdateDefinitionsResponseFragment
    }
  }
  ${UPDATE_DEFINITIONS_RESPONSE_FRAGMENT}
`;

export const UPDATE_DATA_OBJECTS_RESPONSE_FRAGMENT = gql`
  fragment UpdateDataObjectsResponseFragment on UpdateDataObjectsResponse {
    id
    index
    stringError

    dataObject {
      ...DataObjectFragment
    }

    fieldErrors {
      definition
      definitionId
      data
    }
  }
  ${DATA_OBJECT_FRAGMENT}
`;

export const UPDATE_DATA_OBJECTS_ONLINE_MUTATION = gql`
  mutation UpdateDataObjects($input: [UpdateDataObjectInput!]!) {
    updateDataObjects(input: $input) {
      ...UpdateDataObjectsResponseFragment
    }
  }

  ${UPDATE_DATA_OBJECTS_RESPONSE_FRAGMENT}
`;

export const UPDATE_DEFINITION_AND_DATA_ONLINE_MUTATION = gql`
  mutation UpdateDefinitionAndData(
    $dataInput: [UpdateDataObjectInput!]!
    $definitionsInput: UpdateDefinitionsInput!
  ) {
    updateDataObjects(input: $dataInput) {
      ...UpdateDataObjectsResponseFragment
    }

    updateDefinitions(input: $definitionsInput) {
      ...UpdateDefinitionsResponseFragment
    }
  }

  ${UPDATE_DATA_OBJECTS_RESPONSE_FRAGMENT}
  ${UPDATE_DEFINITIONS_RESPONSE_FRAGMENT}
`;
