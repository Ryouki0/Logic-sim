import { configureStore} from "@reduxjs/toolkit";
import mouseEventsSlice from "./mouseEventsSlice";
import objectsSlice from "./entities";
import allGatesSlice from "./allGates";
export const store = configureStore({
	reducer: {
		mouseEventsSlice,
		objectsSlice,
		allGatesSlice,
	}
});

export type RootState = ReturnType<typeof store.getState>;