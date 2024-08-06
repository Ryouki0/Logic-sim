import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Misc{
    currentComponentId: string
}

const initialState:Misc = {
    currentComponentId: 'global',
}

const misc = createSlice({
    name: 'misc',
    initialState: initialState,
    reducers: {
        setCurrentComponentId: (state, action: PayloadAction<string>)  => {
            state.currentComponentId = action.payload;
        } 
    }
})

export default misc.reducer;
export const {
    setCurrentComponentId
} = misc.actions;