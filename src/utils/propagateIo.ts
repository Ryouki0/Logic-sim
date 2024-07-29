import { current } from "@reduxjs/toolkit";
import { BinaryIO } from "../Interfaces/BinaryIO";

export function propagateIo(ioId: string, binaryIO: {[key: string]: BinaryIO}, currentBinaryIo: {[key: string]: BinaryIO}) {
	const nextIos = [ioId];
	const firstIo = currentBinaryIo[ioId];
	const newState = firstIo.state;
	while(nextIos.length > 0){
		const currentId = nextIos.pop();
		const currentIo = binaryIO[currentId!] ?? currentBinaryIo[currentId!];
		if(!currentIo){
			throw new Error(`There is no IO at ID: ${currentId}`);
		}

		currentIo.state = newState;
		currentIo.to?.forEach(to => {
			nextIos.push(to.id);
		});
	}
}