describe("envvy high-level flow", () => {
  it("opens key pages", () => {
    cy.visit("/login");
    cy.contains("envvy account");
    cy.visit("/explore");
    cy.contains("Explore env repositories");
  });
});
