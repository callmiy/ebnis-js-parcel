/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ComponentType } from "react";
import "@marko/testing-library/cleanup-after-each";
import { render } from "@testing-library/react";
import { NotFound, Props } from "../components/NotFound";

jest.mock("../components/Page404", () => ({
  Page404: () => null,
}));

const NotFoundP = NotFound as ComponentType<Partial<Props>>;

it("renders", () => {
  const { ui } = makeComp({
    props: {},
  });

  const {} = render(ui);
});

////////////////////////// HELPER FUNCTIONS ///////////////////////////////////

function makeComp({ props = {} }: { props?: Partial<Props> } = {}) {
  return {
    ui: <NotFoundP {...props} />,
  };
}
