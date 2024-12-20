import { BinaryIO } from "../../Interfaces/BinaryIO";
import { Gate } from "@Shared/interfaces";
import { calculateInputTop } from "./calculateInputTop";

/**
 * Calculates the absolute position of a specific I/O in a gate.
 * 
 * @param gate - The gate containing the I/O.
 * @param io - The specific I/O whose absolute position is calculated.
 * @returns An object with the `x` and `y` coordinates representing the absolute position of the I/O.
 * 
 */
export default function calculateAbsoluteIOPos(gate:Gate, io: BinaryIO, blockSize: number, ioRadius: number){
	if(gate.inputs.includes(io.id)){
		const idxOfIo = gate.inputs.findIndex(inputId => inputId === io.id);
		const newPos = {
			x: gate.position!.x,
			y: gate.position!.y + (
				calculateInputTop(idxOfIo, gate.inputs.length, blockSize, ioRadius) + ioRadius/2 + idxOfIo*ioRadius
			)
		};
		return newPos;
	}else if(gate.outputs.includes(io.id)){
		const idxOfIo = gate.outputs.findIndex(outputId => outputId === io.id);
		const newPos = {
			x: gate.position!.x + 3*blockSize,
			y: gate.position!.y + calculateInputTop(
				idxOfIo, gate.outputs.length, blockSize, ioRadius) + (idxOfIo*ioRadius) + ioRadius/2
		};
		return newPos;
	}else{
		throw new Error(`The IO is not in the gate. gate: ${gate.id} io: ${io}`);
	}
}