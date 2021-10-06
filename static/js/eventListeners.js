d3.select("#settings-button").on("click", () => {
  const settingsButton = d3.select("#settings-button");
  const settings = d3.select("#settings");
  if (settings.attr("show") === "true") {
    settingsButton.text("Open Settings");
    settings
      .attr("show", false)
      .style("pointer-events", "none")
      .transition()
      .duration(300)
      .style("opacity", 0);
  } else {
    settingsButton.text("Close Settings");
    settings
      .attr("show", true)
      .style("pointer-events", "auto")
      .transition()
      .duration(300)
      .style("opacity", 1);
  }
});

d3.select("#clear-button").on("click", () => {
  document.getElementById("file-selector").value = "";
  settings.dataFilePath = "";
  settings.readableFilePath = "";
  settings.apply();
  update("");
});

d3.select("#button-apply-settings").on("click", () => {
  settings.apply();
  update(settings.dataFilePath);
});

document.getElementById("file-selector").addEventListener("change", () => {
  settings.apply();
  update(settings.dataFilePath);
});

window.addEventListener("scroll", () => {
  Array.from(document.getElementsByClassName("sticky-trace-header")).forEach(
    (element, i) => {
      const x = X_PAD + i * VERT_SPACE;
      let y = Y_PAD;
      if (window.scrollY > Y_PAD) {
        y = screenYtoSVGUnits(window.scrollY);
      }
      element.setAttribute("transform", `translate(${x}, ${y})`);
    }
  );
});
