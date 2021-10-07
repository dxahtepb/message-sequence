import {MessageData} from "../Types/MessageData";

export function drawTimestamp(svg: any, xPos: number, yPos: number, m: MessageData, renderedTimestamps: Set<number>) {
  if (!renderedTimestamps.has(yPos)) {
    renderedTimestamps.add(yPos)
    svg
      .append("g")
      .attr("transform", `translate(${xPos}, ${yPos})`)
      .attr("class", "first")
      .attr("text-anchor", "middle")
      .append("text")
      .style("font-size", "10px")
      .text(() => m.endTs);
  }
}
