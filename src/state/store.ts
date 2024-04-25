import { configureStore} from "@reduxjs/toolkit";
import mouseEventsSlice from "./mouseEventsSlice";
import objectsSlice from "./objectsSlice";
export const store = configureStore({
    reducer: {
        mouseEventsSlice,
        objectsSlice,
    }
})

export type RootState = ReturnType<typeof store.getState>;