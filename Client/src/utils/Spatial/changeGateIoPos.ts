import { Gate } from "@Shared/interfaces";
import { BinaryIO } from "../../Interfaces/BinaryIO";
import { current } from "@reduxjs/toolkit";
import calculateAbsoluteIOPos from "./calculateAbsoluteIOPos";

/**
 * 
 * @param gate 
 * @param position 
 * @param blockSize 
 * @param currentIo 
 * @returns 
 */
export default function changeGateIoPos(gate: Gate, position: {x: number, y: number}, blockSize: number, currentIo: {[key: string]: BinaryIO}, ioRadius: number){
	gate.position = position;
	const newIoPositions: {[key: string]: {x: number, y: number}} = {};
	gate.inputs.forEach((inputId, idx, array) => {
		newIoPositions[inputId] = calculateAbsoluteIOPos(gate, currentIo[inputId], blockSize, ioRadius);
	});

	gate.outputs.forEach((outputId, idx, array) => {
		newIoPositions[outputId] = calculateAbsoluteIOPos(gate, currentIo[outputId], blockSize, ioRadius);
	});

	return {gatePos: position, newIoPositions: newIoPositions};
}