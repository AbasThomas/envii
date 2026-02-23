describe("envii high-level flow", () => {
  it("opens login and explore pages", () => {
    cy.visit("/login");
    cy.contains("envii account");
    cy.visit("/explore");
    cy.contains("Explore env repositories");
  });
});
