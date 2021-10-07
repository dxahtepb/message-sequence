// request types
export const REQUEST_TYPE = "commute::rpc::proto::Request";
export const RESPONSE_TYPE = "commute::rpc::proto::Response";

// svg render
export const VERT_SPACE = 170;
export const X_PAD = 100;
export const Y_PAD = 70;
export const MESSAGE_LABEL_X_OFFSET = -40;
export const MESSAGE_ARROW_Y_OFFSET = Y_PAD + 50;
export const MESSAGE_SPACE = 30;
export const DEFAULT_STROKE_WIDTH = "1px";
export const SELECTED_STROKE_WIDTH = "2px";
export const CLASS_WIDTH = VERT_SPACE - 10;

// timescales
export enum TimeScale {
  LOGICAL = "logical",
  REAL = "real"
}

// default settings
export const DEFAULT_COLORIZE_TRACES = true
export const DEFAULT_TIME_SCALE = TimeScale.LOGICAL
export const DEFAULT_TRACE = "dataSample/traceSample.json";
export const DEFAULT_TRACE_FILENAME = "traceSample.json"
