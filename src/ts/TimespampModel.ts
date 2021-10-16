import {Settings} from "./Settings";
import {isMessageData, MessageData} from "./Types/MessageData";
import {MESSAGE_ARROW_Y_OFFSET, MESSAGE_SPACE, TimeScale} from "./Constants";
import {TraceEvent} from "./Types/TraceEvent";
import {isUserEventData, UserEventData} from "./Types/UserEventData";

export function compressTimestamps(data: Array<TraceEvent>) {
  const starts = data.map((d) => {
    if (isMessageData(d)) {
      return d.startTs;
    } else if (isUserEventData(d)) {
      return d.ts
    }
    throw "Unknown message type"
  });
  const ends = data
    .filter((d): d is MessageData => isMessageData(d))
    .map((d) => d.endTs);
  const realTimestamps = [...new Set([...starts, ...ends])];
  realTimestamps.sort((a, b) => a - b);
  const logicalTimestamps = new Map();
  realTimestamps.forEach((ts, i) => logicalTimestamps.set(ts, i));
  return logicalTimestamps;
}

function timestampsForMessageData(settings: Settings, message: MessageData) {
  if (settings.timeScale === TimeScale.LOGICAL) {
    if (message.logicalStart == null || message.logicalEnd == null) {
      throw "Message does not have logical timestamps";
    }
    return {
      start: MESSAGE_ARROW_Y_OFFSET + message.logicalStart * MESSAGE_SPACE,
      end: MESSAGE_ARROW_Y_OFFSET + message.logicalEnd * MESSAGE_SPACE
    }
  } else {
    return {
      start: MESSAGE_ARROW_Y_OFFSET + message.startTs,
      end: MESSAGE_ARROW_Y_OFFSET + message.endTs
    }
  }
}

function timestampsForUserEventData(settings: Settings, message: UserEventData) {
  if (settings.timeScale === TimeScale.LOGICAL) {
    if (message.logicalTs == null) {
      throw "Message does not have logical timestamps";
    }
    return {
      start: MESSAGE_ARROW_Y_OFFSET + message.logicalTs * MESSAGE_SPACE,
      end: MESSAGE_ARROW_Y_OFFSET + message.logicalTs * MESSAGE_SPACE
    }
  } else {
    return {
      start: MESSAGE_ARROW_Y_OFFSET + message.ts,
      end: MESSAGE_ARROW_Y_OFFSET + message.ts
    }
  }
}

export function createTimeScaleModel(settings: Settings) {
  return (message: TraceEvent) => {
    if (isMessageData(message)) {
      return timestampsForMessageData(settings, message as MessageData)
    } else if (isUserEventData(message)) {
      return timestampsForUserEventData(settings, message as UserEventData)
    }
    throw "Unknown message type"
  }
}
