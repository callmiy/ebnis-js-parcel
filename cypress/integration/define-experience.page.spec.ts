import { USER_REGISTRATION_OBJECT } from "../support/user-registration-object";
import { FieldType } from "../../src/graphql/apollo-types/globalTypes";
import { EXPERIENCE_DEFINITION_URL } from "../../src/routes";
import { EXPERIENCE_DEFINITION_TITLE } from "../../src/constants";
import { getDescendantByText } from "../support/get-descendant-by-text";

context("define experience page", () => {
  beforeEach(() => {
    cy.checkoutSession();
    cy.registerUser(USER_REGISTRATION_OBJECT);
  });

  afterEach(() => {
    cy.closeSession();
  });

  it("defines experience successfully", () => {
    /**
     * Given we are on experiences page
     */
    cy.visit(EXPERIENCE_DEFINITION_URL);

    /**
     * Then we should see the page title
     */
    cy.title().should("contain", EXPERIENCE_DEFINITION_TITLE);

    /**
     * When we complete the title field with new experience definition title
     */
    const title = "new experience title";
    cy.getByLabelText("Title").type(title);

    /**
     * And we complete the description field
     */
    cy.getByLabelText("Description").type("new experience description");

    /**
     * And we complete the field name field
     */
    cy.getByLabelText("Field 1 Name").type("experience field 1");

    /**
     * And we click on field type
     */
    cy.get('[name="fieldDefs[0].type"]')
      .click()
      .then($fieldType => {
        getDescendantByText(FieldType.DATETIME, $fieldType).click();
      });

    /**
     * And submit the form
     */
    cy.getByText("Submit").click();

    /**
     * Then we should see the new title we just created
     */
    cy.title().should("contain", title);
  });

  it("fails if title already exists", () => {
    /**
     * Given that an experience definition with known title exists in the
     * system
     */
    const title = "new experience title";

    cy.defineExperience({
      title,
      fieldDefs: [
        {
          type: FieldType.DATE,
          name: "Some random field"
        }
      ]
    });

    /**
     * When we visit the page
     */
    cy.visit(EXPERIENCE_DEFINITION_URL);

    /**
     * Then we should not see any error
     */
    cy.get('[data-testid="graphql-errors-summary"]').should("not.exist");

    /**
     * And complete the form with same title as in the system and submit
     */

    cy.getByLabelText("Title").type(title);

    cy.getByLabelText("Field 1 Name").type("experience field 1");

    cy.get('[name="fieldDefs[0].type"]')
      .click()
      .then($fieldType => {
        getDescendantByText(FieldType.MULTI_LINE_TEXT, $fieldType).click();
      });

    cy.getByText("Submit").click();

    /**
     * Then we should see error
     */
    cy.get('[data-testid="graphql-errors-summary"]').should("exist");
  });
});