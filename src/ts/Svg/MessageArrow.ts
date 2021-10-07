import {VERT_SPACE} from "../Constants";
import {MessageData} from "../Types/MessageData";
import {BaseType, Path, path, Selection} from "d3";

export function makeArrowLine(svg: any, m: MessageData, xStart: number, yStart: number, xEnd: number, yEnd: number) {
  let pathD = m.sender === m.receiver
    ? makeArc(xStart, yStart, xEnd, yEnd, path())
    : makeLine(xStart, yStart, xEnd, yEnd, path());
  return svg.append("path").attr("fill", "none").attr("d", pathD);
}

function makeArc(xStart: number, yStart: number, xEnd: number, yEnd: number, context: Path) {
  const xMid = xStart + VERT_SPACE / 2,
    yMid = (yEnd + yStart) / 2,
    radius = (yEnd - yStart) / 2;
  context.moveTo(xStart, yStart);
  context.arcTo(xMid, yMid, xEnd, yEnd, radius);
  context.lineTo(xEnd, yEnd);
  return context;
}

function makeLine(xStart: number, yStart: number, xEnd: number, yEnd: number, context: Path) {
  context.moveTo(xStart, yStart);
  context.lineTo(xEnd, yEnd);
  return context;
}

type SvgDefsSelection = Selection<BaseType, any, any, any>;

export function arrowColoredMarkerClosure(svgDefs: SvgDefsSelection) {
  const usedColors = new Set();

  return (color: string) => {
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
