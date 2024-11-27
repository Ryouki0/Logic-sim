import { DEFAULT_INPUT_DIM, LINE_WIDTH, MINIMAL_BLOCKSIZE } from "../Constants/defaultDimensions";

export default function getSizes(blockSize: number){
	const multiplier = blockSize / MINIMAL_BLOCKSIZE;
	const lineWidth = LINE_WIDTH * multiplier;
	const ioRadius = DEFAULT_INPUT_DIM.width * multiplier;
	return {lineWidth: lineWidth, ioRadius: ioRadius};
}