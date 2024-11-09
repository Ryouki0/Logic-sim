import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getClosestBlock, MINIMAL_BLOCKSIZE } from "../../Constants/defaultDimensions";
export interface Misc{
    currentComponentId: string,
    history: string[],
	canvasWidth: number,
	canvasHeight: number,
	blockSize: number,
	prevBlockSize: number,
	user: string | null,
	globalBlockSize: number
}

const initialState:Misc = {
	currentComponentId: 'global',
	history: ['global'],
	canvasWidth: getClosestBlock(0.8*window.innerWidth, 0, MINIMAL_BLOCKSIZE).roundedX,
	canvasHeight: window.innerHeight - 2*MINIMAL_BLOCKSIZE,
	blockSize: MINIMAL_BLOCKSIZE,
	prevBlockSize: MINIMAL_BLOCKSIZE,
	user: null,
	globalBlockSize: MINIMAL_BLOCKSIZE
};

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
			state.history.pop();
			const last = state.history[state.history.length - 1];
			state.currentComponentId = last!;
		},
		setCanvasDim: (state, action: PayloadAction<{width: number, height: number}>) => {
			state.canvasHeight = action.payload.height;
			state.canvasWidth = action.payload.width;
		},
		setUser: (state, action: PayloadAction<string | null>) => {
			state.user = action.payload;
		},
		changeBlockSizeByTenPercent: (state, action: PayloadAction<number>) => {
			const newSize = parseFloat((action.payload > 0 ? state.blockSize * 0.9 : state.blockSize / 0.9).toFixed(20));
			if(newSize < 10 || newSize > 44){
				return;
			}
			state.prevBlockSize = state.blockSize;
			state.blockSize = newSize;
			console.log(`NEW SIZE: ${state.blockSize}`);
		},
		changeBlockSize: (state, action: PayloadAction<number>) => {
			const newSize = action.payload;
			if(newSize < 10 || newSize > 44){
				return;
			}
			state.prevBlockSize = state.blockSize;
			state.blockSize = newSize;
			
		},
		changeGlobalBlockSize: (state, action: PayloadAction<number>) => {
			state.globalBlockSize = action.payload;
		}
	}
});

export default misc.reducer;
export const {
	setCurrentComponentId,
	goBack,
	setCanvasDim,
	setUser,
	changeBlockSizeByTenPercent,
	changeBlockSize,
	changeGlobalBlockSize
} = misc.actions;