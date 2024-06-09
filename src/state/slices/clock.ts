import { PayloadAction, createSlice } from "@reduxjs/toolkit";


const initialState = {hertz: 100};

const clockSlice = createSlice({
    name:'clock',
    initialState: initialState,
    reducers: {
        setHertz: (state, action: PayloadAction<number>) => {
            const number = Math.trunc(action.payload);
            state.hertz = number;
        }
    }
})

export default clockSlice.reducer;
export const {setHertz} = clockSlice.actions;