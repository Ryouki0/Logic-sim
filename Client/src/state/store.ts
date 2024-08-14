import { configureStore, createImmutableStateInvariantMiddleware, isImmutableDefault, Tuple} from "@reduxjs/toolkit";
import mouseEventsSlice from "./slices/mouseEvents";
import entities from "./slices/entities";
import clock from './slices/clock';
import misc from './slices/misc';
export const store = configureStore({
	reducer: {
		mouseEventsSlice,
		entities,
		clock,
		misc
	},
	middleware: (getDefaultMiddleWare) => {return getDefaultMiddleWare({
		serializableCheck: false,
	});},
});

export type RootState = ReturnType<typeof store.getState>;