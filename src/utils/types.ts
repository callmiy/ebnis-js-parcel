/* istanbul ignore file */
/* eslint-disable @typescript-eslint/no-explicit-any*/
import { PropsWithChildren } from "react";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { Observable } from "zen-observable-ts";
import { CachePersistor } from "apollo-cache-persist";
import { EmitActionType } from "./observable-manager";
import { ChangeEvent } from "react";

export type EmitData = (params: EmitPayload) => void;

export type EmitPayload =
  | ({
      type: EmitActionType.connectionChanged;
    } & EmitActionConnectionChangedPayload)
  | {
      type: EmitActionType.random;
    };

export interface EmitActionConnectionChangedPayload {
  connected: boolean;
}

export interface ObservableUtils {
  emitData: EmitData;
  observable: Observable<EmitPayload>;
}

export interface E2EWindowObject extends ObservableUtils {
  cache: InMemoryCache;
  client: ApolloClient<{}>;
  persistor: CachePersistor<{}>;
  connectionStatus: ConnectionStatus;
  emitter: ZenObservable.SubscriptionObserver<EmitPayload>;
  emitting: boolean;
  experienceDefinitionResolversAdded?: boolean;
  newEntryResolversAdded?: boolean;
  logApolloQueries?: boolean;
}

export interface ConnectionStatus {
  isConnected: boolean;
  mode: "auto" | "manual";
}

type KeyOfE2EWindowObject = keyof E2EWindowObject;

declare global {
  interface Window {
    Cypress: {
      env: <T>(k?: string, v?: T) => void | T;
    };

    ____ebnis: E2EWindowObject;
  }
}

export type CommonError = Error | string;

export type RestoreCacheOrPurgeStorageFn = (
  persistor: CachePersistor<{}>,
) => Promise<CachePersistor<{}>>;

export type ComponentProps = any &
  PropsWithChildren<{}> & {
    className?: string;
    id?: string;
    value?: any;
    onChange?: any;
    name?: string;
  };

export type IEnum<T extends object> = T[keyof T];

export type InputChangeEvent = ChangeEvent<HTMLInputElement>;
