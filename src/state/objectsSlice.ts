import { PayloadAction, createActionCreatorInvariantMiddleware, createSlice } from "@reduxjs/toolkit";
import { Wire } from "../Interfaces/Wire";
import { Gate } from "../Interfaces/Gate";
import { BinaryInput } from "../Interfaces/BinaryInput";
import { getAllByTestId } from "@testing-library/react";
import { Input } from "../Components/Input";
import { calculateInputTop } from "../utils/calculateInputTop";
import { write } from "fs";

interface objects{
    wires: Wire[],
    gates: Gate[],
	currentInputs: {[key: string]: BinaryInput};
}

const initialState = {wires: [], gates: [], currentInputs: {}} as objects;

const objectsSlice = createSlice({
	name: 'objectsSlice',
	initialState: initialState,
	reducers: {
		addWire: (state, action: PayloadAction<Wire>) => {
			state.wires.push(action.payload);
		},
		changeWire: (state, action: PayloadAction<Wire>) => {
			const foundIndex = state.wires.findIndex(w => w.id === action.payload.id);
			if(foundIndex !== -1){
				state.wires[foundIndex] = {...state.wires[foundIndex], ...action.payload};
			}else{
				state.wires.push(action.payload);
			}
		},
		removeWire: (state, action: PayloadAction<Wire>) => {
			const foundIndex = state.wires.findIndex(w => w.id === action.payload.id);
			if(foundIndex !== -1){
				state.wires.splice(foundIndex, 1);
			}
		},
		addGate: (state, action: PayloadAction<Gate>) => {
			if(!state.gates){
				state.gates = [action.payload];
			}else{
				state.gates.push(action.payload);
			}
		},
		changeGate: (state, action: PayloadAction<{gate: Gate, newPos: {x:number, y:number}}>) => {
			const foundIndex = state.gates.findIndex(g => g.id === action.payload.gate.id);
			if(foundIndex !== -1){
				state.gates[foundIndex].position = action.payload.newPos;
			}
		},
		removeGate: (state, action: PayloadAction<string>) => {
			const foundIndex = state.gates.findIndex(g => g.id === action.payload);
			if(foundIndex !== -1){
				state.gates.splice(foundIndex, 1);
			}
		},
		addCurrentInput: (state, action: PayloadAction<BinaryInput>) => {
			state.currentInputs[action.payload.id] = action.payload;
		},
		changeInputState: (state, action: PayloadAction<BinaryInput>) => {
			state.currentInputs[action.payload.id] = {...action.payload, state: action.payload.state === 1 ? 0 : 1};
		},
		changeInputPosition: (state, action: PayloadAction<{x:number,y:number, gateId: string}>) => {
			const foundIndex = state.gates.findIndex(g => g.id === action.payload.gateId);
			if(foundIndex !== -1){
				state.gates[foundIndex].inputs.forEach((input, idx, array) => {
					const newY = state.gates[foundIndex].position?.y ??- calculateInputTop(idx, array);
					const newX = state.gates[foundIndex].position?.x ?? 0;
					//console.log(`newX: ${newX} Y: ${newY}`);
					
					state.gates[foundIndex].inputs[idx].position = {x:newX,y:newY};
				})
			}
		},
		addWireToGateInput: (state, action: PayloadAction<{gate:Gate, inputIdx: number, wire:Wire}>) => {
			const foundIndex = state.gates.findIndex(g => g.id === action.payload.gate.id);
			if(foundIndex !== -1){
				//console.log(`changing wires in ${state.gates[foundIndex].inputs[action.payload.inputIdx].id} to ${action.payload.wire}`);
				const inputWires = state.gates[foundIndex].inputs[action.payload.inputIdx].wires
				if(Array.isArray(inputWires)){
					console.log(`pushing into wires`);
					inputWires.push(action.payload.wire);
				}else{
					state.gates[foundIndex].inputs[action.payload.inputIdx].wires = [action.payload.wire];
				}
				//console.log(`changing state in ${state.gates[foundIndex].inputs[action.payload.inputIdx].state} to ${action.payload.wire?.from?.state}`)
				//console.log(`from ID: ${action.payload.wire?.from?.id}`);
				state.gates[foundIndex].inputs[action.payload.inputIdx].from = action.payload.wire.from;
				
				const wireIdx = state.wires.findIndex(w => w.id === action.payload.wire?.id);
				if(wireIdx !== -1){
					const wire = state.wires[wireIdx];
					if(Array.isArray(wire.connectedTo)){
						wire.connectedTo.push(action.payload.gate.inputs[action.payload.inputIdx]);
					}else{
						wire.connectedTo = [action.payload.gate.inputs[action.payload.inputIdx]];
					}
					
				}
			}
		},
		removeWireFromGateInput: (state, action: PayloadAction<{gate:Gate, inputIdx:number,wire: Wire}>) => {
			const gateIdx = state.gates.findIndex(g => g.id === action.payload.gate.id);
			const inputIdx = action.payload.inputIdx;
			const wire = action.payload.wire;
			const wireIdx = state.wires.findIndex(w => w.id === wire.id);
			if(gateIdx !== -1){
				state.gates[gateIdx].inputs[inputIdx].state = 0;
				state.gates[gateIdx].inputs[inputIdx].from = null;
				state.gates[gateIdx].inputs[inputIdx].wires = null;
				if(wireIdx !== -1){
					const wireConnections = state.wires[wireIdx].connectedTo;
					//state.wires[wireIdx].connectedTo = null;
					if(Array.isArray(wire) && wireConnections){
						const idxToRemove = wireConnections.findIndex(connection => connection.id === state.gates[gateIdx].inputs[inputIdx].id);
						state.wires[wireIdx].connectedTo?.splice(idxToRemove, 1);
					}else{
						state.wires[wireIdx].connectedTo = null;
					}
				}
			}
		}
	}
});

export default objectsSlice.reducer;
export const {addWire, 
	changeWire, 
	addGate, 
	addCurrentInput, 
	changeGate, 
	removeGate,
	removeWire,
	changeInputState,
	changeInputPosition,
	addWireToGateInput,
	removeWireFromGateInput} = objectsSlice.actions;