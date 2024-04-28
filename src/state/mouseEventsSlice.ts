import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface MouseEvents{
    objectClicked: objectClicked
}
export type objectClicked = "Gate" | "Input" | "Wire" | null;
const initialState = {objectClicked: null} satisfies MouseEvents as MouseEvents;

const mouseEventsSlice = createSlice({
    name: "mouseEventsSlice",
    initialState: initialState,
    reducers: {
        setObjectClicked: (state, action: PayloadAction<objectClicked>) => {
            state.objectClicked = action.payload;
        }
    },
})

export const {setObjectClicked} = mouseEventsSlice.actions;
export default mouseEventsSlice.reducer;