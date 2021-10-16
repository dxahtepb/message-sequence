export interface TraceEvent {
  tag: "UserEventData" | "MessageData";
  sender: string;
  traceId: string;
}
