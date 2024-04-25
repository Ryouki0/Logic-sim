import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Wire } from "../Interfaces/Wire";
import { Gate } from "../Interfaces/Gate";

interface objects{
    wires?: Wire[] | null,
    gates?: Gate[] | null,
}

const initialState = {wires: null, gates: null} as objects;

const objectsSlice = createSlice({
    name: 'objectsSlice',
    initialState: initialState,
    reducers: {
        setWires: (state, action: PayloadAction<Wire[]>) => {
            state.wires = action.payload;
        }
    }
})

export default objectsSlice.reducer;
export const {setWires} = objectsSlice.actions;