import { PayloadAction, createActionCreatorInvariantMiddleware, createSlice, current } from "@reduxjs/toolkit";
import { Wire } from "../Interfaces/Wire";
import { Gate } from "../Interfaces/Gate";
import { BinaryInput } from "../Interfaces/BinaryInput";
import { calculateInputTop } from "../utils/calculateInputTop";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import removeWireTo from "../utils/removeWiresTo";
import removeWiresFrom from "../utils/removeWiresFrom";
import { write } from "fs";
import disconnectByWire from "../utils/disconnectByWire";
import { DEFAULT_INPUT_DIM } from "../Constants/defaultDimensions";
import { BinaryOutput } from "../Interfaces/BinaryOutput";

interface objects{
    wires: {[key: string]: Wire};
    gates: {[key: string]: Gate};
	globalInputs: {[key: string]: BinaryInput};
	globalOutputs: {[key: string]: BinaryOutput};
}

const initialState = {wires: {}, gates: {}, globalInputs: {}, globalOutputs: {}} as objects;

const objectsSlice = createSlice({
	name: 'objectsSlice',
	initialState: initialState,
	reducers: {
		addWire: (state, action: PayloadAction<Wire>) => {
			state.wires[action.payload.id] = (action.payload);
		},
		changeWirePosition: (state, action: PayloadAction<Wire>) => {
			if(state.wires[action.payload.id]){
				state.wires[action.payload.id].diagonalLine = action.payload.diagonalLine;
				state.wires[action.payload.id].linearLine = action.payload.linearLine;
			}else{
				state.wires[action.payload.id] = {...action.payload};
			}
		},
		breakWirePath: (state, action: PayloadAction<Wire>) => {
			let from:BinaryOutput | BinaryInput |null = null;
			if(action.payload.from){
				if(action.payload.from.gateId){
					from = state.gates[action.payload.from.gateId].outputs[action.payload.from.id];
				}else{
					from = state.globalInputs[action.payload.from.id];
				}
			}
			

			let connectedTo: (BinaryInput | BinaryOutput)[] = [];
		
			from?.to?.forEach(to => {
				
				if(to.gateId){
					connectedTo.push(state.gates[to.gateId].inputs[to.id]);
					//console.log(`${state.gates[to.gateId].inputs[to.id].id.slice(0,5)}`);
				}else{
					connectedTo.push(state.globalOutputs[to.id]);
				}
			})

			//For every connected input check if the wirePaths contain the wire that will be removed, if it is contained, 
			//then break the connection.
			//It won't break the wires if they are not connected to something.
			connectedTo.forEach(to => {
				if(to.wirePath?.includes(action.payload.id)){
					const wireIdx = to.wirePath.indexOf(action.payload.id);
					const lastWireIdxInPath = to.wirePath[to.wirePath.length-1];
					const lastWireInPath = state.wires[lastWireIdxInPath];

					({
						gates:state.gates,
						globalInputs: state.globalInputs,
						globalOutputs: state.globalOutputs,
					} = disconnectByWire(state.gates, lastWireInPath, state.globalInputs, to.id, state.globalOutputs));
					for(let i = wireIdx+1; i<to.wirePath?.length;i++){
						state.wires[to.wirePath[i]].wirePath = state.wires[to.wirePath[i]].wirePath.slice(wireIdx+1);
						if(i === to.wirePath.length-1){
							to.wirePath = state.wires[to.wirePath[i]].wirePath;
						}
					}
				}
			})

			delete state.wires[action.payload.id];
		},
		removeWire: (state, action: PayloadAction<Wire>) => {
			if(!(state.wires[action.payload.id])){
				throw new ReferenceError(`No wire with id: ${action.payload.id}`);
			}
			if(action.payload.connectedToId){
				action.payload.connectedToId.forEach(connectedTo => {
					({
						gates: state.gates, 
						globalInputs: state.globalInputs,
						globalOutputs: state.globalOutputs
					} = disconnectByWire(state.gates, action.payload, state.globalInputs, connectedTo.id, state.globalOutputs));
				})
			}
			delete state.wires[action.payload.id];
		},
		addGate: (state, action: PayloadAction<Gate>) => {
			state.gates[action.payload.id] = action.payload;
		},
		changeGate: (state, action: PayloadAction<{gate: Gate, newPos: {x:number, y:number}}>) => {
			state.gates[action.payload.gate.id].position = {...action.payload.newPos};
		},
		//TODO: Disconnect the inputs and outputs from the wires, then remove gate
		removeGate: (state, action: PayloadAction<string>) => {
			const gate = state.gates[action.payload];
			if(!gate){
				return;
			}
			const inputEntries = Object.entries(gate.inputs);
			const outputEntries = Object.entries(gate.outputs);
			//Disconnect the inputs from the output/globalInput they are connected from
			for(const [key, input] of inputEntries){
				state.wires = removeWireTo(state.wires, key);
				if(input.from?.gateId){
					const toIdx = state.gates[input.from.gateId][input.from.type][input.from.id].to?.findIndex(to => to.id === key);
					if(toIdx !== undefined && toIdx !== -1){
						state.gates[input.from.gateId][input.from.type][input.from.id].to?.splice(toIdx, 1);
					}
				}else if(input.from){
					const toIdx = state.globalInputs[input.from.id]?.to?.findIndex(to => to.id === key);
					if(toIdx !== undefined && toIdx !== -1){
						state.globalInputs[input.from.id].to?.splice(toIdx, 1);
					}
				}
			}
			
			for(const [key, output] of outputEntries){
				state.wires = removeWiresFrom(state.wires, key);
				if(output.to){
					output.to?.forEach(to => {
						if(to.gateId){
							state.gates[to.gateId].inputs[to.id].from = null;
						}
						else{
							state.globalOutputs[to.id].from = null;
						}
					})
				}
			}
			delete state.gates[action.payload];
		},
		addCurrentInput: (state, action: PayloadAction<BinaryInput>) => {
			state.globalInputs[action.payload.id] = action.payload;
		},
		changeInputState: (state, action: PayloadAction<BinaryInput>) => {
			const newState = action.payload.state === 1 ? 0 : 1;
			state.globalInputs[action.payload.id].state = newState;
			if(state.globalInputs[action.payload.id].to){
				state.globalInputs[action.payload.id].to?.forEach(to => {
					if(to.gateId){
						//console.log(`to: ${to.id}`);
						state.gates[to.gateId].inputs[to.id].state = newState;
					}
				})
			}
		},
		changeInputPosition: (state, action: PayloadAction<{x:number,y:number, gateId: string}>) => {
			const { gateId } = action.payload;
    		const gate = state.gates[gateId];

    		if (gate) {
       			Object.keys(gate.inputs).forEach((key, idx, array) => {
					let newY = 0
            	if(gate.position?.y){
					newY = gate.position.y + calculateInputTop(idx, array.length) + DEFAULT_INPUT_DIM.height/2 + (idx*DEFAULT_INPUT_DIM.height);
					
				}
            	const newX = gate.position?.x ?? 0;
            
            	gate.inputs[key].position = { x: newX, y: newY };
        		});
   			}	
		},
		addWireToGateInput: (state, action: PayloadAction<{gate:Gate,inputId:string, wire:Wire}>) => {
			const gate = state.gates[action.payload.gate.id];
			const wireId = action.payload.wire.id;
			const inputId = action.payload.inputId;
			const wireFrom = action.payload.wire.from;
			const wire = state.wires[action.payload.wire.id];
			if(!wireFrom){
				return;
			}
			if(!gate){
				throw new ReferenceError(`Gate with ${action.payload.gate.id} not found`);
			}
			//Give the IDs to the input
			if(gate.inputs[inputId].from && gate.inputs[inputId].from?.id !== wireFrom.id){
				console.warn(`Possible short circuit (wires with different sources connected to the same input)`);
				state.wires[wireId].error = true;
				return;
			}else{
				gate.inputs[action.payload.inputId].from = action.payload.wire.from;
				gate.inputs[action.payload.inputId].wirePath = action.payload.wire.wirePath;
			}
			
			//Change the inputs state to the "from" state when connecting
			if(wireFrom.gateId){
				gate.inputs[inputId].state = state.gates[wireFrom.gateId][wireFrom.type][wireFrom.id].state;
			}else{
				gate.inputs[inputId].state = state.globalInputs[wireFrom.id].state;
			}
			
			//Add "to" to gates output/globalInput
			if(wire.from?.gateId){
				if(state.gates[wire.from.gateId][wire.from.type][wire.from.id].to){
					state.gates[wire.from.gateId][wire.from.type][wire.from.id].to?.push({id: inputId, type: 'inputs', gateId: gate.id});
				}else{
					state.gates[wire.from.gateId][wire.from.type][wire.from.id].to = [{id: inputId, type: 'inputs', gateId: gate.id}];
				}
			}else{
				if(!state.globalInputs[wireFrom.id].to){
					state.globalInputs[wireFrom.id].to = [{id:inputId, type: 'inputs', gateId: gate.id}];
				}else{
					state.globalInputs[wireFrom.id].to?.push({id: inputId, type:'inputs', gateId: gate.id});
				}
			}

			//Add the new ID to the wire
			const wireConnectedTo = state.wires[wireId].connectedToId;
			if(!wireConnectedTo){
				state.wires[wireId].connectedToId = [{id:inputId, type:'inputs', gateId: gate.id}];
			}else{
				state.wires[wireId].connectedToId.push({id:inputId, type:'inputs',gateId: gate.id});
				// for(let i = 0;i<wire.wirePath.length;i++){
				// 	if(state.wires[wire.wirePath[i]].connectedToId.includes({id:inputId,type:'inputs',gateId:gate.id})){
				// 		return;
				// 	}
				// 	state.wires[wire.wirePath[i]].connectedToId = [
				// 		...state.wires[wire.wirePath[i]].connectedToId, 
				// 		{id:inputId,type:'inputs',gateId:gate.id
				// 	}]
				// }
			}
			// for(let i =0;i<wire.wirePath.length;i++){
			// 	console.log(`connectedTo: ${state.wires[wire.wirePath[i]].connectedToId[0].id.slice(0,6)}`);
			// }
		},
		disconnectWireFromGate: (state, action: PayloadAction<{gateId:string, inputId:string, wireId:string}>) => {
			const gate = state.gates[action.payload.gateId];
			const wire = state.wires[action.payload.wireId];

			
			gate.inputs[action.payload.inputId].from = null;
			({
				gates: state.gates,
				globalInputs: state.globalInputs,
				globalOutputs: state.globalOutputs
			} = disconnectByWire(state.gates, wire, state.globalInputs, action.payload.inputId, state.globalOutputs));
			if(wire.connectedToId){
				state.wires = removeWireTo(state.wires, action.payload.inputId);
			}
		},
		disconnectWireFromGlobalOutput: (state, action: PayloadAction<{wireId: string, outputId: string}>) => {
			const wire = state.wires[action.payload.wireId];
			const fromGate = state.gates[wire.from?.gateId??''];
			if(!fromGate){
				return;
			}
			if(!wire){
				return;
			}
			console.log(`called`);
			(
				{
					gates: state.gates,
					globalInputs: state.globalInputs,
					globalOutputs: state.globalOutputs
				} = disconnectByWire(state.gates,wire,state.globalInputs, action.payload.outputId, state.globalOutputs)
			)
			state.wires = removeWireTo(state.wires, action.payload.outputId);

		},
		addGlobalOutput: (state, action: PayloadAction<BinaryOutput>) => {
			state.globalOutputs[action.payload.id] = action.payload;
		},
		connectToGlobalOutput: (state, action: PayloadAction<{wireId: string, outputId: string}>) => {
			const wire = state.wires[action.payload.wireId];
			const outputId = action.payload.outputId;
			const gate = state.gates[wire.from?.gateId??''];
			if(!wire || !gate || !wire.from){
				return;
			}
			
			//Add the output reference to the gate
			if(gate.outputs[wire.from.id].to){
				gate.outputs[wire.from.id].to?.push({type:'outputs', id:outputId, gateId: null});
			}else{
				gate.outputs[wire.from.id].to = [{type:'outputs', id:outputId, gateId: null}];
			}

			state.globalOutputs[outputId].from = wire.from;
			state.globalOutputs[outputId].wirePath = wire.wirePath;
			if(wire.connectedToId){
				wire.connectedToId.push({type: 'outputs', gateId: null, id: outputId});
			}else{
				wire.connectedToId = [{type: 'outputs', gateId: null, id: outputId}];
			}
		}
	}
	
});

export default objectsSlice.reducer;
export const {addWire, 
	changeWirePosition, 
	addGate, 
	addCurrentInput,
	changeGate, 
	removeGate,
	removeWire,
	changeInputState,
	changeInputPosition,
	addWireToGateInput,
	disconnectWireFromGate,
	addGlobalOutput,
	connectToGlobalOutput,
	disconnectWireFromGlobalOutput,
	breakWirePath} = objectsSlice.actions;