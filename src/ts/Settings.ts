import * as d3 from "d3-selection";
import {
  DEFAULT_COLORIZE_TRACES,
  DEFAULT_TIME_SCALE,
  DEFAULT_TRACE,
  DEFAULT_TRACE_FILENAME,
  TimeScale
} from "./Constants";
import {UpdateEvent} from "./Events/Update";

export interface Settings {
  isColorizeTraces: boolean;
  timeScale: TimeScale;
  dataFilePath: string;
  readableFilePath: string;

  apply(): void;
}

export const settings: Settings = {
  isColorizeTraces: DEFAULT_COLORIZE_TRACES,
  timeScale: DEFAULT_TIME_SCALE,
  dataFilePath: DEFAULT_TRACE,
  readableFilePath: DEFAULT_TRACE_FILENAME,
  apply: () => {
    settings.isColorizeTraces = document.querySelector<HTMLInputElement>(
      "input[id=colorize-traces]"
    )?.checked ?? DEFAULT_COLORIZE_TRACES;
    const timeScaleSelectorValue = document.querySelector<HTMLInputElement>(
      'input[name="time-scale-selector"]:checked'
    )?.value ?? DEFAULT_TIME_SCALE
    settings.timeScale = timeScaleSelectorValue === TimeScale.LOGICAL
      ? TimeScale.LOGICAL
      : TimeScale.REAL;
    const files = document.querySelector<HTMLInputElement>("[id=file-selector]")?.files;
    if (files != null && files.length !== 0) {
      settings.readableFilePath = files[0].name;
      settings.dataFilePath = URL.createObjectURL(files[0]);
    }
    console.log(settings);
  },
};

document.querySelector<HTMLButtonElement>("button[id=settings-button]")
  ?.addEventListener("click", () => {
    const settingsButton = document.querySelector<HTMLButtonElement>("button[id=settings-button]");
    const settings = d3.select("#settings");
    if (settingsButton == null || settings == null) {
      throw "Cannot get settings div or settings button"
    }
    if (settings.attr("show") === "true") {
      settingsButton.textContent = "Open Settings";
      settings
        .attr("show", false)
        .style("pointer-events", "none")
        .transition()
        .duration(300)
        .style("opacity", 0);
    } else {
      settingsButton.textContent = "Close Settings";
      settings
        .attr("show", true)
        .style("pointer-events", "auto")
        .transition()
        .duration(300)
        .style("opacity", 1);
    }
  });

document.querySelector<HTMLButtonElement>("#button-apply-settings")
  ?.addEventListener("click", () => {
    settings.apply();
    window.dispatchEvent(new UpdateEvent(settings))
  });

document.getElementById("select-file-button")
  ?.addEventListener("click", () => document.getElementById('file-selector')?.click());