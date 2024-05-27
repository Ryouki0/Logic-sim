import { PayloadAction, createActionCreatorInvariantMiddleware, createSlice, current } from "@reduxjs/toolkit";
import { Wire } from "../Interfaces/Wire";
import { Gate } from "../Interfaces/Gate";
import { BinaryInput } from "../Interfaces/BinaryInput";
import { calculateInputTop } from "../utils/calculateInputTop";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import removeWireTo from "../utils/removeWiresTo";
import removeWiresFrom from "../utils/removeWiresFrom";

interface objects{
    wires: {[key: string]: Wire};
    gates: {[key: string]: Gate};
	globalInputs: {[key: string]: BinaryInput};
}

const initialState = {wires: {}, gates: {}, globalInputs: {}} as objects;

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
		removeWire: (state, action: PayloadAction<Wire>) => {
			delete state.wires[action.payload.id];
		},
		setHoverOverWire: (state, action: PayloadAction<Wire>) => {
			const wireEntries = Object.entries(state.wires);
			for(const [key, wire] of wireEntries){
				state.wires[key].hoveringOver = false;
			}
			state.wires[action.payload.id].hoveringOver = true;
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
						//When there will be global outputs, this will need update
						else{

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
            	const newY = gate.position?.y ?? -calculateInputTop(idx, array.length);
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
				throw new ReferenceError(`No "from" to connect with: ${wireFrom}`);
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
				state.wires[wireId].connectedToId = [{id:inputId, type:'inputs'}];
			}else{
				state.wires[wireId].connectedToId?.push({id: action.payload.inputId, type: 'inputs'});
			}
		},
		disconnectWireFromGate: (state, action: PayloadAction<{gateId:string, inputId:string, wireId:string}>) => {
			const gate = state.gates[action.payload.gateId];
			const wire = state.wires[action.payload.wireId];
			//When wires can connect to each other this won't work.
			//TODO: loop through each wire and check if it's connected to this input, then remove it.
			if(wire.connectedToId){
				const index = wire.connectedToId.findIndex(connection => connection.id === action.payload.inputId);
				if(index !== -1){
					wire.connectedToId.splice(index, 1);
				}else{
					return;
				}
			}
			gate.inputs[action.payload.inputId].from = null;
			if(wire.from?.gateId){
				const toId = state.gates[wire.from.gateId][wire.from.type][wire.from.id].to?.findIndex(to => to.id === action.payload.inputId);
				if(toId !== undefined && toId !== -1){
					state.gates[wire.from.gateId][wire.from.type][wire.from.id].to?.splice(toId, 1);
				}
			}else if(wire.from){
				const toIdx = state.globalInputs[wire.from.id].to?.findIndex(to => to.id === action.payload.inputId);
				if(toIdx !== undefined && toIdx !== -1){
					state.globalInputs[wire.from.id].to?.splice(toIdx, 1);
				}
			}
		},
	}
	
});

export default objectsSlice.reducer;
export const {addWire, 
	changeWirePosition, 
	addGate, 
	addCurrentInput,
	setHoverOverWire,
	changeGate, 
	removeGate,
	removeWire,
	changeInputState,
	changeInputPosition,
	addWireToGateInput,
	disconnectWireFromGate} = objectsSlice.actions;