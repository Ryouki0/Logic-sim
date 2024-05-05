import { PayloadAction, createActionCreatorInvariantMiddleware, createSlice } from "@reduxjs/toolkit";
import { Wire } from "../Interfaces/Wire";
import { Gate } from "../Interfaces/Gate";

interface objects{
    wires: Wire[],
    gates?: Gate[] | null,
}

const initialState = {wires: [], gates: null} as objects;

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
		}
	}
});

export default objectsSlice.reducer;
export const {addWire, changeWire} = objectsSlice.actions;