export interface TraceEvent {
  tag: "UserEventData" | "MessageData";
  sender: string;
  receiver: string;
  traceId: string;
}
