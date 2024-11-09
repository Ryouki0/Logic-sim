import { BinaryIO } from "../../Interfaces/BinaryIO";

export default function changeGlobalIOPosition(thisIO:BinaryIO){
	if(isNaN(thisIO.style?.top as any)){
		throw new Error(`thisIO style cannot be interpreted as a number: ${thisIO.style?.top}`);
	}
	const newIO:BinaryIO = {
		...thisIO,
		position: {
			x: thisIO.style!.left as number,
			y: (thisIO.style?.top as number),
		}
	};

	return newIO;
}