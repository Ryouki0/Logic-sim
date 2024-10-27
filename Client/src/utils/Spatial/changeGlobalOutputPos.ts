import { DEFAULT_BORDER_WIDTH, DEFAULT_INPUT_DIM, MINIMAL_BLOCKSIZE } from "../../Constants/defaultDimensions";
import { BinaryIO } from "../../Interfaces/BinaryIO";

export default function changeGlobalOutputPosition(output: BinaryIO, CANVAS_WIDTH: number, blockSize: number){
	const newOutput = {
		...output,
		position: {
			x: CANVAS_WIDTH - blockSize,
			y: (output.style?.top as number) + DEFAULT_INPUT_DIM.height - DEFAULT_BORDER_WIDTH
		}
	};
	return newOutput;
}