import {TraceEvent} from "./TraceEvent";

export interface UserEventData extends TraceEvent {
  tag: "UserEventData";
  sender: string;
  label: string;
  traceId: string;
  ts: number;
  logicalTs?: number;
  tooltipMessage: string;
  original: any;
}

export function isUserEventData(_: TraceEvent): _ is UserEventData {
  return (_ as UserEventData).tag === "UserEventData"
}
