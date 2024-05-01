import { createSlice } from "@reduxjs/toolkit";
import { Gate } from "../Interfaces/Gate";
import { BinaryInput } from "../Interfaces/BinaryInput";

const initialState: Gate[] = [{name: 'And', inputs: [{state: 0, id: '1234234234'}] as BinaryInput[], outputs: [{state: 0, id: '16sdf4'}] as BinaryInput[],
innerLogic: () => {}}];

const allGatesSlice = createSlice({
    name: 'allGatesSlice',
    initialState: initialState,
    reducers: {

    }
})