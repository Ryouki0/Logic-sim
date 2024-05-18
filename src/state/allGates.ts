import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Gate } from "../Interfaces/Gate";
import { BinaryInput } from "../Interfaces/BinaryInput";
import { BinaryOutput } from "../Interfaces/BinaryOutput";
import {v4 as uuidv4} from 'uuid';

const initialState: Gate[] = [
	{
		name: 'AND',
		inputs: [{state: 0, id: uuidv4(), style: {}}, {state: 0, id: uuidv4(), style: {}}] as BinaryInput[],
		outputs: [{state: 0, id: uuidv4()}] as BinaryOutput[],
		id: uuidv4()},
	{
		name: 'NO',
		inputs: [{state: 0, id: uuidv4(), style: {}}] as BinaryInput[],
		outputs: [{state: 0, id: uuidv4(), style: {}}] as BinaryOutput[],
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