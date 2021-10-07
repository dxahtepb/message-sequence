import {Settings} from "./Settings";
import {MessageData} from "./Types/MessageData";
import {MESSAGE_ARROW_Y_OFFSET, MESSAGE_SPACE} from "./Constants";

export function compressTimestamps(data: Array<any>) {
  const starts = data.map((d) => d.startTs);
  const ends = data.map((d) => d.endTs);
  const realTimestamps = [...new Set([...starts, ...ends])];
  realTimestamps.sort((a, b) => a - b);
  const logicalTimestamps = new Map();
  realTimestamps.forEach((ts, i) => logicalTimestamps.set(ts, i));
  console.log(realTimestamps);
  return logicalTimestamps;
}

export function createTimeScaleModel(settings: Settings) {
  if (settings.timeScale === "logical") {
    return function (message: MessageData) {
      if (message.logicalStart == null || message.logicalEnd == null) {
        throw "Message does not have logical timestamps";
      }
      return {
        start: MESSAGE_ARROW_Y_OFFSET + message.logicalStart * MESSAGE_SPACE,
        end: MESSAGE_ARROW_Y_OFFSET + message.logicalEnd * MESSAGE_SPACE
      }
    }
  } else {
    return function (message: MessageData) {
      return {
        start: MESSAGE_ARROW_Y_OFFSET + message.startTs,
        end: MESSAGE_ARROW_Y_OFFSET + message.endTs
      }
    }
  }
}
