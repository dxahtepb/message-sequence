import {Settings} from "./Settings";
import {MessageData} from "./Types/MessageData";

export function arrowColorSelector(settings: Settings, data: Array<MessageData>) {
  const BLACK = "#000000";
  if (settings.isColorizeTraces) {
    const traceIdToColor = assignColorsToTraceId(data);
    return (message: MessageData) => traceIdToColor.get(message.traceId);
  } else {
    return (_: MessageData) => BLACK;
  }
}

function assignColorsToTraceId(data: Array<MessageData>) {
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

  const uniqueTraceIds = new Set(data.map((message) => message.traceId));
  let traceIdCountWithoutBlack = uniqueTraceIds.has("")
    ? uniqueTraceIds.size - 1
    : uniqueTraceIds.size;

  const traceToColor = new Map();

  if (traceIdCountWithoutBlack <= COLORS.length) {
    let currentColor = 0;
    uniqueTraceIds.forEach((traceId: string) => {
      if (traceId === "") {
        traceToColor.set(traceId, BLACK);
      } else {
        traceToColor.set(traceId, COLORS[currentColor]);
        currentColor++;
      }
    });
  } else {
    // if not enough distinct colors - all stay black
    uniqueTraceIds.forEach((traceId: string) => {
      traceToColor.set(traceId, BLACK);
    });
  }

  return traceToColor;
}
