import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Misc{
    currentComponentId: string,
    history: string[],
}

const initialState:Misc = {
    currentComponentId: 'global',
    history: ['global']
}

const misc = createSlice({
    name: 'misc',
    initialState: initialState,
    reducers: {
        setCurrentComponentId: (state, action: PayloadAction<string>)  => {
            state.currentComponentId = action.payload;
            state.history.push(action.payload);
        },
        goBack: (state, action:PayloadAction) => {
            if(state.history.length === 1){
                return;
            }
            console.log(`length before pop ${state.history.length}`);
            state.history.pop();
            console.log(`length after pop ${state.history.length}`);
            const last = state.history[state.history.length - 1];
            console.log(`currentComponent id = ${last}`);
            state.currentComponentId = last!;
        }
    }
})

export default misc.reducer;
export const {
    setCurrentComponentId,
    goBack
} = misc.actions;