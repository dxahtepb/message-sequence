import {VERT_SPACE} from "../Constants";
import {MessageData} from "../Types/MessageData";
import {Path, path} from "d3";

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
