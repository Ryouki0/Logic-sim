import { configureStore} from "@reduxjs/toolkit";
import mouseEventsSlice from "./slices/mouseEventsSlice";
import entities from "./slices/entities";
import allGatesSlice from "./slices/allGates";
import clock from './slices/clock';
export const store = configureStore({
	reducer: {
		mouseEventsSlice,
		entities,
		allGatesSlice,
		clock
	}
});

export type RootState = ReturnType<typeof store.getState>;