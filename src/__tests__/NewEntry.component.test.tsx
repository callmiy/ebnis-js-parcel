/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ComponentType } from "react";
import { render, cleanup, waitForElement, wait } from "@testing-library/react";
import { NewEntry } from "../components/NewEntry/new-entry.component";
import {
  Props,
  toISODateString,
  toISODatetimeString,
  reducer,
  ActionType,
  initState,
  GeneralEffect,
  effectFunctions,
  SubmissionErrors,
} from "../components/NewEntry/new-entry.utils";
import { defaultExperience, fillField } from "../tests.utils";
import { DataTypes } from "../graphql/apollo-types/globalTypes";
import { DataDefinitionFragment } from "../graphql/apollo-types/DataDefinitionFragment";
import {
  submitBtnDomId,
  notificationCloseId,
  fieldErrorSelector,
} from "../components/NewEntry/new-entry.dom";
import { isConnected } from "../utils/connections";
import { UpdateExperiencesOnlineMutationResult } from "../utils/experience.gql.types";
import { scrollIntoView } from "../utils/scroll-into-view";
import { CreateOfflineEntryResult } from "../components/NewEntry/new-entry.resolvers";
import { AppPersistor } from "../utils/app-context";
import { GENERIC_SERVER_ERROR } from "../utils/common-errors";

jest.mock("../utils/scroll-into-view");
const mockScrollIntoView = scrollIntoView as jest.Mock;

jest.mock("../utils/connections");
const mockIsConnected = isConnected as jest.Mock;

jest.mock("../components/NewEntry/new-entry.injectables");

jest.mock("../components/DateField/date-field.component", () => {
  return {
    DateField: ({ onChange, value, ...props }: any) => {
      return (
        <input
          type="text"
          {...props}
          value={value}
          onChange={(el) => {
            onChange(null, new Date(el.currentTarget.value));
          }}
        />
      );
    },
  };
});

jest.mock("../components/DateTimeField/date-time-field.component", () => {
  return {
    DateTimeField: ({ onChange, value, ...props }: any) => {
      const text = value.toJSON();
      return (
        <input
          type="text"
          {...props}
          value={text}
          onChange={(el) => {
            onChange(null, new Date(el.currentTarget.value));
          }}
        />
      );
    },
  };
});

const mockDispatch = jest.fn();
const mockCreateOfflineEntry = jest.fn();
const mockUpdateExperiencesOnline = jest.fn();
const mockDetailedExperienceDispatch = jest.fn();
const mockPersistFn = jest.fn();
const persistor = {
  persist: mockPersistFn as any,
} as AppPersistor;

afterEach(() => {
  cleanup();
  jest.resetAllMocks();
});

describe("component", () => {
  it("connected/renders date field/invalid server response", async () => {
    mockIsConnected.mockReturnValue(true);
    mockUpdateExperiencesOnline.mockResolvedValue({});

    const { ui } = makeComp({
      props: {
        experience: {
          ...defaultExperience,
          dataDefinitions: [
            {
              id: "1",
              type: DataTypes.DATE,
              name: "a",
            },
          ] as DataDefinitionFragment[],
        },
      },
    });
    render(ui);
    const inputEl = document.getElementById("1") as HTMLInputElement;
    const submitEl = document.getElementById(submitBtnDomId) as HTMLElement;
    const now = new Date();
    fillField(inputEl, now.toJSON());
    expect(getNotificationEl()).toBeNull();
    expect(mockScrollIntoView).not.toHaveBeenCalled();

    submitEl.click();

    const notificationEl = await waitForElement(getNotificationEl);
    expect(mockScrollIntoView).toHaveBeenCalled();
    notificationEl.click();
    expect(getNotificationEl()).toBeNull();

    expect(
      mockUpdateExperiencesOnline.mock.calls[0][0].variables.input[0]
        .addEntries[0],
    ).toEqual({
      dataObjects: [
        {
          data: `{"date":"${toISODateString(now)}"}`,
          definitionId: "1",
        },
      ],
      experienceId: "1",
    });
  });

  it("connected/renders datetime field/javascript exception", async () => {
    mockIsConnected.mockReturnValue(true);
    mockUpdateExperiencesOnline.mockRejectedValue("a");

    const { ui } = makeComp({
      props: {
        experience: {
          ...defaultExperience,
          dataDefinitions: [
            {
              id: "1",
              type: DataTypes.DATETIME,
              name: "a",
            },
          ] as DataDefinitionFragment[],
        },
      },
    });
    render(ui);
    const inputEl = document.getElementById("1") as HTMLInputElement;
    const submitEl = document.getElementById(submitBtnDomId) as HTMLElement;
    const now = new Date().toJSON();
    fillField(inputEl, now);
    expect(getNotificationEl()).toBeNull();

    submitEl.click();
    await waitForElement(getNotificationEl);
    expect(
      mockUpdateExperiencesOnline.mock.calls[0][0].variables.input[0]
        .addEntries[0],
    ).toEqual({
      dataObjects: [
        {
          data: `{"datetime":"${toISODatetimeString(now)}"}`,
          definitionId: "1",
        },
      ],
      experienceId: "1",
    });
  });

  it("connected/renders integer/server field errors/closes component", async () => {
    mockIsConnected.mockReturnValue(true);
    mockUpdateExperiencesOnline.mockResolvedValue({
      data: {
        updateExperiences: {
          __typename: "UpdateExperiencesSomeSuccess",
          experiences: [
            {
              __typename: "UpdateExperienceSomeSuccess",
              experience: {
                newEntries: [
                  {
                    __typename: "CreateEntryErrors",
                    errors: {
                      dataObjects: [
                        {
                          meta: {
                            index: 0,
                          },
                          clientId: "a",
                          definitionId: null,
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    } as UpdateExperiencesOnlineMutationResult);

    const { ui } = makeComp({
      props: {
        experience: {
          ...defaultExperience,
          dataDefinitions: [
            {
              id: "1",
              type: DataTypes.INTEGER,
              name: "a",
            },
          ] as DataDefinitionFragment[],
        },
      },
    });
    render(ui);
    const inputEl = document.getElementById("1") as HTMLInputElement;
    const submitEl = document.getElementById(submitBtnDomId) as HTMLElement;
    fillField(inputEl, "1");
    expect(getNotificationEl()).toBeNull();
    expect(getFieldError()).toBeNull();

    submitEl.click();
    await waitForElement(getNotificationEl);
    expect(getFieldError()).not.toBeNull();

    expect(mockDetailedExperienceDispatch).not.toHaveBeenCalled();
    getCloseComponentEl().click();
    expect(mockDetailedExperienceDispatch).toHaveBeenCalled();
    expect(
      mockUpdateExperiencesOnline.mock.calls[0][0].variables.input[0]
        .addEntries[0],
    ).toEqual({
      dataObjects: [
        {
          data: `{"integer":"1"}`,
          definitionId: "1",
        },
      ],
      experienceId: "1",
    });
  });

  it("unconnected/renders single line text/javascript exception", async () => {
    mockIsConnected.mockReturnValue(false);
    mockCreateOfflineEntry.mockRejectedValue("a");

    const { ui } = makeComp({
      props: {
        experience: {
          ...defaultExperience,
          dataDefinitions: [
            {
              id: "1",
              type: DataTypes.SINGLE_LINE_TEXT,
              name: "a",
            },
          ] as DataDefinitionFragment[],
        },
      },
    });
    render(ui);
    const inputEl = document.getElementById("1") as HTMLInputElement;
    const submitEl = document.getElementById(submitBtnDomId) as HTMLElement;
    fillField(inputEl, "b");
    expect(getNotificationEl()).toBeNull();

    submitEl.click();
    await waitForElement(getNotificationEl);
    expect(
      mockCreateOfflineEntry.mock.calls[0][0].variables.dataObjects[0].data,
    ).toEqual(`{"single_line_text":"b"}`);
  });

  it("unconnected/renders multi line text/invalid response", async () => {
    mockIsConnected.mockReturnValue(false);
    mockCreateOfflineEntry.mockResolvedValue({});

    const { ui } = makeComp({
      props: {
        experience: {
          ...defaultExperience,
          dataDefinitions: [
            {
              id: "1",
              type: DataTypes.MULTI_LINE_TEXT,
              name: "a",
            },
          ] as DataDefinitionFragment[],
        },
      },
    });
    render(ui);
    const inputEl = document.getElementById("1") as HTMLInputElement;
    const submitEl = document.getElementById(submitBtnDomId) as HTMLElement;
    fillField(inputEl, "a");
    expect(getNotificationEl()).toBeNull();

    submitEl.click();
    await waitForElement(getNotificationEl);
    expect(
      mockCreateOfflineEntry.mock.calls[0][0].variables.dataObjects[0].data,
    ).toEqual(`{"multi_line_text":"a"}`);
  });

  it("unconnected/renders decimal/ok", async () => {
    mockIsConnected.mockReturnValue(false);
    mockCreateOfflineEntry.mockResolvedValue({
      data: {
        createOfflineEntry: {
          entry: {},
        },
      },
    } as CreateOfflineEntryResult);

    const { ui } = makeComp({
      props: {
        experience: {
          ...defaultExperience,
          dataDefinitions: [
            {
              id: "1",
              type: DataTypes.DECIMAL,
              name: "a",
            },
          ] as DataDefinitionFragment[],
        },
      },
    });
    render(ui);
    const inputEl = document.getElementById("1") as HTMLInputElement;
    const submitEl = document.getElementById(submitBtnDomId) as HTMLElement;
    fillField(inputEl, "1.0");
    expect(mockDetailedExperienceDispatch).not.toHaveBeenCalled();
    expect(mockPersistFn).not.toHaveBeenCalled();

    submitEl.click();
    await wait(() => true);
    expect(mockDetailedExperienceDispatch).toHaveBeenCalled();
    expect(mockPersistFn).toHaveBeenCalled();
    expect(
      mockCreateOfflineEntry.mock.calls[0][0].variables.dataObjects[0],
    ).toEqual({
      data: `{"decimal":"1"}`,
      definitionId: "1",
    });
  });
});

describe("reducer", () => {
  const experience = {
    ...defaultExperience,
    dataDefinitions: [
      {
        id: "1",
        name: "a",
        type: DataTypes.DECIMAL,
      } as DataDefinitionFragment,
    ],
  };

  const effectArgs = {
    dispatch: mockDispatch,
  };
  const props = {
    updateExperiencesOnline: mockUpdateExperiencesOnline as any,
    detailedExperienceDispatch: mockDetailedExperienceDispatch as any,
    persistor,
    experience,
  } as Props;

  it("sets decimal to default zero/connected/success", async () => {
    mockIsConnected.mockResolvedValue(true);

    let state = initState(experience);

    state = reducer(state, {
      type: ActionType.ON_FORM_FIELD_CHANGED,
      fieldIndex: 0,
      value: "", // form value is empty
    });

    state = reducer(state, {
      type: ActionType.ON_SUBMIT,
    });

    const { key, ownArgs } = (state.effects
      .general as GeneralEffect).hasEffects.context.effects[0];

    mockUpdateExperiencesOnline.mockResolvedValue({
      data: {
        updateExperiences: {
          __typename: "UpdateExperiencesSomeSuccess",
          experiences: [
            {
              __typename: "UpdateExperienceSomeSuccess",
              experience: {
                newEntries: [
                  {
                    __typename: "CreateEntrySuccess",
                    entry: {},
                  },
                ],
              },
            },
          ],
        },
      },
    } as UpdateExperiencesOnlineMutationResult);

    expect(mockDetailedExperienceDispatch).not.toHaveBeenCalled();
    expect(mockPersistFn).not.toHaveBeenCalled();

    effectFunctions[key](ownArgs as any, props, effectArgs);
    await wait(() => true);
    expect(mockUpdateExperiencesOnline).toHaveBeenCalled();
    expect(mockDetailedExperienceDispatch).toHaveBeenCalled();
    expect(mockPersistFn).toHaveBeenCalled();
  });

  it("connected/server newEntries empty", async () => {
    mockIsConnected.mockResolvedValue(true);

    let state = initState(experience);

    state = reducer(state, {
      type: ActionType.ON_SUBMIT,
    });

    const { key, ownArgs } = (state.effects
      .general as GeneralEffect).hasEffects.context.effects[0];

    mockUpdateExperiencesOnline.mockResolvedValue({
      data: {
        updateExperiences: {
          __typename: "UpdateExperiencesSomeSuccess",
          experiences: [
            {
              __typename: "UpdateExperienceSomeSuccess",
              experience: {
                newEntries: [] as any,
              },
            },
          ],
        },
      },
    } as UpdateExperiencesOnlineMutationResult);

    expect(mockDispatch).not.toHaveBeenCalled();

    effectFunctions[key](ownArgs as any, props, effectArgs);
    await wait(() => true);
    expect(mockDetailedExperienceDispatch).not.toHaveBeenCalled();
    expect(mockPersistFn).not.toHaveBeenCalled();
    expect(mockDispatch.mock.calls[0][0].type).toBe(ActionType.ON_COMMON_ERROR);
  });

  it("server field errors no data objects errors", async () => {
    let state = initState(experience);

    state = reducer(state, {
      type: ActionType.ON_CREATE_ENTRY_ERRORS,
    } as any);

    expect(
      (state.states.submission as SubmissionErrors).errors.context.errors,
    ).toBe(GENERIC_SERVER_ERROR);
  });
});

////////////////////////// HELPER FUNCTIONS ///////////////////////////

const NewEntryP = NewEntry as ComponentType<Partial<Props>>;

function makeComp({ props = {} }: { props?: Partial<Props> } = {}) {
  const experience = props.experience || defaultExperience;

  return {
    ui: (
      <NewEntryP
        {...props}
        createOfflineEntry={mockCreateOfflineEntry}
        updateExperiencesOnline={mockUpdateExperiencesOnline}
        experience={experience}
        detailedExperienceDispatch={mockDetailedExperienceDispatch}
        persistor={persistor as any}
      />
    ),
  };
}

function getNotificationEl() {
  return document.getElementById(notificationCloseId) as HTMLElement;
}

function getFieldError() {
  return document
    .getElementsByClassName(fieldErrorSelector)
    .item(0) as HTMLElement;
}

function getCloseComponentEl() {
  return document
    .getElementsByClassName("new-entry__delete")
    .item(0) as HTMLElement;
}
