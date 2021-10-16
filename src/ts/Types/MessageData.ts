import {TraceEvent} from "./TraceEvent";

export interface MessageData extends TraceEvent {
  tag: "MessageData"
  sender: string;
  receiver: string;
  label: string;
  traceId: string
  startTs: number;
  endTs: number;
  logicalStart?: number;
  logicalEnd?: number;
  payloadType: string;
  tooltipMessage: string;
  original: any;
}

export function isMessageData(_: TraceEvent): _ is MessageData {
  return (_ as MessageData).tag === "MessageData"
}
