import { EbnisComponentProps } from "../../types";
import { ExperienceFragment } from "../../graphql/apollo-types/ExperienceFragment";
import { EntryFragment } from "../../graphql/apollo-types/EntryFragment";
import { Reducer, Dispatch } from "react";
import {
  ActionType as EditEntryActionTypes,
  Action as EditEntryAction,
} from "../EditEntry/edit-entry-utils";
import { wrapReducer } from "../../logger";

export enum ActionType {
  editClicked = "@components/entry/edit-clicked",
}

export const reducer: Reducer<State, EntryAction> = (state, action) =>
  wrapReducer(state, action, (previousState, { type }) => {
    switch (type) {
      case ActionType.editClicked: {
        return {
          ...previousState,
          stateValue: "editing",
        };
      }

      case EditEntryActionTypes.DESTROYED: {
        return {
          ...previousState,
          stateValue: "idle",
        };
      }

      default: {
        return previousState;
      }
    }
  });

export interface State {
  readonly stateValue: "idle" | "editing";
}

export type DispatchType = Dispatch<EntryAction>;

export type EntryAction =
  | EditEntryAction
  | {
      type: ActionType.editClicked;
    };

export interface Props extends EbnisComponentProps {
  entry: EntryFragment;
  experience: ExperienceFragment;
  entriesLen: number;
  index: number;
  className?: string;
}
