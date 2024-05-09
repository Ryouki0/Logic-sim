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
		addCurrentInput: (state, action: PayloadAction<BinaryInput>) => {
			state.currentInputs.push(action.payload);
		}
	}
});

export default objectsSlice.reducer;
export const {addWire, changeWire, addGate, addCurrentInput, changeGate} = objectsSlice.actions;