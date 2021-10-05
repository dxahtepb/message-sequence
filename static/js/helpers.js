function makeLink(svg, m, xStart, yStart, xEnd, yEnd) {
  let pathD =
    m.sender === m.receiver
      ? makeArc(xStart, yStart, xEnd, yEnd, d3.path())
      : makeLine(xStart, yStart, xEnd, yEnd, d3.path());
  return svg.append("path").attr("fill", "none").attr("d", pathD);
}

/**
 *  @param {number} length
 *  @returns {string} random string
 */
function generateId(length) {
  const arr = new Uint8Array((length || 40) / 2);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (_) => _.toString(16).padStart(2, "0")).join("");
}

/**
 * @return {function(*, *, *): function(): void}
 */
function createTooltipClosure() {
  const container = d3.select("#tooltip-container");

  let tooltipDiv = d3.select("div[class='tooltip']");
  let fakeBox = d3.select("#tooltip-fakebox");
  if (tooltipDiv.size() === 0) {
    fakeBox = container
      .append("div")
      .attr("class", "fakebox")
      .attr("id", "tooltip-fakebox");
    tooltipDiv = container
      .append("div")
      .attr("class", "tooltip")
      .attr("show", false)
      .style("opacity", 0);
  }

  return (message, line) => {
    function show() {
      tooltipDiv
        .attr("show", true)
        .style("pointer-events", "auto")
        .html(
          `<div class='tooltip-info'>
              from: ${message.sender}
              <br/>to: ${message.receiver}
              <br/>started: ${message.startTs}
              <br/>finished: ${message.endTs}
              <br/>trace-id: ${message.traceId}
              <br/>
              </div>
              <pre class='tooltip-message'> ${message.tooltipMessage}
              </pre>`
        )
        .style("left", `${d3.event.pageX}px`)
        .style("top", `${d3.event.pageY - 28}px`)
        .transition()
        .duration(200)
        .style("opacity", 1);
      line
        .transition()
        .duration(200)
        .style("stroke-width", SELECTED_STROKE_WIDTH);
      fakeBox.on("click", hide).style("display", "block");
    }

    function hide() {
      tooltipDiv
        .attr("show", false)
        .style("pointer-events", "none")
        .transition()
        .duration(300)
        .style("opacity", 0)
        .on("end", () => {
          tooltipDiv.text("");
        });
      line
        .transition()
        .duration(300)
        .style("stroke-width", DEFAULT_STROKE_WIDTH);
      fakeBox.on("click", null).style("display", "none");
    }

    return () => {
      if (tooltipDiv.attr("show") === "true") {
        hide();
      } else {
        show();
      }
    };
  };
}

/**
 * @param {object[]} data
 * @param {string} data.traceId
 * @return {Map<string, string>} mapping of traceId to Color
 */
function assignColorsToTraceId(data) {
  const BLACK = "#000000";
  const COLORS = [
    "#e6194B",
    "#3cb44b",
    "#ffe119",
    "#4363d8",
    "#f58231",
    "#911eb4",
    "#42d4f4",
    "#f032e6",
    "#bfef45",
    "#fabed4",
    "#469990",
    "#dcbeff",
    "#9A6324",
    "#fffac8",
    "#800000",
    "#aaffc3",
    "#808000",
    "#ffd8b1",
    "#000075",
  ];

  const uniqueTraceIds = new Set(data.map((_) => _.traceId));
  let traceIdCountWithoutBlack = uniqueTraceIds.has("")
    ? uniqueTraceIds.size - 1
    : uniqueTraceIds.size;

  const traceToColor = new Map();

  if (traceIdCountWithoutBlack <= COLORS.length) {
    let currentColor = 0;
    uniqueTraceIds.forEach((traceId) => {
      if (traceId === "") {
        traceToColor.set(traceId, BLACK);
      } else {
        traceToColor.set(traceId, COLORS[currentColor]);
        currentColor++;
      }
    });
  } else {
    // if not enough distinct colors - all stay black
    uniqueTraceIds.forEach((traceId) => {
      traceToColor.set(traceId, BLACK);
    });
  }

  return traceToColor;
}

/**
 * @return {function(*): string}
 */
function arrowColorSelector(settings, data) {
  const BLACK = "#000000";
  if (settings.isColorizeTraces) {
    const traceIdToColor = assignColorsToTraceId(data);
    return (message) => traceIdToColor.get(message.traceId);
  } else {
    return (_) => BLACK;
  }
}

/**
 * @return {function(string): string}
 */
function arrowColoredMarkerClosure(svgDefs) {
  const usedColors = new Set();

  return (color) => {
    const colorWithoutHash = color.replace("#", "");
    if (!usedColors.has(color)) {
      svgDefs
        .append("svg:marker")
        .attr("id", "arrowColoredMarker" + colorWithoutHash)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 10)
        .attr("refY", 0)
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5")
        .style("fill", color);
      usedColors.add(color);
    }
    return `url(#arrowColoredMarker${colorWithoutHash})`;
  };
}

/**
 * @param {Object[]} data
 * @param {number} data.startTs
 * @param {number} data.endTs
 */
function compressTimestamps(data) {
  const starts = data.map((d) => d.startTs);
  const ends = data.map((d) => d.endTs);
  const realTimestamps = [...new Set([...starts, ...ends])];
  realTimestamps.sort((a, b) => a - b);
  const logicalTimestamps = new Map();
  realTimestamps.forEach((ts, i) => logicalTimestamps.set(ts, i));
  console.log(realTimestamps);
  return logicalTimestamps;
}

function escapeHtml(str) {
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[
        tag
      ] || tag)
  );
}

function showError(error) {
  console.error(error);
  const svg = d3.select("svg#chart1"),
    margin = { top: 10, right: 50, bottom: 100, left: 80 };
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

// Converts a screen Y position to SVG units which have a viewBox transform
function screenYtoSVGUnits(val) {
  const svg = document.getElementById("chart1");
  let pt = svg.createSVGPoint();
  pt.x = 0;
  pt.y = val;
  pt = pt.matrixTransform(svg.getCTM().inverse());
  return pt.y;
}

function makeArc(xStart, yStart, xEnd, yEnd, context) {
  const xMid = xStart + VERT_SPACE / 2,
    yMid = (yEnd + yStart) / 2,
    radius = (yEnd - yStart) / 2;
  context.moveTo(xStart, yStart);
  context.arcTo(xMid, yMid, xEnd, yEnd, radius);
  context.lineTo(xEnd, yEnd);
  return context;
}

function makeLine(xStart, yStart, xEnd, yEnd, context) {
  context.moveTo(xStart, yStart);
  context.lineTo(xEnd, yEnd);
  return context;
}
