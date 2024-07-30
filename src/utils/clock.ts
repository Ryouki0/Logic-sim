import { getImpliedNodeFormatForFile, isObjectBindingPattern } from "typescript";
import { BinaryIO } from "../Interfaces/BinaryIO";
import { Gate } from "../Interfaces/Gate";
import { current } from "@reduxjs/toolkit";
import { deepCopyComponent } from "./deepCopyComponent";

/**
* @param component The component where the logic runs
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
			io = propagateIoState(output.id, io);
		}else if(gate.name === 'NO'){
			let isInputTrue = true;
			gate.inputs.forEach(inputId => {
				if(io[inputId].state !== 1){
					isInputTrue = false;
				}
			});
			const output = io[gate.outputs[0]];
			output.state = isInputTrue ? 0 : 1;
			io = propagateIoState(output.id, io);
		}else if(gate.name === 'DELAY'){
			const output = io[gate.outputs[0]];
			const input = io[gate.inputs[0]];
			output.state = gate.nextTick!;
			gate.nextTick = input.state;
			io = propagateIoState(output.id, io);
		}else if(gate.gates){
			const newState = logic({gates: gates, io: io, level:gate.id});
			gates = newState.gates;
			io = newState.io;
		}
	});

	//SCC:
	const thisLevel: {[key: string]: Gate} = {};

	Object.entries(gates).forEach(([key, gate]) => {
		if(gate.parent === component.level){
			thisLevel[key] = gate;
		}
	});
	if(mainOrder.length !== Object.keys(thisLevel).length){
		mainOrder.forEach(gateId => {
			delete thisLevel[gateId];
		});
		const remainingGateIds = new Set(Object.keys(thisLevel));
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
					currentGate.outputs.forEach(outputId => {
						propagateSCCIoState(outputId, io, gates, remainingGateIds);
					});
				}
			});

		}
	}
	return {gates, io};
}
 
/**
  * Determines the order of the gates (DAG)
  * @param gates The gates in the component
  * @param io The IO in the component
  * @returns Returns a list of gate IDs in execution order
  */
export function getMainOrder(gates: {[key: string]: Gate}, io: {[key: string]: BinaryIO}, level: string){
	const mainOrder: string[] = [];
	const thisLevel: {[key:string]:Gate} = {};
	if(level){
		Object.entries(gates).forEach(([key, gate]) => {
			if(gate.parent === level){
				thisLevel[key] = gate;
			}
		});
	}
	const currentLayer = getPathRoots(thisLevel, io);
	let nextLayer: string[] = [];
	currentLayer.forEach(gateId =>{
		//console.log(`gateId in the roots: ${gateId.slice(0,5)}`);
	});
	Object.entries(thisLevel).forEach(([key, gate]) => {
		//console.log(`gates in thisLevel: ${gate.id.slice(0,5)} -- ${gate.name}`);
	});
	mainOrder.push(...currentLayer);
	while(currentLayer.length > 0){
		const currentGate = gates[currentLayer.pop()!];
		const connectedGateIds = currentGate.outputs.flatMap(outputId => {
			const output = io[outputId];
			const gateIds: string[] = [];
			output.to?.forEach(to => {
				const toIo = io[to.id];
				const fromGate = thisLevel[toIo.gateId!];
				//console.log(`currentGate: ${currentGate.id.slice(0,5)} -- ${currentGate.name}  to gate: ${fromGate?.name}`);
				if(fromGate){
					gateIds.push(toIo.gateId!);
				}
			});
			return gateIds;
		});
        
		//Look back the connected gates' source gates
		connectedGateIds.forEach(gateId => {
			const gate = gates[gateId];
			if(!gate){
				Object.keys(gates).forEach(key => {
					console.log(`ID: ${key.slice(0,5)} -- ${gates[key].name}`);
				});
				throw new Error(`There is no gate with ID: ${gateId.slice(0,5)}...`);
			}
			let isNextLayer = true;
			gate.inputs.forEach(inputId => {
				const input = io[inputId];
				const toGate = thisLevel[input.from?.gateId!];
				if(toGate && !mainOrder.includes(toGate.id)){
					isNextLayer = false;
				}
			});
			if(isNextLayer){
				if(nextLayer.includes(gateId)){
					return;
				}
				nextLayer.push(gateId);
			}
		});
		if(currentLayer.length === 0){
			currentLayer.push(...nextLayer);
			mainOrder.push(...nextLayer);
			nextLayer.forEach(nextId => {
				//console.log(`next layer: ${nextId.slice(0,5)}`);
			});
			nextLayer = [];
		}
	}
	return mainOrder;
}
/**
 * Gives back the first layer of gates (the gates that are not connected from other gates)
 * @param gates The top level gates inside the component 
 * @param io The IOs inside the component
 * @returns A list of gate IDs
 */
export function getPathRoots(gates:{[key: string]: Gate}, io: {[key: string]: BinaryIO}){
	const gateEntries = Object.entries(gates);
	const roots: string[] = [];
	for(const [key, gate] of gateEntries){
		let isRoot = true;
		gate.inputs.forEach(inputId => {
			const from = io[io[inputId].from?.id!];
			const fromGate = gates[from?.gateId!];
			if(fromGate){
				isRoot = false;
			}
		});
		if(isRoot){
			roots.push(key);
		}
	}
	return roots;
}
 
/**
* Propagates an I/O's state
* @param ioId The I/O ID whose state is propagated to every connected I/O 
* @param io The whole I/O state
* @returns The new I/O state
*/
export function propagateIoState(ioId: string, io: {[key: string]: BinaryIO}){
	const nextIos: string[] = [ioId];
	const newState = io[ioId].state;
	while(nextIos.length > 0){
		const currentIoId = nextIos.pop();
		const currentIo = io[currentIoId!];
		if(!currentIo){
			throw new Error(`No IO with ID: ${currentIoId?.slice(0,5)}`);
		}
         
		currentIo.state = newState;
		currentIo.to?.forEach(to => {
			nextIos.push(to.id);
		});
	}
	return io;
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

/**
 * Gives back a list of gate IDs that are connected to the "ioId"
 * @param ioId The ID whose gate connections are given back
 * @param io The IO state
 */
export function getConnectedGates(ioId: string, io: {[key: string]: BinaryIO}){
	const connectedGates: Set<string> = new Set();
	io[ioId]?.to?.forEach(to => {
		if(to.gateId && !io[to.id]?.isGlobalIo){
			connectedGates.add(to.gateId);
		}
	});
	return Array.from(connectedGates);
}

/**
  * Sorts a DAG into a list of gate IDs
  * @param root The root of the DAG
  * @param gates The gates state
  */
export function topologicalSort(
	root: Gate, 
	gates: {[key :string]: Gate}, 
	io: {[key: string]: BinaryIO},
	thisLevel: {[key: string]: Gate},
	remainingGateIds: Set<string>
){
	let nextLayer: string[] = [];
	const currentLayer: string[] = [root.id];
	remainingGateIds.delete(root.id);
	const order: string[] = [root.id];
	while(currentLayer.length > 0){
		const currentGateId = currentLayer.pop();
		const currentGate = gates[currentGateId!];
		if(!currentGate){
			throw new Error(`There is no gate with ID: ${currentGateId}`);
		}

		const gateConnections = currentGate.outputs.flatMap(outputId => {
			const output = io[outputId];
			const gateIds: string[] = [];
			output.to?.forEach(to => {
				const toIo = io[to.id];
				const toGate = thisLevel[toIo.gateId!];
				//console.log(`currentGate: ${currentGate.id.slice(0,5)} -- ${currentGate.name}  to gate: ${toGate?.name}`);
				if(toGate){
					gateIds.push(toIo.gateId!);
				}
			});
			return gateIds;
		});

		//If a connected gate has a connection that is in the 'remainingGateIds' then skip
		gateConnections.forEach(gateId => {
			const connectedGate = gates[gateId];
			if(!connectedGate){
				throw new Error(`There is no gate with ID: ${gateId}`);
			}
			if(!remainingGateIds.has(gateId)){
				return;
			}
			if(connectedGate.name === 'DELAY'){
				return;
			}
			connectedGate.inputs.forEach(inputId => {
				const input = io[inputId];
				if(!input){
					throw new Error(`There is no input with ID: ${inputId}`);
				}
				if(remainingGateIds.has(input.from?.gateId!)){
					return;
				}
			});
			nextLayer.push(gateId);
		});

		if(currentLayer.length === 0){
			currentLayer.push(...nextLayer);
			order.push(...nextLayer);
			nextLayer.forEach(nextId => {
				remainingGateIds.delete(nextId);
			});
			nextLayer = [];
		}
	}
	return order;
}