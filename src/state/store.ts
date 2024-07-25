import { configureStore, Tuple} from "@reduxjs/toolkit";
import mouseEventsSlice from "./slices/mouseEvents";
import entities from "./slices/entities";
import clock from './slices/clock';
export const store = configureStore({
	reducer: {
		mouseEventsSlice,
		entities,
		clock
	},
	middleware: (getDefaultMiddleWare) => {return getDefaultMiddleWare({
		serializableCheck: false,
	})},
});

export type RootState = ReturnType<typeof store.getState>;