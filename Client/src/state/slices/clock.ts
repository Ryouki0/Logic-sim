import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { isRegularExpressionLiteral } from "typescript";


export interface Clock{
	hertz: number,
	refreshRate: number,
	isRunning: boolean,
	actualHertz: number,
	clockPhase: 'starting' | 'stopping' | null,
	actualRefreshRate: number,
	error: {isError: boolean, extraInfo:string}
}

const initialState: Clock = {
	hertz: 30, 
	refreshRate: 30,
	isRunning: false,
	actualHertz: 0,
	clockPhase: null,
	actualRefreshRate: 0,
	error: {isError: false, extraInfo: ''}
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
		},
		setError: (state, action: PayloadAction<{isError: boolean, extraInfo: string}>) => {
			state.error = action.payload;
		},
		setPhase: (state, action: PayloadAction<'starting' | 'stopping' | null>) => {
			state.clockPhase = action.payload;
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
	setActuals,
	setError,
	setPhase
} = clockSlice.actions;