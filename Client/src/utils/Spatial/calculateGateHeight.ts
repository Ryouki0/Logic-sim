import { Block } from "@uiw/react-color";
import { LINE_WIDTH, MINIMAL_BLOCKSIZE } from "../../Constants/defaultDimensions";
import { Gate } from "@Shared/interfaces";

export default function calculateGateHeight(gate: Gate, blockSize?: number) {
	if (!gate) return 0;
	const inputLength = gate.inputs.length;
	const outputLength = gate.outputs.length;
	const longest = inputLength > outputLength ? inputLength : outputLength;

	const multiplier = (inputLength <= 1 && outputLength <= 1) ? 2 : (longest % 2 === 0 ? longest : longest - 1);

	return blockSize ? multiplier * blockSize : multiplier;
}