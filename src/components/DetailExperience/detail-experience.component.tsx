import React, {
  useLayoutEffect,
  Suspense,
  useReducer,
  useCallback,
} from "react";
import "./detail-experience.styles.scss";
import {
  Props,
  initState,
  reducer,
  ActionType,
  formatDatetime,
  effectFunctions,
} from "./detail-experience.utils";
import { setUpRoutePage } from "../../utils/global-window";
import { NewEntry } from "./detail-experience.lazy";
import Loading from "../Loading/loading.component";
import {
  EntryConnectionFragment,
  EntryConnectionFragment_edges,
} from "../../graphql/apollo-types/EntryConnectionFragment";
import { EntryFragment } from "../../graphql/apollo-types/EntryFragment";
import { DataObjectFragment } from "../../graphql/apollo-types/DataObjectFragment";
import { scrollIntoViewDomId } from "./detail-experience.dom";
import { StateValue } from "../../utils/types";
import { useRunEffects } from "../../utils/use-run-effects";

export function DetailExperience(props: Props) {
  const { experience } = props;
  const [stateMachine, dispatch] = useReducer(reducer, undefined, initState);
  const entries = entryConnectionToNodes(experience.entries);

  const {
    states: { newEntryActive: newEntryActiveState },
    effects: { general: generalEffects },
  } = stateMachine;

  useLayoutEffect(() => {
    setUpRoutePage({
      title: experience.title,
    });
  }, [experience]);

  useRunEffects(generalEffects, effectFunctions, props, { dispatch });

  const onOpenNewEntry = useCallback(() => {
    dispatch({
      type: ActionType.TOGGLE_NEW_ENTRY_ACTIVE,
    });
  }, []);

  const dataDefinitionIdToNameMap = experience.dataDefinitions.reduce(
    (acc, d) => {
      acc[d.id] = d.name;
      return acc;
    },
    {} as DataDefinitionIdToNameMap,
  );

  return (
    <>
      <div className="container detailed-experience-component">
        <span className="scroll-into-view" id={scrollIntoViewDomId} />

        {newEntryActiveState.value === StateValue.active && (
          <Suspense fallback={<Loading />}>
            <NewEntry
              experience={experience}
              detailedExperienceDispatch={dispatch}
            />
          </Suspense>
        )}

        {entries.length === 0 ? (
          <button className="button no-entry-alert" onClick={onOpenNewEntry}>
            Click here to create your first entry
          </button>
        ) : (
          <div className="entries">
            {entries.map((entry) => {
              return (
                <EntryComponent
                  key={entry.id}
                  entry={entry}
                  dataDefinitionIdToNameMap={dataDefinitionIdToNameMap}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="new-entry-trigger" onClick={onOpenNewEntry}>
        <span>+</span>
      </div>
    </>
  );
}

interface EntryProps {
  entry: EntryFragment;
  dataDefinitionIdToNameMap: DataDefinitionIdToNameMap;
}

interface DataDefinitionIdToNameMap {
  [dataDefinitionId: string]: string;
}

function EntryComponent(props: EntryProps) {
  const { entry, dataDefinitionIdToNameMap } = props;
  const { updatedAt, dataObjects: dObjects } = entry;

  const dataObjects = dObjects as DataObjectFragment[];

  return (
    <div className="box media entry">
      <div className="media-content">
        {dataObjects.map((d) => {
          const { id, definitionId, data } = d;

          return (
            <div key={id} className="media data-object">
              <div className="media-content">
                <div>{dataDefinitionIdToNameMap[definitionId]}</div>
                <div>{data}</div>
              </div>
            </div>
          );
        })}

        <div className='entry__updated-at'>{formatDatetime(updatedAt)}</div>
      </div>

      <div className="media-right">x</div>
    </div>
  );
}

function entryConnectionToNodes(entries: EntryConnectionFragment) {
  return (entries.edges as EntryConnectionFragment_edges[]).map((e) => {
    const edge = e as EntryConnectionFragment_edges;
    return edge.node as EntryFragment;
  });
}
