import { createContext, Reducer, Dispatch } from "react";
import { CachePersistor } from "apollo-cache-persist";
import { InMemoryCache } from "apollo-cache-inmemory";
import immer from "immer";
import ApolloClient from "apollo-client";

export interface ILayoutContextContext {
  persistor: CachePersistor<{}>;
  unsavedCount: number;
  cache: InMemoryCache;
  layoutDispatch: LayoutDispatchType;
  client: ApolloClient<{}>;
}

export const LayoutContext = createContext<ILayoutContextContext>({
  unsavedCount: 0,
} as ILayoutContextContext);

export enum LayoutActionType {
  setUnsavedCount = "@components/layout/set-unsaved-count",
  shouldRenderChildren = "@components/layout/should-render-children",
  setExperiencesToPreFetch = "@components/layout/set-experiences-to-pre-fetch",
}

type Action =
  | [LayoutActionType.setUnsavedCount, number]
  | [LayoutActionType.shouldRenderChildren, boolean]
  | [LayoutActionType.setExperiencesToPreFetch, string[] | null];

interface State {
  unsavedCount: number | null;
  renderChildren: boolean;
  experiencesToPreFetch?: string[] | null;
}

export const reducer: Reducer<State, Action> = (prevState, [type, payload]) => {
  return immer(prevState, proxy => {
    switch (type) {
      case LayoutActionType.setUnsavedCount:
        {
          proxy.unsavedCount = payload as number;
        }

        break;

      case LayoutActionType.shouldRenderChildren:
        {
          proxy.renderChildren = payload as boolean;
        }

        break;

      // istanbul ignore next:tested in MyExperiences component
      case LayoutActionType.setExperiencesToPreFetch:
        {
          proxy.experiencesToPreFetch = payload as string[];
        }

        break;
    }
  });
};

export type LayoutDispatchType = Dispatch<Action>;