import { DEFAULT_INPUT_DIM, LINE_WIDTH, MINIMAL_BLOCKSIZE } from "../Constants/defaultDimensions";

export default function getSizes(blockSize: number){
    let multiplier = blockSize / MINIMAL_BLOCKSIZE;
    let lineWidth = LINE_WIDTH * multiplier;
    let ioRadius = DEFAULT_INPUT_DIM.width * multiplier;
    return {lineWidth: lineWidth, ioRadius: ioRadius};
}