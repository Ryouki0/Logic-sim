import { getClosestBlock } from "../drawingFunctions/getClosestBlock";

export const MINIMAL_BLOCKSIZE = 30;
export const DEFAULT_INPUT_DIM = {width: 23, height: 23};

export const DEFAULT_GATE_DIM = {width: 100, height: 100};
export const LINE_WIDTH = 8;
export const CANVAS_OFFSET_LEFT = 0*MINIMAL_BLOCKSIZE;
export const CANVAS_WIDTH_MULTIPLIER = getClosestBlock(0, 0.9*window.innerWidth).roundedY;