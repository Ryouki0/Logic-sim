import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Gate } from "../Interfaces/Gate";
import { BinaryInput } from "../Interfaces/BinaryInput";
import { BinaryOutput } from "../Interfaces/BinaryOutput";

const initialState: Gate[] = [
	{
	name: 'AND',
	inputs: [{state: 0, id: crypto.randomUUID(), style: {}}, {state: 0, id: crypto.randomUUID(), style: {}}] as BinaryInput[],
	outputs: [{state: 0, id: '16sdf4'}] as BinaryOutput[],
	innerLogic: (inputs: BinaryInput[], outputs: BinaryOutput[]) => {
		if(inputs[0].state && inputs[1].state){
			outputs[0].state = 1;
		}else{
			outputs[0].state = 0;
		}
	},
	id: crypto.randomUUID()
	},
{
	name: 'NO',
	inputs: [{state: 0, id: '1234234234', style: {}}] as BinaryInput[],
	outputs: [{state: 0, id: crypto.randomUUID(), style: {}}] as BinaryOutput[],
	innerLogic: (inputs: BinaryInput[], outputs: BinaryOutput[]) => {inputs[0].state ? outputs[0].state=0 : outputs[0].state = 1},
	id: crypto.randomUUID()
}];

const allGatesSlice = createSlice({
	name: 'allGatesSlice',
	initialState: initialState,
	reducers: {
		addGate: (state, action: PayloadAction<Gate>) => {
			state.push(action.payload);
		}
	}
});

export const {addGate} = allGatesSlice.actions;
export default allGatesSlice.reducer;