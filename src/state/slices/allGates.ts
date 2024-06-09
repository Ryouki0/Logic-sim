import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Gate } from "../../Interfaces/Gate";
import { BinaryInput } from "../../Interfaces/BinaryInput";
import { BinaryOutput } from "../../Interfaces/BinaryOutput";
import {v4 as uuidv4} from 'uuid';
const ANDInputId1 = uuidv4();
const ANDInputId2 = uuidv4();
const ANDInputId3 = uuidv4();
const ANDOutputId1 = uuidv4();
const NOInputId1 = uuidv4();
const NOOutputId1 = uuidv4();
const NOOutputId2 = uuidv4();
const initialState: Gate[] = [
	{
		name: 'AND',
		inputs: {
			[ANDInputId1]: {state: 0, id: ANDInputId1,style: {}}, ANDInputId2: {state:0,id:ANDInputId2,style:{}}
		},
		outputs: {
			[ANDOutputId1]: {state: 0, id: ANDOutputId1, style:{}},
		},
		id: uuidv4(),
	},
	{
		name: 'NO',
		inputs: {
			[NOInputId1]: {state: 0, id: NOInputId1, style: {}},
		},
		outputs: {
			[NOOutputId1]: {state: 1, id: NOOutputId1, style: {}},
		},
		id: uuidv4()
	}];

const allGatesSlice = createSlice({
	name: 'allGatesSlice',
	initialState: initialState,
	reducers: {
		addCreatedGate: (state, action: PayloadAction<Gate>) => {
			state.push(action.payload);
		}
	}
});

export const {addCreatedGate} = allGatesSlice.actions;
export default allGatesSlice.reducer;