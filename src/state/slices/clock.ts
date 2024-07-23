import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { isRegularExpressionLiteral } from "typescript";


const initialState = {
	hertz: 100, 
	refreshRate: 30,
	isRunning: false,
	actualHertz: 0,
	actualRefreshRate: 0,
};

const clockSlice = createSlice({
	name:'clock',
	initialState: initialState,
	reducers: {
		setHertz: (state, action: PayloadAction<number>) => {
			const number = Math.trunc(action.payload);
			state.hertz = number;
		},
		setRefreshRate: (state, action: PayloadAction<number>) => {
			const number = Math.trunc(action.payload);
			state.refreshRate = number;
		},
		setIsRunning: (state, action: PayloadAction<boolean>) => {
			state.isRunning = action.payload;
		},
		setActualHertz: (state, action: PayloadAction<number>) => {
			state.actualHertz = action.payload;
		},
		setActualRefreshRate: (state, action: PayloadAction<number>) => {
			state.actualRefreshRate = action.payload;
		},
		setActuals: (state, action: PayloadAction<{actualHertz: number, actualRefreshRate: number}>) => {
			state.actualHertz = action.payload.actualHertz;
			state.actualRefreshRate = action.payload.actualRefreshRate;
		}
	}
});

export default clockSlice.reducer;
export const {
	setHertz,
	setRefreshRate,
	setIsRunning,
	setActualHertz,
	setActualRefreshRate,
	setActuals
} = clockSlice.actions;