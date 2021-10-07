import * as d3 from "d3";
import {createTooltipClosure} from "./js/Tooltip";
import {MessageData} from "./js/Types/MessageData";
import {
  CLASS_WIDTH,
  DEFAULT_STROKE_WIDTH,
  MESSAGE_ARROW_Y_OFFSET,
  MESSAGE_LABEL_X_OFFSET,
  MESSAGE_SPACE,
  RESPONSE_TYPE,
  VERT_SPACE,
  X_PAD,
  Y_PAD
} from "./js/Constants";
import {settings} from "./js/Settings";
import {escapeHtml, replaceNewlineWithBr} from "./js/Util";
import {compressTimestamps, createTimeScaleModel} from "./js/TimespampModel";
import {arrowColorSelector} from "./js/Colors";
import {applyStickyScrollForClass} from "./js/Svg/StickyScroll";
import {makeArrowLine} from "./js/Svg/MessageArrow";
import {drawTimestamp} from "./js/Svg/Timestamp";
import {arrowColoredMarkerClosure} from "./js/Svg/ColoredArrowMarker";

console.log(d3.version);

function update(dataPath: string) {
  d3.selectAll("svg#chart1").remove();
  d3.select("#container").append("svg").attr("id", "chart1");
  if (dataPath !== "") {
    d3.json<any>(dataPath)
      .then(transformTraceData)
      .then(processData)
      .catch(showError);
  } else {
    processData([]);
  }
}

function transformTraceData(rawData: Array<any>) {
  // Assume we've got dataSample-like format
  if (rawData.length !== 0 && rawData[0].event_type === undefined) {
    return rawData;
  }
  // Data is in traceSample format
  const converted = rawData
    .filter((d) => d.event_type === "message")
    .map((d) => {
      const tooltip = JSON.stringify(d.payload, null, "  ");
      return {
        sender: d.source_host,
        receiver: d.dest_host,
        label: d.payload.method,
        traceId: d.payload.trace_id || "",
        tooltipMessage: replaceNewlineWithBr(escapeHtml(tooltip)),
        startTs: d.send_time,
        endTs: d.receive_time,
        payloadType: d.payload.type,
        original: d,
      } as MessageData;
    });
  const logicalTimestamps = compressTimestamps(converted);
  converted.map((d) => {
    d.logicalStart = logicalTimestamps.get(d.startTs);
    d.logicalEnd = logicalTimestamps.get(d.endTs);
  });
  return converted;
}

function processData(data: Array<MessageData>) {
  // Get unique classes
  const senders = d3.set(data.map((d) => d.sender)).values();
  const receivers = d3.set(data.map((d) => d.receiver)).values();
  const classes = [...new Set([...senders, ...receivers])].sort((a, b) => {
    if (a.startsWith("Client") && b.startsWith("Server")) {
      return -1;
    } else if (a.startsWith("Server") && b.startsWith("Client")) {
      return 1;
    } else {
      return 0;
    }
  });
  console.log(classes);

  const svg = d3.select("svg#chart1"),
    margin = {top: 10, right: 50, bottom: 100, left: 80},
    width = VERT_SPACE * classes.length - margin.left - margin.right;
  const defs = svg.append("svg:defs");

  if (data.length === 0) {
    svg.attr("height", 800);
    svg.attr("width", "100%");

    // Graph title
    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${Y_PAD - margin.top})`)
      .append("text")
      .attr("x", 400)
      .attr("y", 0 - margin.top / 3)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Nothing to show, choose file with trace to draw message sequence");
    return;
  }

  // Graph title
  svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${Y_PAD - margin.top})`)
    .append("text")
    .attr("x", width / 2)
    .attr("y", 0 - margin.top / 3)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text(`Sequence diagram ${settings.readableFilePath}`);

  // Prepare data
  // todo: dont do it twice
  const logicalTimestamps = compressTimestamps(data);
  // todo: move to TimestampModel
  let height: number;
  if (settings.timeScale === "logical") {
    height = MESSAGE_ARROW_Y_OFFSET + logicalTimestamps.size * MESSAGE_SPACE;
  } else {
    const maxTs = data.reduce((currentMax, value) =>
      currentMax.endTs > value.endTs ? currentMax : value
    ).endTs;
    height = maxTs + Y_PAD + 100;
  }

  svg.attr("height", height);
  svg.attr("width", X_PAD + VERT_SPACE * classes.length);

  // Draw vertical lines
  classes.forEach((_, i: number) => {
    svg
      .append("line")
      .style("stroke", "#888")
      .attr("x1", X_PAD + i * VERT_SPACE)
      .attr("y1", Y_PAD)
      .attr("x2", X_PAD + i * VERT_SPACE)
      .attr("y2", height);
  });

  // Append div with tooltip
  const showTooltipClosure = createTooltipClosure();

  // Draw message arrows
  const colorSelector = arrowColorSelector(settings, data);
  const arrowColoredMarker = arrowColoredMarkerClosure(defs);
  const timeScaleModel = createTimeScaleModel(settings)

  data.forEach((m) => {
    const xStart = X_PAD + classes.indexOf(m.sender) * VERT_SPACE;
    const xEnd = X_PAD + classes.indexOf(m.receiver) * VERT_SPACE;
    const yCoords = timeScaleModel(m)
    const color = colorSelector(m);

    const path = makeArrowLine(svg, m, xStart, yCoords.start, xEnd, yCoords.end)
      .attr("trace-id", m.traceId)
      .attr("marker-end", arrowColoredMarker(color))
      .style("stroke", color)
      .style("stroke-width", DEFAULT_STROKE_WIDTH);
    const clickPath = makeArrowLine(svg, m, xStart, yCoords.start, xEnd, yCoords.end)
      .style("stroke", "rgba(0,0,0,0)")
      .style("cursor", "pointer")
      .style("stroke-width", "5px");
    clickPath.on("click", showTooltipClosure(m, path));
    if (m.payloadType === RESPONSE_TYPE) {
      path.style("stroke-dasharray", "5, 3");
    }

    svg
      .append("g")
      .attr("transform", `translate(${xStart}, ${yCoords.start})`)
      .append("text")
      .attr("dx", "5px")
      .attr("dy", "-2px")
      .attr("text-anchor", "begin")
      .style("font-size", "13px")
      .style("cursor", "pointer")
      .text(() => m.label)
      .on("click", showTooltipClosure(m, path));
  });

  // Draw message timestamps
  const renderedTimestamps = new Set<number>();
  data.forEach((m) => {
    const xPos = X_PAD + MESSAGE_LABEL_X_OFFSET;
    const yCoords = timeScaleModel(m)
    drawTimestamp(svg, xPos, yCoords.start, m, renderedTimestamps);
    drawTimestamp(svg, xPos, yCoords.end, m, renderedTimestamps);
  });

  // Draw classes
  classes.forEach((c, i) => {
    const x = X_PAD + i * VERT_SPACE;
    const g = svg
      .append("g")
      .attr("transform", `translate(${x}, ${Y_PAD})`)
      .attr("class", "class-rect sticky-trace-header");
    g.append("rect")
      .attr("x", -CLASS_WIDTH / 2)
      .attr("y", 0)
      .attr("width", CLASS_WIDTH)
      .attr("height", "24px");
    g.append("text")
      .attr("class", "class-label")
      .attr("text-anchor", "middle")
      .text(() => c)
      .attr("dy", "16px");
  });
}

function showError(error: any) {
  console.error(error);
  const svg = d3.select("svg#chart1"),
    margin = {top: 10, right: 50, bottom: 100, left: 80};
  svg.attr("height", 800);
  svg.attr("width", "100%");

  // Graph title
  svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${Y_PAD - margin.top})`)
    .append("text")
    .attr("x", 400)
    .attr("y", 0 - margin.top / 3)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text(
      "Can't draw trace from " +
      settings.readableFilePath +
      "! Did u chose correct trace file?"
    );
}

d3.select("#clear-button").on("click", () => {
  const file_selector = document.querySelector<HTMLInputElement>("#file-selector")
  if (file_selector) {
    file_selector.value = ""
  }
  settings.dataFilePath = "";
  settings.readableFilePath = "";
  settings.apply();
  update("");
});

d3.select("#button-apply-settings").on("click", () => {
  settings.apply();
  update(settings.dataFilePath);
});

document.querySelector<HTMLInputElement>("#file-selector")
  ?.addEventListener("change", () => {
    settings.apply();
    update(settings.dataFilePath);
  });

settings.apply();
applyStickyScrollForClass(window, "sticky-trace-header");

// Get data attach to window
update(settings.dataFilePath);
