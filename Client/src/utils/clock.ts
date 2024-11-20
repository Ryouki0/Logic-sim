import { getImpliedNodeFormatForFile, isObjectBindingPattern } from "typescript";
import { BinaryIO } from "../Interfaces/BinaryIO";
import { Gate } from "../Interfaces/Gate";
import { current } from "@reduxjs/toolkit";
import { deepCopyComponent } from "./deepCopyComponent";
import isBaseGate from "./isBaseGate";

export class ShortCircuitError extends Error{
	wireTree: string[] | null;
	constructor(wireTree: string[] | null) {
		super("Short circuit");
		this.name = "Short circuit";
		this.wireTree = wireTree;
		Object.setPrototypeOf(this, ShortCircuitError.prototype);
	}
}

export class CircularDependencyError extends Error{
	constructor(){
		super('Circular dependency');
		Object.setPrototypeOf(this, CircularDependencyError.prototype);
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
 * Gets the full order, where the whole circuit is taken as a single graph
 * @param gates The combined gates state
 * @param io The combined IO state
 * @returns {object} An object containing:
 * - `mainDag`: The topologically sorted DAG
 * - `SCCOrder`: All the SCCs combined
 */
export function globalSort(gates: {[key: string]: Gate}, io: {[key: string]: BinaryIO}){
	const baseGateIds = getAllBaseGates(gates);
	const mainDag = getGlobalDag(gates, io, baseGateIds);
	const mainDagSet = new Set(mainDag);
	console.log(`maindag has 4418... ${mainDagSet.has('441886fd-61ec-4f29-b159-385732cd3697')}`);
	console.log(`baseGates has 4418... ${baseGateIds.includes('441886fd-61ec-4f29-b159-385732cd3697')}`)
	const allRemainingGateIds = baseGateIds.filter(baseId => !mainDagSet.has(baseId));

	const SCCOrder: string[] = [];
	while(allRemainingGateIds.length > 0){
		let delayGate: null | Gate = null;
		allRemainingGateIds.forEach(id => {
			if(gates[id].name === 'DELAY'){
				delayGate = gates[id];
			}
		});

		if(!delayGate) throw new CircularDependencyError();

		const SCC = globalTopologicalSort(delayGate, gates, io, baseGateIds, allRemainingGateIds);

		SCC.forEach(id => {
			SCCOrder.push(id);
			if(id === '441886fd-61ec-4f29-b159-385732cd3697'){
				console.log(`evaluating 4418 in SCC... for delay: ${delayGate!.id.slice(0,5)}`);
			}
			const thisIdx = allRemainingGateIds.findIndex(remainingId => remainingId === id);
			if(thisIdx === -1) {
				allRemainingGateIds.forEach(id => {
					console.log(`name: ${gates[id]?.name} parent: ${gates[gates[id]?.parent]?.name} id: ${id}`)
				})
				throw new Error(
				`${id} doesn't exist in the remaining IDs ${gates[id]?.name} parent: ${gates[gates[id]?.parent]?.name}`
			);
		}

			allRemainingGateIds.splice(thisIdx, 1);
		});
	}
	return {mainDag: mainDag, SCCOrder: SCCOrder};
}

export function getGlobalDag(gates: {[key: string]: Gate}, io: {[key: string]: BinaryIO}, baseGateIds: string[]){
	const globalRoots = getGlobalPathRoot(gates, io, baseGateIds);
	let currentLayer: string[] = globalRoots;
	const mainDag: string[] = [...currentLayer];
	let nextLayer: string[] = [];
	while(currentLayer.length > 0){
		const currentId = currentLayer.pop()!;
		const currentGate = gates[currentId];
		if(!currentGate) throw new Error(`No gate at ID: ${currentId}`);

		const connectedGates = getConnectedGates(currentGate, io, baseGateIds);
		connectedGates!.forEach(connectedGateId => {
			const currentConnectedGate = gates[connectedGateId];
			if(!currentConnectedGate) throw new Error(`No gate at ID: ${connectedGateId}`);

			const backGateIds = getBackConnections(currentConnectedGate, io, baseGateIds);
			let isNextLayer = true;
			backGateIds.forEach(backGateId => {
				if(!mainDag.includes(backGateId)){
					isNextLayer = false;
				}
			});

			if(isNextLayer){
				if(nextLayer.includes(connectedGateId)){
					return;
				}else{
					nextLayer.push(connectedGateId);
				}
			}
		});

		if(currentLayer.length === 0){
			mainDag.push(...nextLayer);
			currentLayer = [...nextLayer];
			nextLayer = [];
		}
	}
	return mainDag;
}

/**
 * Non-layered topological sort for the broken down graph
 * @param root The root delay gate
 * @param gates The whole gates state
 * @param io The whole IO state
 * @param baseGateIds All the base gate IDs
 * @param allRemainingGateIds All remaining base gate IDs
 */
export function globalTopologicalSort(
	root: Gate, 
	gates: {[key: string]: Gate}, 
	io: {[key: string]: BinaryIO}, 
	baseGateIds: string[],
	allRemainingGateIds: string[]
){
	const order: string[] = [root.id];
	let nextLayer: string[] = [];
	const currentLayer: string[] = [root.id];
	while(currentLayer.length > 0){
		const currentId = currentLayer.pop()!;
		const currentGate = gates[currentId];
		if(!currentGate) throw new Error(`No gate at ID: ${currentId}`);

		const connectedGateIds = getConnectedGates(currentGate, io, baseGateIds);
		connectedGateIds!.forEach(connectedGateId => {
			
			let isNextLayer = true;
			const connectedGate = gates[connectedGateId];
			if(!connectedGate) throw new Error(`No gate at ID: ${connectedGateId}`);

			const backGateIds = getBackConnections(connectedGate, io, baseGateIds);
			backGateIds.forEach(gateId => {
				// if(connectedGateId === '441886fd-61ec-4f29-b159-385732cd3697'){
				// 	console.log(`backGate: ${gateId} allRemaining: ${allRemainingGateIds.includes(gateId)} order: ${order.includes(gateId)}`)
				// }
				if(allRemainingGateIds.includes(gateId) && !order.includes(gateId)){
					isNextLayer = false;
				}else if(connectedGate.name === 'DELAY'){
					isNextLayer = false;
				}
			});

			if(isNextLayer){
				if(nextLayer.includes(connectedGateId)){
					return;
				}
				nextLayer.push(connectedGateId);
			}
		});

		if(currentLayer.length === 0){
			currentLayer.push(...nextLayer);
			order.push(...nextLayer);
			nextLayer = [];
		}
	}
	return order;
}

export function getGlobalPathRoot(gates: {[key: string]: Gate}, io: {[key: string]: BinaryIO}, baseGateIds: string[]){
	const rootIds: string[] = [];

	baseGateIds.forEach(baseId => {
		const currentGate = gates[baseId];
		if(!currentGate){
			throw new Error(`No gate at ID: ${baseId}`);
		}

		if(getBackConnections(currentGate, io, baseGateIds).length === 0){
			rootIds.push(baseId);
		}
	});
	
	return rootIds;
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
	const highImpedance = io[ioId].highImpedance;
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

		currentIo.highImpedance = highImpedance;
		currentIo.state = 0;
		currentIo.to?.forEach(to => nextIos.push(to.id));
	}
}

/**
 * Returns a list of base gate IDs that are connected to the `startGate`
 * @param startGate The starting base gate
 * @param io The whole IO state
 * @param baseGateIds All the base gate IDs
 * @returns A list of the connected base gate IDs
 */
export function getConnectedGates(startGate:Gate, io: {[key: string]: BinaryIO}, baseGateIds: string[]){
	const connectedGates = new Set<string>();
	const nextIos: string[] = startGate.outputs.flatMap(outputId => {
		return io[outputId].to!.map(to => {
			return to.id;	
		});
	});
	while(nextIos.length > 0){
		const currentId = nextIos.pop()!;
		const currentIo = io[currentId];
		if(!currentIo){
			throw new Error(`No IO at id: ${currentId}`);
		}

		if(baseGateIds.includes(currentIo.gateId!)){
			connectedGates.add(currentIo.gateId!);
		}else{
			if(currentIo.to){
				nextIos.push(...currentIo.to!.map(to => to.id));
			}
		}
	}
	return Array.from(connectedGates);
}

/**
 * Returns the list of base gate IDs that are connected to the `endGate`
 * @param endGate The base gate whose source gate connections are given back
 * @param io The entire IO state
 * @param baseGateIds The base gate IDs
 * @returns A list of base gate IDs
 */
export function getBackConnections(endGate: Gate, io: {[key: string]: BinaryIO}, baseGateIds: string[]){
	const nextIos = endGate.inputs.flatMap(inputId => {
		return io[inputId].from?.map(from => from.id);
	}).filter(ioId => ioId !== undefined);
	const backGateIds: Set<string> = new Set<string>();
	while(nextIos.length > 0){
		const currentId = nextIos.pop()!;
		const currentIo = io[currentId];
		if(!currentIo){
			throw new Error(`No IO at ID: ${currentId}`);
		}

		if(baseGateIds.includes(currentIo.gateId!)){
			backGateIds.add(currentIo.gateId!);
		}else{
			if(currentIo.from){
				nextIos.push(...currentIo.from.map(from => from.id));
			}
		}
	}
	
	return Array.from(backGateIds);
}

/**
  * Sorts a DAG into a list of gate IDs
  * @param root The root delay gate of the DAG
  * @param gates The whole gates state
  * @param io The whole io state
  * @param thisLevel The level of the delay gate
  * @param componentRemainingGateIds The ramaining gate IDs in the component
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
 * Gives back the basic gates
 * @param gates The whole gates state
 */
export function getAllBaseGates(gates:{[key:string]:Gate}){
	const nextGates: string[] = [];
	const baseGates: string[] = [];
	Object.entries(gates).forEach(([key, gate]) => {
		if(gate.parent === 'global'){
			nextGates.push(key);
		}
	});
	
	while(nextGates.length > 0){
		const nextGate = gates[nextGates.pop()!];
		if(!isBaseGate(nextGate)){
			nextGates.push(...nextGate.gates!);
		}else{
			baseGates.push(nextGate.id);
		}
	}
	return baseGates;
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
				throw new CircularDependencyError();
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
	getAllBaseGates(gates);
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
				let shouldPropagate = true;
				output.otherSourceIds?.forEach(srcId => {
					if(srcId !== output.id && !switchIds.includes(io[srcId].gateId!)){
						shouldPropagate = false;
					}
				});
				if(shouldPropagate){
					propagateHighImpedance(output.id, io);
				}
			}
			
			switchIds.push(thisGate.id);
		}
	};
	return evaluationMap;
}

export interface minimalIoData{
	id: string,
	state: 0 | 1,
	highImpedance: true | false
}

export function evaluateGates(gates: {[key: string]:Gate}, io: {[key: string]: BinaryIO}, order: string[]){
	const delayIds: string[] = [];
	const switchIds: string[] = [];
	const evaluationMap = getEvaluationMap(delayIds, switchIds);
	order.forEach((id,idx) => {
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