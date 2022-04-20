/// <reference types="cypress">

describe("Map Test", () => {
    it.only("map viewer legend widget test", () => {
        cy.openClmsPortal()
        // Map viewer
        cy.get('[href="/en/map-viewer"]').contains('a','Map viewer')
        //cy.get('[href="/en/map-viewer"]').click()
        //Wait to render
        cy.wait(2000)
    })
});
