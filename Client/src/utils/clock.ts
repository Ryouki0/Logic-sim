import { getImpliedNodeFormatForFile, isObjectBindingPattern } from "typescript";
import { BinaryIO } from "../Interfaces/BinaryIO";
import { Gate } from "../Interfaces/Gate";
import { current } from "@reduxjs/toolkit";
import { deepCopyComponent } from "./deepCopyComponent";

export class ShortCircuitError extends Error{
	wireTree: string[] | null;
	constructor(wireTree: string[] | null) {
		super("Short circuit");
		this.name = "Short circuit";
		this.wireTree = wireTree;
		Object.setPrototypeOf(this, ShortCircuitError.prototype);
	}
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
				if(fromGate && !gateIds.includes(fromGate.id)){
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
				input.from?.forEach(from => {
					const fromGate = thisLevel[from.gateId!];
					if(fromGate && !mainOrder.includes(fromGate.id)){
						isNextLayer = false;
					}
				});
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
			io[inputId].from?.forEach(from => {
				const fromIo = io[from.id];
				const fromGate = gates[fromIo?.gateId!];
				if(fromGate){
					isRoot = false;
				}
			});
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
	if(io[ioId].highImpedance){
		return;
	}
	const nextIos: string[] = [ioId];
	const newState = io[ioId].state;
	while(nextIos.length > 0){
		const currentIoId = nextIos.pop();
		const currentIo = io[currentIoId!];
		if(!currentIo){
			throw new Error(`No IO with ID: ${currentIoId?.slice(0,5)}`);
		}
         
		currentIo.state = newState;
		currentIo.highImpedance = false;
		currentIo.to?.forEach(to => {
			nextIos.push(to.id);
		});
	}
	return io;
}

export function propagateHighImpedance(ioId: string, io: {[key: string]: BinaryIO}){
	const nextIos: string[] = [ioId];
	while(nextIos.length > 0){
		const currentIoId = nextIos.pop()!;
		const currentIo = io[currentIoId];
		
		if(!currentIo){
			throw new Error(`No IO with ID: ${currentIoId?.slice(0,5)}`);
		}

		let shouldPropagate = true;
		currentIo.from?.forEach(from => {
			if(!io[from.id].highImpedance){
				shouldPropagate = false;
			}
		});
		if(!shouldPropagate) continue;

		currentIo.highImpedance = true;
		currentIo.state = 0;
		currentIo.to?.forEach(to => nextIos.push(to.id));
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
		//console.log(`new currentgate: ${currentGate.name}`);
		if(!currentGate){
			throw new Error(`There is no gate with ID: ${currentGateId}`);
		}
		const gateIds: string[] = [];
		const gateConnections = currentGate.outputs.flatMap(outputId => {
			const output = io[outputId];
			const thisOutputGateIds: string[] = [];
			output.to?.forEach(to => {
				const toIo = io[to.id];
				const toGate = thisLevel[toIo.gateId!];
				//console.log(`currentGate: ${currentGate.name}  to gate: ${toGate?.name} has gateId? ${gateIds.includes(toIo.gateId!)} id: ${toIo.gateId}`);
				if(toGate && !gateIds.includes(toIo.gateId!)){
					//console.log(`pushed id: ${toIo.gateId}`);
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
				const trueSource = input.from?.find(source => !io[source.id].highImpedance);
				if(componentRemainingGateIds.has(trueSource?.gateId!)){
					hasRemainingGateConnection = true;
				}
			});
			if(hasRemainingGateConnection){
				return;
			}
			//console.log(`nextlayer pushed: ${connectedGate.name}`);
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
			const order = getPathInComponent(gates, io, completePath[i]);
			completePath.splice(i, 1, ...order);
			i = 0;
		}else{
			i++;
		}
	}
	return completePath;
}

export function getEvaluationMap(delayIds: string[], switchIds: string[]){
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
		},
		'SWITCH': (thisGate: Gate, io: {[key: string]: BinaryIO}) => {
			const input1 = io[thisGate.inputs[0]];
			const input2 = io[thisGate.inputs[1]];
			const output = io[thisGate.outputs[0]];
			if(input1.state){
				output.highImpedance = false;
				output.state = input2.state;
				propagateIoState(output.id, io);
			}else{
				output.highImpedance = true;
				output.state = 0;
			}
			
			switchIds.push(thisGate.id);
		}
	};
	return evaluationMap;
}

export function evaluateGates(gates: {[key: string]:Gate}, io: {[key: string]: BinaryIO}, order: string[]){
	const delayIds: string[] = [];
	const switchIds: string[] = [];
	const evaluationMap = getEvaluationMap(delayIds, switchIds);
	order.forEach(id => {
		evaluationMap[gates[id].name](gates[id], io);
	});

	delayIds.forEach(id => {
		gates[id].nextTick = io[gates[id].inputs[0]].state;
	});

	//console.log(`length of io: ${Object.entries(io).length}`);

	//propagate the high impedance states
	switchIds.forEach(switchId => {
		//check for short circuit error
		const output = io[gates[switchId].outputs[0]];
		let trueSources = 0;
		output.otherSourceIds?.forEach(srcId => {
			
			if(!io[srcId].highImpedance){
				trueSources++;
			}
		});
		if(trueSources >= 2){
			throw new ShortCircuitError(null);
		};
		if(!output.highImpedance) return;
		propagateHighImpedance(output.id, io);
	});
}