export interface MessageData {
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
