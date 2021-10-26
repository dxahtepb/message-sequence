import * as d3 from "d3-selection";

export function initHelpButton(document: Document) {
  document.querySelector<HTMLButtonElement>("button[id=toggle-help-button]")
    ?.addEventListener("click", () => {
      const helpButton = document.querySelector<HTMLButtonElement>("button[id=toggle-help-button]");
      const helpDiv = d3.select("#help-container");
      if (helpButton == null || helpDiv == null) {
        throw "Cannot get help div or toggle help button"
      }
      if (helpDiv.attr("show") === "true") {
        helpButton.textContent = "Open Help";
        helpDiv
          .attr("show", false)
          .style("pointer-events", "none")
          .transition()
          .duration(300)
          .style("opacity", 0);
      } else {
        helpButton.textContent = "Close Help";
        helpDiv
          .attr("show", true)
          .style("pointer-events", "auto")
          .style("top", "45px")
          .transition()
          .duration(300)
          .style("opacity", 1);
      }
    });
}
