//@ts-nocheck
import { Gate } from "@Shared/interfaces";
import { getMainOrder, propagateSCCIoState, topologicalSort } from "./clock";
import { BinaryIO } from "../Interfaces/BinaryIO";
import { deepCopyComponent } from "./deepCopyComponent";

/**
 * Runs the simulator for 1 tick.
 * @param component.gates The combined `gates` state
 * @param component.io The combined `BinaryIO` state
 * @param component.level The ID of the current component
 * @param component.serialize A boolean flag indicating whether the data should be serialized
 * @returns The new state
 */
export function logic(component: {
    gates: {[key: string]: Gate},
    io: {[key: string]: BinaryIO},
    level: string,
    serialize?: boolean
 })
{
	let { gates, io } = component.serialize
  		? deepCopyComponent({ gates: component.gates, io: component.io })
  		: { gates: component.gates, io: component.io };

	const mainOrder = getMainOrder(gates, io, component.level);
	const thisLevel: {[key: string]: Gate} = {};

	Object.entries(gates).forEach(([key, gate]) => {
		if(gate.parent === component.level){
			thisLevel[key] = gate;
		}
	});
	const remainingGateIds = new Set(Object.keys(thisLevel));

	mainOrder.forEach(gateId => {
		const gate = gates[gateId];
		//console.log(`Running: ${gateId.slice(0,5)} -- ${gate.name} in level: ${component.level}`);
		if(gate.name === 'AND'){
			let areBothTrue = true;
			gate.inputs.forEach(inputId => {
				if(io[inputId].state !== 1){
					areBothTrue = false;
				}
			});
			const output = io[gate.outputs[0]];
			output.state = areBothTrue ? 1 : 0; 
			propagateSCCIoState(output.id, io, gates, remainingGateIds);
		}else if(gate.name === 'NO'){
			let isInputTrue = true;
			gate.inputs.forEach(inputId => {
				if(io[inputId].state !== 1){
					isInputTrue = false;
				}
			});
			const output = io[gate.outputs[0]];
			output.state = isInputTrue ? 0 : 1;
			propagateSCCIoState(output.id, io, gates, remainingGateIds);
		}else if(gate.name === 'DELAY'){
			const output = io[gate.outputs[0]];
			const input = io[gate.inputs[0]];
			output.state = gate.nextTick!;
			gate.nextTick = input.state;
			propagateSCCIoState(output.id, io, gates, remainingGateIds);
		}else if(gate.gates){
			const newState = logic({gates: gates, io: io, level:gate.id});
			gates = newState.gates;
			io = newState.io;
		}
	});

	//SCC:
	
	if(mainOrder.length !== Object.keys(thisLevel).length){
		mainOrder.forEach(gateId => {
			delete thisLevel[gateId];
		});
		
		while(remainingGateIds.size > 0){
			let currentDelayGate: Gate | null = null;
			for(const id of remainingGateIds){
				if(gates[id].name === 'DELAY'){
					currentDelayGate = gates[id];
					break;
				}
			}
			if(!currentDelayGate){
				console.warn(`Actual circular dependency!`);
				break;
			}

			const delayInput = io[currentDelayGate?.inputs[0]!];
			const delayOutput = io[currentDelayGate?.outputs[0]!];
			if(!delayInput){
				throw new Error(`There is no input at: ${currentDelayGate?.inputs[0]}`);
			}

			const order = topologicalSort(currentDelayGate!, gates, io, thisLevel, remainingGateIds);
			//console.log(`order for currentDelayGate: ${currentDelayGate!.id.slice(0,5)}`);
			order.forEach(id => {
				//console.log(`${id.slice(0,5)} -- ${gates[id].name}`);
				const currentGate = gates[id];
				if(!currentGate){
					throw new Error(`There is no gate with ID: ${id}`);
				}

				if(currentGate.name === 'AND'){
					let areBothTrue = true;
					currentGate.inputs.forEach(inputId => {
						if(io[inputId].state !== 1){
							areBothTrue = false;
						}
					});
					const output = io[currentGate.outputs[0]];
					output.state = areBothTrue ? 1 : 0; 
					propagateSCCIoState(output.id, io, gates, remainingGateIds);
				}else if(currentGate.name === 'NO'){
					let isInputTrue = true;
					currentGate.inputs.forEach(inputId => {
						if(io[inputId].state !== 1){
							isInputTrue = false;
						}
					});
					const output = io[currentGate.outputs[0]];
					output.state = isInputTrue ? 0 : 1;
					propagateSCCIoState(output.id, io, gates, remainingGateIds);
				}else if(currentGate.name === 'DELAY'){
					const output = io[currentGate.outputs[0]];
					const input = io[currentGate.inputs[0]];
					const fromGate = thisLevel[input.from?.gateId!];
					if(!remainingGateIds.has(fromGate.id)){
						output.state = currentGate.nextTick!;
						currentGate.nextTick = input.state;
					}else{
						output.state = currentGate.nextTick!;
					}
					propagateSCCIoState(output.id, io, gates, remainingGateIds);
				}else if(currentGate.gates){
					const newState = logic({gates: gates, io: io, level:currentGate.id});
					gates = newState.gates;
					io = newState.io;
					// currentGate.outputs.forEach(outputId => {
					// 	propagateSCCIoState(outputId, io, gates, remainingGateIds);
					// });
				}
			});

		}
	}
	return {gates, io};
}

export function propagateSCCIoState(
	ioId: string, 
	io: {[key: string]: BinaryIO}, 
	gates: {[key: string]: Gate}, 
	remainingGateIds: Set<string>
){
	const newState = io[ioId].state;
	const nextIos = [ioId];
	while(nextIos.length > 0){
		const currentId = nextIos.pop()!;
		const currentIo = io[currentId];
		if(!currentIo){
			throw new Error(`There is no input/output at ${currentId}`);
		}

		currentIo.state = newState;
		currentIo.to?.forEach(to => {
			const toGate = gates[to.gateId!];
			if(toGate && toGate.name === 'DELAY' && !remainingGateIds.has(toGate.id)){
				//console.log(`changed nextTick to: ${newState}`);
				toGate.nextTick = newState;
			}

			nextIos.push(to.id);
		});
	}
}