import * as d3 from "d3-selection";

export interface Settings {
    isColorizeTraces: boolean;
    timeScale: string;
    dataFilePath: string;
    readableFilePath: string;

    apply(): void;
}

export const settings: Settings = {
    isColorizeTraces: true,
    timeScale: "logical",
    dataFilePath: "dataSample/traceSample.json",
    readableFilePath: "traceSample.json",
    apply: () => {
        settings.isColorizeTraces = document.querySelector<HTMLInputElement>(
            "input[id=colorize-traces]"
        )?.checked ?? true;
        settings.timeScale = document.querySelector<HTMLInputElement>(
            'input[name="time-scale-selector"]:checked'
        )?.value ?? "logical";
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
