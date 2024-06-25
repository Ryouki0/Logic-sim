import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Wire } from "../../Interfaces/Wire";
import { Gate } from "../../Interfaces/Gate";
import { BinaryInput } from "../../Interfaces/BinaryInput";
import {v4 as uuidv4} from 'uuid';

import { BinaryIO } from "../../Interfaces/BinaryIO";
import { networkInterfaces } from "os";
import { parseIsolatedEntityName } from "typescript";
import { time } from "console";
import { connect } from "http2";


const ANDInputId1 = uuidv4();
const ANDInputId2 = uuidv4();
const DELAYInputId1 = uuidv4();
const ANDOutputId1 = uuidv4();
const NOInputId1 = uuidv4();
const NOOutputId1 = uuidv4();
const DELAYOutputId1 = uuidv4();
const ANDId = uuidv4();
const NOId = uuidv4();
const DELAYId = uuidv4();
interface entities{
    wires: {[key: string]: Wire};
    gates: {[key: string]: Gate};
	createdComponents: {[key: string]:Gate};
	binaryIO: {[key: string]:BinaryIO}
}

const initialState = {wires: {}, gates: {}, globalInputs: {}, globalOutputs: {}, createdComponents: {
	[ANDId]: {
		name: 'AND',
		inputs: [ANDInputId1, ANDInputId2],
		outputs: [ANDOutputId1],
		id: ANDId
	},
	[NOId]: {
		name: 'NO',
		inputs: [NOInputId1],
		outputs: [NOOutputId1],
		id: NOId
	},
	[DELAYId]: {
		name: 'DELAY',
		inputs: [DELAYInputId1],
		outputs: [DELAYOutputId1],
		id: DELAYId,
		nextTick: 0,
	}
}, binaryIO: {
	[ANDInputId1]: {
		id: ANDInputId1,
		gateId: ANDId,
		to: [],
		type: 'input',
		state: 0,
		isGlobalIo: false,
		style: {},
	},
	[ANDInputId2]: {
		id: ANDInputId2,
		gateId: ANDId,
		to: [],
		state: 0,
		isGlobalIo: false,
		type: 'input',
		style: {},
	},
	[ANDOutputId1]: {
		id: ANDOutputId1,
		gateId: ANDId,
		state: 0,
		to: [],
		isGlobalIo: false,
		type: 'output',
		style: {},
	},
	[NOInputId1]: {
		id: NOInputId1,
		gateId: NOId,
		state: 0,
		to: [],
		isGlobalIo: false,
		type: 'input',
		style: {},
	},
	[NOOutputId1]: {
		id: NOOutputId1,
		state: 0,
		gateId: NOId,
		to: [],
		isGlobalIo: false,
		type: 'output',
		style: {},
	},
	[DELAYInputId1]: {
		id: DELAYInputId1,
		state: 0,
		gateId: DELAYId,
		to: [],
		isGlobalIo: false,
		type: 'input',
		style: {},
	},
	[DELAYOutputId1]: {
		id: DELAYOutputId1,
		state: 0,
		gateId: DELAYId,
		to: [],
		isGlobalIo: false,
		type: 'output',
		style: {},
	}
}
} as entities;

const entities = createSlice({
	name: 'entities',
	initialState: initialState,
	reducers: {
		addWire: (state, action: PayloadAction<Wire>) => {
			state.wires[action.payload.id] = action.payload;
		},
		changeWirePosition: (state,action:PayloadAction<Wire>) => {
			if(state.wires[action.payload.id]){
				state.wires[action.payload.id].diagonalLine = action.payload.diagonalLine;
				state.wires[action.payload.id].linearLine = action.payload.linearLine;
			}else{
				state.wires[action.payload.id] = {...action.payload};
			}
		},
		addGate: (state, action: PayloadAction<Gate>) => {
			const gate = {
				...action.payload,
				inputs: [...action.payload.inputs], 
				outputs: [...action.payload.outputs],
				position: action.payload.position ? {...action.payload.position} : undefined,
				gates: action.payload.gates ? action.payload.gates.map(g => g) : undefined};

			const newGateId = uuidv4();
			for(let i =0;i<gate.inputs.length;i++){
				const newInputId = uuidv4();
				const newInput:BinaryIO = {gateId: newGateId, state: 0,style:{},id: newInputId, type: 'input', to: [], isGlobalIo: false};
				state.binaryIO[newInputId] = newInput;
				gate.inputs[i] = newInputId;
			}
			for(let i = 0;i<gate.outputs.length;i++){
				const newOutputId = uuidv4();
				const newOutput:BinaryIO = {gateId: newGateId, state: 0,style:{},id: newOutputId, type: 'output', to: [], isGlobalIo: false};
				state.binaryIO[newOutputId] = newOutput;
				gate.outputs[i] = newOutputId;
			}

			state.gates[newGateId] = {...gate, id: newGateId};
		},
		changeGatePosition: (state, action: PayloadAction<{gate:Gate,position: {x:number,y:number}}>) => {
			state.gates[action.payload.gate.id].position = action.payload.position;
		},
		addInput: (state, action:PayloadAction<BinaryIO>) => {
			const inputs = Object.entries(state.binaryIO);
			for(const [key, input] of inputs){
				if(input.type === 'input' && !input.gateId){
					if(input.position?.y === action.payload.position?.y){
						return;
					}
				}
			}
			state.binaryIO[action.payload.id] = action.payload;

		},
		changeInputState: (state, action:PayloadAction<string>) => {
			console.log(`changing input state at: ${action.payload}`);
			const newState = state.binaryIO[action.payload].state ? 0 : 1;
			state.binaryIO[action.payload].state = newState;
			//Will need to propagate through the components
			state.binaryIO[action.payload].to?.forEach(to => {
				state.binaryIO[to.id].state = newState;
			})
		},
		addGlobalOutput: (state, action: PayloadAction<BinaryIO>) => {
			const ioEntries = Object.entries(state.binaryIO);
			for(const [key, io] of ioEntries){
				if(io.type === 'output' && !io.gateId){
					if(io.position?.y === action.payload.position?.y){
						return;
					}
				}
			}
			state.binaryIO[action.payload.id] = action.payload;
		},
		changeIOPosition: (state, action:PayloadAction<{id: string, position: {x:number, y:number}}>) => {
			state.binaryIO[action.payload.id].position = action.payload.position;
		},
		setConnections: (state, action:PayloadAction<{connections: {wireTree: string[], outputs: string[], sourceId: string|null}[]}>) => {
			const connections = action.payload.connections;
			const ioEntires = Object.entries(state.binaryIO);
			const wireEntries = Object.entries(state.wires);
			
			for(const [key, io] of ioEntires){
				if((io.type === 'output' && !io.isGlobalIo) || (io.type === 'input' && io.isGlobalIo)){
					io.to = [];
				}else if((io.type === 'input' && !io.isGlobalIo) || (io.type === 'output' && io.isGlobalIo)){
					io.from = null;
					io.state = 0;
				}
			}
			for(const [key, wire] of wireEntries){
				state.wires[key].from = null;
			}
			connections.forEach(connection => {
				const source = state.binaryIO[connection.sourceId!];
				if(source){
					source.to = [];
				}

				connection.wireTree.forEach(wireId => {
					state.wires[wireId].from = source ? {id: source.id, gateId: source.gateId, type: source.type} : null;
				})
				connection.outputs.forEach(outputId => {
					const output = state.binaryIO[outputId];
					output.from = source ? {id: source.id, gateId: source.gateId, type: source.type} : null;
					output.state = source?.state ?? 0;
					if(source){
						source.to?.push({id: output.id, gateId: output.gateId, type: output.type});
					}
				})
				
			})
		},
		deleteWire: (state, action:PayloadAction<string>) => {
			delete state.wires[action.payload];
		},
		deleteComponent: (state, aciton: PayloadAction<string>) => {
			const component = state.gates[aciton.payload];
			function deleteBaseGate(gateId: string){
				const gate = state.gates[gateId];
				gate.inputs.forEach(inputId => {
					delete state.binaryIO[inputId];
				})
				gate.outputs.forEach(outputId => {
					delete state.binaryIO[outputId];
				})
				delete state.gates[gateId];
			}
			if(!component.gates){
				deleteBaseGate(component.id);
			}
		},
		updateState: (state, action: PayloadAction<{gates: {[key: string]: Gate}, binaryIO: {[key: string] :BinaryIO}}>) => {
			state.binaryIO = action.payload.binaryIO;
			state.gates = action.payload.gates;
		},
		createBluePrint: (state, action: PayloadAction<{name: string}>) => {
			
		}
	}
});
export default entities.reducer;
export const {addWire, 
	changeWirePosition, 
	addGate,
	changeGatePosition,
	addInput,
	changeInputState,
	addGlobalOutput,
	changeIOPosition,
	setConnections,
	deleteWire,
	deleteComponent,
	updateState} = entities.actions;
// const entities = createSlice({
// 	name: 'entities',
// 	initialState: initialState,
// 	reducers: {
// 		addWire: (state, action: PayloadAction<Wire>) => {
// 			state.wires[action.payload.id] = (action.payload);
// 		},
// 		changeWirePosition: (state, action: PayloadAction<Wire>) => {
// 			if(state.wires[action.payload.id]){
// 				state.wires[action.payload.id].diagonalLine = action.payload.diagonalLine;
// 				state.wires[action.payload.id].linearLine = action.payload.linearLine;
// 			}else{
// 				state.wires[action.payload.id] = {...action.payload};
// 			}
// 		},
// 		breakWirePath: (state, action: PayloadAction<Wire>) => {
// 			let from:BinaryOutput | BinaryInput |null = null;
// 			if(action.payload.from){
// 				if(action.payload.from.gateId){
// 					from = state.gates[action.payload.from.gateId].outputs[action.payload.from.id];
// 				}else{
// 					from = state.globalInputs[action.payload.from.id];
// 				}
// 			}
			

// 			const connectedTo: (BinaryInput | BinaryOutput)[] = [];
		
// 			from?.to?.forEach(to => {
				
// 				if(to.gateId){
// 					connectedTo.push(state.gates[to.gateId].inputs[to.id]);
// 					//console.log(`${state.gates[to.gateId].inputs[to.id].id.slice(0,5)}`);
// 				}else{
// 					connectedTo.push(state.globalOutputs[to.id]);
// 				}
// 			});

// 			//For every connected input check if the wirePaths contain the wire that will be removed, if it is contained, 
// 			//then break the connection.
// 			//It won't break the wires if they are not connected to something.
// 			connectedTo.forEach(to => {
// 				const wirePath = to.wirePath;
// 				if(!wirePath){
// 					return;
// 				}
// 				if(wirePath.includes(action.payload.id)){
// 					const wireIdx = wirePath.indexOf(action.payload.id);
// 					const lastWireIdxInPath = wirePath[wirePath.length-1];
// 					const lastWireInPath = state.wires[lastWireIdxInPath];

// 					({
// 						gates:state.gates,
// 						globalInputs: state.globalInputs,
// 						globalOutputs: state.globalOutputs,
// 					} = disconnectByWire(state.gates, lastWireInPath, state.globalInputs, to.id, state.globalOutputs));
// 					for(let i = wireIdx+1; i<wirePath?.length;i++){
// 						state.wires[wirePath[i]].wirePath = state.wires[wirePath[i]].wirePath.slice(wireIdx+1);
// 						state.wires[wirePath[i]].from = null;
// 						if(i === wirePath.length-1){
// 							to.wirePath = state.wires[to.wirePath?.[i]??'']?.wirePath;
							
// 						}
// 					}
// 					for(let i = 0; i<wireIdx;i++){
// 						if(state.wires[wirePath[i]].wirePathConnectedTo){
// 							//This will not work if there are more gates connected directly to the last wire
// 							const idx = state.wires[wirePath[i]].wirePathConnectedTo?.findIndex(to => to.id === lastWireInPath.connectedToId?.[0].id);
// 							if(idx !== -1 && idx !== undefined){
// 								state.wires[wirePath[i]].wirePathConnectedTo?.splice(idx, 1);
// 							}
// 						}
// 					}
// 				}
// 			});

// 			//For wires that are not connected to anything
// 			Object.entries(state.wires).forEach(([key, wire]) => {
// 				const wireIdx = wire.wirePath.findIndex(wireId => wireId === action.payload.id);
// 				if(wireIdx === -1){
// 					return;
// 				}
// 				wire.wirePath = wire.wirePath.slice(wireIdx+1);
// 				wire.from = null;
// 			});

// 			delete state.wires[action.payload.id];
// 		},
// 		removeWire: (state, action: PayloadAction<Wire>) => {
// 			if(!(state.wires[action.payload.id])){
// 				throw new ReferenceError(`No wire with id: ${action.payload.id}`);
// 			}
// 			if(action.payload.connectedToId){
// 				action.payload.connectedToId.forEach(connectedTo => {
// 					({
// 						gates: state.gates, 
// 						globalInputs: state.globalInputs,
// 						globalOutputs: state.globalOutputs
// 					} = disconnectByWire(state.gates, action.payload, state.globalInputs, connectedTo.id, state.globalOutputs));
// 				});
// 			}
// 			delete state.wires[action.payload.id];
// 		},
// 		addGate: (state, action: PayloadAction<Gate>) => {
// 			state.gates[action.payload.id] = action.payload;
// 			Object.entries(state.gates[action.payload.id].outputs).forEach(([key,output]) => {
// 				console.log(`In state output.from? : ${output.from?.id.slice(0,5)}`);
// 			})
// 		},
// 		changeGate: (state, action: PayloadAction<{gate: Gate, newPos: {x:number, y:number}}>) => {
// 			state.gates[action.payload.gate.id].position = {...action.payload.newPos};
// 		},
// 		//TODO: Disconnect the inputs and outputs from the wires, then remove gate
// 		removeGate: (state, action: PayloadAction<string>) => {
// 			const gate = state.gates[action.payload];
// 			if(!gate){
// 				return;
// 			}
// 			const inputEntries = Object.entries(gate.inputs);
// 			const outputEntries = Object.entries(gate.outputs);
// 			//Disconnect the inputs from the output/globalInput they are connected from
// 			for(const [key, input] of inputEntries){
// 				state.wires = removeWireTo(state.wires, key);
// 				if(input.from?.gateId){
// 					const toIdx = state.gates[input.from.gateId][input.from.type][input.from.id].to?.findIndex(to => to.id === key);
// 					if(toIdx !== undefined && toIdx !== -1){
// 						state.gates[input.from.gateId][input.from.type][input.from.id].to?.splice(toIdx, 1);
// 					}
// 				}else if(input.from){
// 					const toIdx = state.globalInputs[input.from.id]?.to?.findIndex(to => to.id === key);
// 					if(toIdx !== undefined && toIdx !== -1){
// 						state.globalInputs[input.from.id].to?.splice(toIdx, 1);
// 					}
// 				}
// 			}
			
// 			for(const [key, output] of outputEntries){
// 				state.wires = removeWiresFrom(state.wires, key);
// 				if(output.to){
// 					output.to?.forEach(to => {
// 						if(to.gateId){
// 							state.gates[to.gateId].inputs[to.id].from = null;
// 						}
// 						else{
// 							state.globalOutputs[to.id].from = null;
// 						}
// 					});
// 				}
// 			}
// 			delete state.gates[action.payload];
// 		},
// 		addCurrentInput: (state, action: PayloadAction<BinaryInput>) => {
// 			state.globalInputs[action.payload.id] = action.payload;
// 		},
// 		changeInputState: (state, action: PayloadAction<BinaryInput>) => {
// 			const newState = action.payload.state === 1 ? 0 : 1;
// 			state.globalInputs[action.payload.id].state = newState;
// 			if(state.globalInputs[action.payload.id].to){
// 				state.globalInputs[action.payload.id].to?.forEach(to => {
// 					if(to.gateId){
// 						//console.log(`to: ${to.id}`);
// 						state.gates[to.gateId].inputs[to.id].state = newState;
// 					}
// 				});
// 			}
// 		},
// 		changeInputPosition: (state, action: PayloadAction<{x:number,y:number, gateId: string}>) => {
// 			const { gateId } = action.payload;
//     		const gate = state.gates[gateId];

//     		if (gate) {
//        			Object.keys(gate.inputs).forEach((key, idx, array) => {
// 					let newY = 0;
//             	if(gate.position?.y){
// 						newY = gate.position.y + calculateInputTop(idx, array.length) + DEFAULT_INPUT_DIM.height/2 + (idx*DEFAULT_INPUT_DIM.height);
					
// 					}
//             	const newX = gate.position?.x ?? 0;
            
//             	gate.inputs[key].position = { x: newX, y: newY };
//         		});
//    			}	
// 		},
// 		addWireToGateInput: (state, action: PayloadAction<{gate:Gate,inputId:string, wire:Wire}>) => {
// 			const gate = state.gates[action.payload.gate.id];
// 			const wire = state.wires[action.payload.wire.id];
// 			const wireId = action.payload.wire.id;
// 			const inputId = action.payload.inputId;
// 			const wireFrom = wire.from;
// 			if(!wireFrom){
// 				console.warn(`no wirefrom when connecting`);
// 				return;
// 			}
// 			if(!gate){
// 				throw new ReferenceError(`Gate with ${action.payload.gate.id} not found`);
// 			}
// 			//Give the IDs to the input
// 			if(gate.inputs[inputId].from && gate.inputs[inputId].from?.id !== wireFrom.id){
// 				console.warn(`Possible short circuit (wires with different sources connected to the same input)`);
// 				state.wires[wireId].error = true;
// 				return;
// 			}else{
// 				gate.inputs[action.payload.inputId].from = action.payload.wire.from;
// 				gate.inputs[action.payload.inputId].wirePath = action.payload.wire.wirePath;
// 			}
			
// 			//Change the inputs state to the "from" state when connecting
// 			if(wireFrom.gateId){
// 				gate.inputs[inputId].state = state.gates[wireFrom.gateId][wireFrom.type][wireFrom.id].state;
// 				if(gate.gates){

// 				}
// 			}else{
// 				gate.inputs[inputId].state = state.globalInputs[wireFrom.id].state;
// 			}
			
// 			//Add "to" to gates output/globalInput
// 			if(wire.from?.gateId){
// 				if(state.gates[wire.from.gateId][wire.from.type][wire.from.id].to){
// 					state.gates[wire.from.gateId][wire.from.type][wire.from.id].to?.push({id: inputId, type: 'inputs', gateId: gate.id});
// 				}else{
// 					state.gates[wire.from.gateId][wire.from.type][wire.from.id].to = [{id: inputId, type: 'inputs', gateId: gate.id}];
// 				}
// 			}else{
// 				if(!state.globalInputs[wireFrom.id].to){
// 					state.globalInputs[wireFrom.id].to = [{id:inputId, type: 'inputs', gateId: gate.id}];
// 				}else{
// 					state.globalInputs[wireFrom.id].to?.push({id: inputId, type:'inputs', gateId: gate.id});
// 				}
// 			}

// 			//Add the new ID to the wire
// 			const wireConnectedTo = state.wires[wireId].connectedToId;
// 			if(!wireConnectedTo){
// 				state.wires[wireId].connectedToId = [{id:inputId, type:'inputs', gateId: gate.id}];
// 			}else{
// 				state.wires[wireId].connectedToId.push({id:inputId, type:'inputs',gateId: gate.id});
// 				for(let i = 0;i<wire.wirePath.length;i++){
// 					if(state.wires[wire.wirePath[i]].wirePathConnectedTo){
// 						state.wires[wire.wirePath[i]].wirePathConnectedTo?.push({id:inputId, type: 'inputs', gateId: gate.id});
// 					}else {
// 						state.wires[wire.wirePath[i]].wirePathConnectedTo = [{id: inputId, type: 'inputs', gateId: gate.id}];
// 					}
// 				}
// 			}
// 			// for(let i =0;i<wire.wirePath.length;i++){
// 			// 	console.log(`connectedTo: ${state.wires[wire.wirePath[i]].connectedToId[0].id.slice(0,6)}`);
// 			// }
// 		},
// 		disconnectWireFromGate: (state, action: PayloadAction<{gateId:string, inputId:string, wireId:string}>) => {
// 			const gate = state.gates[action.payload.gateId];
// 			const wire = state.wires[action.payload.wireId];

			
// 			gate.inputs[action.payload.inputId].from = null;
// 			({
// 				gates: state.gates,
// 				globalInputs: state.globalInputs,
// 				globalOutputs: state.globalOutputs
// 			} = disconnectByWire(state.gates, wire, state.globalInputs, action.payload.inputId, state.globalOutputs));
// 			if(wire.connectedToId){
// 				state.wires = removeWireTo(state.wires, action.payload.inputId);
// 			}
// 		},
// 		disconnectWireFromGlobalOutput: (state, action: PayloadAction<{wireId: string, outputId: string}>) => {
// 			const wire = state.wires[action.payload.wireId];
// 			const fromGate = state.gates[wire.from?.gateId??''];
// 			if(!fromGate){
// 				return;
// 			}
// 			if(!wire){
// 				return;
// 			}

// 			(
// 				{
// 					gates: state.gates,
// 					globalInputs: state.globalInputs,
// 					globalOutputs: state.globalOutputs
// 				} = disconnectByWire(state.gates,wire,state.globalInputs, action.payload.outputId, state.globalOutputs)
// 			);
// 			state.wires = removeWireTo(state.wires, action.payload.outputId);

// 		},
// 		addGlobalOutput: (state, action: PayloadAction<BinaryOutput>) => {
// 			state.globalOutputs[action.payload.id] = action.payload;
// 		},
// 		connectToGlobalOutput: (state, action: PayloadAction<{wireId: string, outputId: string}>) => {
// 			const wire = state.wires[action.payload.wireId];
// 			const outputId = action.payload.outputId;
// 			const gate = state.gates[wire.from?.gateId??''];
// 			if(!wire || !gate || !wire.from){
// 				return;
// 			}
			
// 			//Add the output reference to the gate
// 			if(gate.outputs[wire.from.id].to){
// 				gate.outputs[wire.from.id].to?.push({type:'outputs', id:outputId, gateId: null});
// 			}else{
// 				gate.outputs[wire.from.id].to = [{type:'outputs', id:outputId, gateId: null}];
// 			}

// 			state.globalOutputs[outputId].from = wire.from;
// 			state.globalOutputs[outputId].wirePath = wire.wirePath;
// 			if(wire.connectedToId){
// 				wire.connectedToId.push({type: 'outputs', gateId: null, id: outputId});
// 			}else{
// 				wire.connectedToId = [{type: 'outputs', gateId: null, id: outputId}];
// 			}
// 		},
// 		connectWireToWire: (state, action: PayloadAction<{wire1:Wire, wire2:Wire}>) => {
// 			const wire1 = state.wires[action.payload.wire1.id];
// 			const wire2 = state.wires[action.payload.wire2.id];
// 			let fromWire:Wire;
// 			let toWire:Wire;
// 			if(wire1.from){
// 				fromWire = wire1;
// 				toWire = wire2;
// 			}else{
// 				fromWire = wire2;
// 				toWire = wire1;
// 			}
// 			if(wire1.from && wire2.from){
// 				wire1.error = true;
// 				wire2.error = true;
// 				return;
// 			}
// 			const from = fromWire.from;
// 			const wireTree:Wire[] = [];
// 			Object.entries(state.wires).forEach(([key, wire]) => {
// 				if(wire.wirePath.includes(toWire.wirePath[0])){
// 					wireTree.push(wire);
// 				}
// 			});

// 			//Start with the "toWire" and check each wire's endpoints in the wiretree to see if they are connected,
// 			//if they are, add them to the "wires" list, and check the wires with respect to that wire.
// 			const traversedWires: Set<string> = new Set();
// 			const wires:Wire[] = [toWire];

// 			const connections: {[key:string]: string} = {};
// 			toWire.from = fromWire.from;
// 			toWire.wirePath = [...fromWire.wirePath, toWire.id];
// 			while (wires.length > 0) {
// 				const currentWire = wires.pop();
// 				if (!currentWire) continue;
			
// 				wireTree.forEach(wire => {
// 					if (traversedWires.has(wire.id)) {
// 						return;
// 					}
			
// 					if (isWireConnectedToWire(wire, currentWire)) {
// 						wires.push(wire);
// 						wire.from = currentWire.from;
// 						if(currentWire.id !== wire.id){
// 							wire.wirePath = [...currentWire.wirePath, wire.id];
// 						}
// 						//console.log(`connecting ${currentWire.id.slice(0, 5)} -> ${wire.id.slice(0, 5)}`);
// 						wire.connectedToId?.forEach((connection, idx) => {
// 							connections[connection.id] = wire.id;
// 						});
// 					}
// 				});
			
// 				traversedWires.add(currentWire.id);
// 			}
// 			toWire.wirePathConnectedTo?.forEach((connection, idx) => {
// 				if(connection.gateId){
// 					state.gates[connection.gateId].inputs[connection.id].from = fromWire.from;
// 					state.gates[connection.gateId].inputs[connection.id].wirePath = state.wires[connections[connection.id]]?.wirePath;
// 				}else{
// 					state.globalOutputs[connection.id].from = fromWire.from;
// 					state.globalOutputs[connection.id].wirePath = state.wires[connections[connection.id]].wirePath;
// 				}
// 				if(from?.gateId){
// 					state.gates[from?.gateId].outputs[from.id].to?.push(connection);
// 				}else if(from){
// 					state.globalInputs[from.id].to?.push(connection);
// 				}
// 			});
			
// 		},
// 		changeGateOutput: (state, action: PayloadAction<{gateId: string, newState: 0 | 1}>) => {
// 			const output = Object.entries(state.gates[action.payload.gateId].outputs);
// 			let outputId = output.map(([key, output])=> {
// 				return key;
// 			})
// 			state.gates[action.payload.gateId].outputs[outputId[0]].state = action.payload.newState;

// 		},
// 		updateState: (state, action: PayloadAction<{
// 			gates:{[key:string]:Gate}, 
// 			inputs:{[key:string]:BinaryInput}, 
// 			outputs: {[key:string]: BinaryOutput}}>) => {
// 				state.gates = action.payload.gates;
// 				state.globalInputs = action.payload.inputs;
// 				state.globalOutputs = action.payload.outputs;
// 		},
// 		createComponent: (state, action: PayloadAction) => {
// 			const newComponent = deepCopyComponent(state.gates, state.globalInputs, state.globalOutputs);
// 			const newId = uuidv4();
// 			let name = 'testName'
// 			Object.entries(state.createdComponents).forEach(([key, component]) => {
// 				if(component.name === 'testName'){
// 					name = 'name';
// 				}
// 			})
// 			const newGate = {
// 				name: name,
// 				id: newId,
// 				inputs: deepCopyInputs(newComponent.newInputs),
// 				outputs: deepCopyOutputs(newComponent.newOutputs),
// 				gates: deepCopyNestedGates(newComponent.newGates),
// 			}
// 			state.createdComponents[newId] = newGate;
// 			state.gates = {};
// 			state.wires = {};
// 			state.globalInputs = {};
// 			state.globalOutputs = {};
// 		}
// 	}
	
// });

// export default entities.reducer;
// export const {addWire, 
// 	changeWirePosition, 
// 	addGate, 
// 	addCurrentInput,
// 	changeGate, 
// 	removeGate,
// 	removeWire,
// 	changeInputState,
// 	changeInputPosition,
// 	addWireToGateInput,
// 	disconnectWireFromGate,
// 	addGlobalOutput,
// 	connectToGlobalOutput,
// 	disconnectWireFromGlobalOutput,
// 	breakWirePath,
// 	connectWireToWire,
// 	changeGateOutput,
// 	updateState,
// 	createComponent} = entities.actions;