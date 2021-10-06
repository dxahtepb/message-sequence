console.log(d3.version);

const REQUEST_TYPE = "commute::rpc::proto::Request";
const RESPONSE_TYPE = "commute::rpc::proto::Response";
const VERT_SPACE = 170;
const X_PAD = 100;
const Y_PAD = 70;
const MESSAGE_LABEL_X_OFFSET = -40;
const MESSAGE_ARROW_Y_OFFSET = Y_PAD + 50;
const MESSAGE_SPACE = 30;
const DEFAULT_STROKE_WIDTH = "1px";
const SELECTED_STROKE_WIDTH = "2px";
const CLASS_WIDTH = VERT_SPACE - 10;

const settings = {
  isColorizeTraces: true,
  timeScale: "logical",
  dataFilePath: "traceSample.json",
  readableFilePath: "traceSample.json",
  apply: () => {
    settings.isColorizeTraces =
      document.getElementById("colorize-traces").checked;
    settings.timeScale = document.querySelector(
      'input[name="time-scale-selector"]:checked'
    ).value;
    const files = document.getElementById("file-selector").files;
    if (files.length !== 0) {
      settings.readableFilePath = files[0].name;
      settings.dataFilePath = URL.createObjectURL(files[0]);
    }
    console.log(settings);
  },
};

settings.apply();

function update(dataPath) {
  d3.selectAll("svg#chart1").remove();
  d3.select("#container").append("svg").attr("id", "chart1");
  if (dataPath !== "") {
    d3.json(dataPath)
      .then(transformTraceData)
      .then(processData)
      .catch(showError);
  } else {
    processData([]);
  }
}

function transformTraceData(rawData) {
  // Assume we've got dataSample-like format
  if (rawData.length !== 0 && rawData[0].event_type === undefined) {
    return rawData;
  }
  // Data is in traceSample format
  return rawData
    .filter((d) => d.event_type === "message")
    .map((d) => {
      const converted = {
        sender: d.source_host,
        receiver: d.dest_host,
        label: d.payload.method,
        tooltipMessage: JSON.stringify(d.payload, null, "  "),
        startTs: d.send_time,
        endTs: d.receive_time,
        payloadType: d.payload.type,
        original: d,
      };
      if (d.payload.trace_id !== undefined) {
        converted.traceId = d.payload.trace_id;
      }
      return converted;
    });
}

/**
 * @param {Object[]} data
 * @param {string} data.sender
 * @param {string} data.receiver
 * @param {string} data.label
 * @param {string} data.tooltipMessage
 * @param {string} data.traceId
 * @param {number} data.startTs
 * @param {number} data.endTs
 * @param {number} data.logicalStart
 * @param {number} data.logicalEnd
 */
function processData(data) {
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
    margin = { top: 10, right: 50, bottom: 100, left: 80 },
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
  const logicalTimestamps = compressTimestamps(data);
  data.forEach((d) => {
    d.logicalStart = logicalTimestamps.get(d.startTs);
    d.logicalEnd = logicalTimestamps.get(d.endTs);
    if (d.traceId === undefined) {
      d.traceId = "";
    }
    d.tooltipMessage = escapeHtml(d.tooltipMessage).replace(
      /\r\n|\r|\n/g,
      "<br>"
    );
  });

  let height;
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
  classes.forEach((c, i) => {
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

  data.forEach((m) => {
    const xStart = X_PAD + classes.indexOf(m.sender) * VERT_SPACE;
    const xEnd = X_PAD + classes.indexOf(m.receiver) * VERT_SPACE;
    let yStart, yEnd;
    if (settings.timeScale === "logical") {
      yStart = MESSAGE_ARROW_Y_OFFSET + m.logicalStart * MESSAGE_SPACE;
      yEnd = MESSAGE_ARROW_Y_OFFSET + m.logicalEnd * MESSAGE_SPACE;
    } else {
      yStart = MESSAGE_ARROW_Y_OFFSET + m.startTs;
      yEnd = MESSAGE_ARROW_Y_OFFSET + m.endTs;
    }
    const color = colorSelector(m);

    const path = makeLink(svg, m, xStart, yStart, xEnd, yEnd)
      .attr("trace-id", m.traceId)
      .attr("marker-end", arrowColoredMarker(color))
      .style("stroke", color)
      .style("stroke-width", DEFAULT_STROKE_WIDTH);
    const clickPath = makeLink(svg, m, xStart, yStart, xEnd, yEnd)
      .style("stroke", "rgba(0,0,0,0)")
      .style("cursor", "pointer")
      .style("stroke-width", "5px");
    clickPath.on("click", showTooltipClosure(m, path, clickPath));
    if (m.payloadType === RESPONSE_TYPE) {
      path.style("stroke-dasharray", "5, 3");
    }

    svg
      .append("g")
      .attr("transform", `translate(${xStart}, ${yStart})`)
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
  const renderedTimestamps = new Set();
  data.forEach((m) => {
    const xPos = X_PAD + MESSAGE_LABEL_X_OFFSET;
    let yStart, yEnd;
    if (settings.timeScale === "logical") {
      yStart = MESSAGE_ARROW_Y_OFFSET + m.logicalStart * MESSAGE_SPACE;
      yEnd = MESSAGE_ARROW_Y_OFFSET + m.logicalEnd * MESSAGE_SPACE;
    } else {
      yStart = MESSAGE_ARROW_Y_OFFSET + m.startTs;
      yEnd = MESSAGE_ARROW_Y_OFFSET + m.endTs;
    }

    if (!renderedTimestamps.has(yStart)) {
      renderedTimestamps.add(yStart);
      svg
        .append("g")
        .attr("transform", `translate(${xPos}, ${yStart})`)
        .attr("class", "first")
        .attr("text-anchor", "middle")
        .append("text")
        .style("font-size", "10px")
        .text(() => m.startTs);
    }

    if (!renderedTimestamps.has(yEnd)) {
      renderedTimestamps.add(yEnd);
      svg
        .append("g")
        .attr("transform", `translate(${xPos}, ${yEnd})`)
        .attr("class", "first")
        .attr("text-anchor", "middle")
        .append("text")
        .style("font-size", "10px")
        .text(() => m.endTs);
    }
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

// Get data attach to window
update(settings.dataFilePath);
