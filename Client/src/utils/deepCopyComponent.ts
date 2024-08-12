import { BinaryIO } from "../Interfaces/BinaryIO";
import { Gate } from "../Interfaces/Gate";

export function deepCopyComponent(component: {
    gates: {[key: string]: Gate}
    io: {[key: string]: BinaryIO}
}): {gates: {[key: string]: Gate}, io: {[key: string]: BinaryIO}} {
	if(typeof structuredClone === 'function'){
		return structuredClone(component);
	}else{
		return JSON.parse(JSON.stringify(component));
	}
}