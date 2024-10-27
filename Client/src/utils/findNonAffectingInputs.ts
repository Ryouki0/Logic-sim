import { Gate } from "@Shared/interfaces";
import { BinaryIO } from "../Interfaces/BinaryIO";

export default function findNonAffectingInputs(gates: {[key: string]: Gate}, io: {[key: string]: BinaryIO}, endIo: string, baseGateIds: string[]){

	const traversedOutputIds: Set<string> = new Set();
	const nextIos: string[] = [endIo];
	const parent = io[endIo].parent;
	const nonAffectingInputs: Set<string> = new Set();
	while(nextIos.length > 0){
		const currentId = nextIos.pop()!;
		const currentIo = io[currentId];
		if(!currentIo) throw new Error(`No io at ID: ${currentId}`);
        
		traversedOutputIds.add(currentId);

		if(currentIo.gateId && currentIo.gateId === parent){
			nonAffectingInputs.add(currentId);
			continue;
		}

		if(currentIo.from && currentIo.from.length > 0){
			currentIo.from.forEach(from => {
				if(traversedOutputIds.has(from.id)) return;

				nextIos.push(from.id);
			});

			continue;
		}

		if(currentIo.gateId && baseGateIds.includes(currentIo.gateId)){
			const gate = gates[currentIo.gateId!];
			const inputs = gate.inputs.map(inputId => {
				if(traversedOutputIds.has(inputId)) return;
				return inputId;
			}).filter(id => id !== undefined);
			inputs.forEach(inputId => nextIos.push(inputId!));
		}

		if(parent === 'global' && !currentIo.gateId){
			console.log(`ayaya`);
			nonAffectingInputs.add(currentId);
		}
	}
    
	//Check if a non affecting input has a connection that is not part of the SCC, meaning it affects the output
	const trueNonAffectingInputs: Set<string> = new Set();
	Array.from(nonAffectingInputs).forEach(id => {
		let hasNonSCCConnection = false;
		io[id].to?.forEach(to => {
			if(!traversedOutputIds.has(to.id)){
				hasNonSCCConnection = true;
			}
		});

		if(hasNonSCCConnection){
			return;
		}
		trueNonAffectingInputs.add(id);
	});  
	return trueNonAffectingInputs;
}