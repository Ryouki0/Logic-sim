import { getImpliedNodeFormatForFile, isObjectBindingPattern } from "typescript";
import { BinaryIO } from "../Interfaces/BinaryIO";
import { Gate } from "../Interfaces/Gate";
import { current } from "@reduxjs/toolkit";
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
 
/**
  * Determines the order of the gates (DAG)
  * @param gates The combined gates state
  * @param io The combined IO state
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
	componentRemainingGateIds: Set<string>
){
	let nextLayer: string[] = [];
	const currentLayer: string[] = [root.id];
	componentRemainingGateIds.delete(root.id);
	const order: string[] = [root.id];
	while(currentLayer.length > 0){
		const currentGateId = currentLayer.pop();
		const currentGate = gates[currentGateId!];
		console.log(`new currentgate: ${currentGate.name}`);
		if(!currentGate){
			throw new Error(`There is no gate with ID: ${currentGateId}`);
		}
		const gateIds: string[] = [];
		const gateConnections = currentGate.outputs.flatMap(outputId => {
			const output = io[outputId];
			const thisOutputGateIds: string[] = []
			output.to?.forEach(to => {
				const toIo = io[to.id];
				const toGate = thisLevel[toIo.gateId!];
				console.log(`currentGate: ${currentGate.name}  to gate: ${toGate?.name} has gateId? ${gateIds.includes(toIo.gateId!)} id: ${toIo.gateId}`);
				if(toGate && !gateIds.includes(toIo.gateId!)){
					console.log(`pushed id: ${toIo.gateId}`);
					gateIds.push(toIo.gateId!);
					thisOutputGateIds.push(toIo.gateId!);
				}
			});
			return thisOutputGateIds;
		});

		//If a connected gate has a connection that is in the 'componentRemainingGateIds' then skip
		gateConnections.forEach(gateId => {
			const connectedGate = gates[gateId];
			if(!connectedGate){
				throw new Error(`There is no gate with ID: ${gateId}`);
			}
			if(!componentRemainingGateIds.has(gateId)){
				return;
			}
			if(connectedGate.name === 'DELAY'){
				return;
			}
			let hasRemainingGateConnection = false;
			connectedGate.inputs.forEach(inputId => {
				const input = io[inputId];
				if(!input){
					throw new Error(`There is no input with ID: ${inputId}`);
				}
				if(componentRemainingGateIds.has(input.from?.gateId!)){
					hasRemainingGateConnection = true;
				}
			});
			if(hasRemainingGateConnection){
				return;
			}
			console.log(`nextlayer pushed: ${connectedGate.name}`);
			nextLayer.push(gateId);
		});

		if(currentLayer.length === 0){
			currentLayer.push(...nextLayer);
			order.push(...nextLayer);
			nextLayer.forEach(nextId => {
				componentRemainingGateIds.delete(nextId);
			});
			nextLayer = [];
		}
	}
	return order;
}


/**
 * Returns the whole path inside a component
 * @param gates The combined gates state
 * @param io The combined IO state
 * @param level The current component's ID, or global
 */
export function getPathInComponent(gates: {[key: string]:Gate}, io: {[key: string]:BinaryIO}, level: string){
	const mainDAG = getMainOrder(gates, io, level);
	const componentPath:string[] = [...mainDAG];

	const thisLevel: {[key: string]: Gate} = {};

	Object.entries(gates).forEach(([key, gate]) => {
		if(gate.parent === level){
			thisLevel[key] = gate;
		}
	});
	if(mainDAG.length !== Object.keys(thisLevel).length){
		mainDAG.forEach(gateId => {
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

			const order = topologicalSort(currentDelayGate!, gates, io, thisLevel, remainingGateIds);
			componentPath.push(...order);
		}	
	}
	return componentPath;
}

export function buildPath(gates: {[key: string]: Gate}, io: {[key: string]: BinaryIO}){
	const completePath = getPathInComponent(gates, io, 'global');
	let i = 0;
	while(i < completePath.length){
		if(gates[completePath[i]].gates){
			let order = getPathInComponent(gates, io, completePath[i]);
			completePath.splice(i, 1, ...order);
			i = 0;
		}else{
			i++;
		}
	}
	return completePath;
}

export function getEvaluationMap(delayIds: string[]){
	const evaluationMap: {[key: string]: (thisGate: Gate, io: {[key: string]: BinaryIO}) => void | string} = {
		'NO': (thisGate: Gate, io: {[key: string]: BinaryIO}) => {
			let isInputTrue = true;
			thisGate.inputs.forEach(inputId => {
				if(io[inputId].state !== 1){
					isInputTrue = false;
				}
			});
			const output = io[thisGate.outputs[0]];
			output.state = isInputTrue ? 0 : 1;
			propagateIoState(output.id, io);
		},
		'AND': (thisGate: Gate, io: {[key: string]: BinaryIO}) => {
			let areBothTrue = true;
			thisGate.inputs.forEach(inputId => {
				if(io[inputId].state !== 1){
					areBothTrue = false;
				}
			});
			const output = io[thisGate.outputs[0]];
			output.state = areBothTrue ? 1 : 0;
			propagateIoState(output.id, io);
		},
		'DELAY': (thisGate: Gate, io: {[key: string]: BinaryIO}) => {
			const output = io[thisGate.outputs[0]];
			output.state = thisGate.nextTick!;
			propagateIoState(output.id, io);
			delayIds.push(thisGate.id);
		}
	}
	return evaluationMap;
}

export function evaluateGates(gates: {[key: string]:Gate}, io: {[key: string]: BinaryIO}, order: string[]){
	const delayIds: string[] = [];
	const evaluationMap = getEvaluationMap(delayIds);
	order.forEach(id => {
		evaluationMap[gates[id].name](gates[id], io);
	});

	delayIds.forEach(id => {
		gates[id].nextTick = io[gates[id].inputs[0]].state;
	})
}