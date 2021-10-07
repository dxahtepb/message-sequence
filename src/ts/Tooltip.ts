import * as d3 from "d3";
import {DEFAULT_STROKE_WIDTH, SELECTED_STROKE_WIDTH} from "./Constants";

/**
 * @return {function(*, *): function(): void}
 */
export function createTooltipClosure() {
  const container = d3.select("#tooltip-container");

  let tooltipDiv: any = d3.select("div[class='tooltip']");
  let fakeBox: any = d3.select("#tooltip-fakebox");
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

  return (message: any, line: any) => {
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
