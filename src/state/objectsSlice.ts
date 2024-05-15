import { PayloadAction, createActionCreatorInvariantMiddleware, createSlice } from "@reduxjs/toolkit";
import { Wire } from "../Interfaces/Wire";
import { Gate } from "../Interfaces/Gate";
import { BinaryInput } from "../Interfaces/BinaryInput";
import { getAllByTestId } from "@testing-library/react";

interface objects{
    wires: Wire[],
    gates: Gate[],
	currentInputs: BinaryInput[];
}

const initialState = {wires: [], gates: [], currentInputs: []} as objects;

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
				state.wires[foundIndex] = action.payload;
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
			state.currentInputs.push(action.payload);
		},
		changeInputState: (state, action: PayloadAction<BinaryInput>) => {
			const foundIndex = state.currentInputs.findIndex(i => i.id === action.payload.id);
			if(foundIndex !== -1){
				state.currentInputs[foundIndex].state = state.currentInputs[foundIndex].state === 0 ? 1 : 0;
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
	changeInputState} = objectsSlice.actions;