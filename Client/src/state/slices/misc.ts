import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_INPUT_DIM, getClosestBlock, LINE_WIDTH, MINIMAL_BLOCKSIZE } from "../../Constants/defaultDimensions";
import getSizes from "../../utils/getSizes";
import { setSelectedEntity } from "./mouseEvents";
export interface Misc{
    currentComponentId: string,
    history: string[],
	canvasWidth: number,
	canvasHeight: number,
	blockSize: number,
	prevBlockSize: number,
	user: string | null,
	globalBlockSize: number,
	lineWidth: number,
	ioRadius: number,
	selectedElement: string | null,
}

/**
 * This is for the data that gets loaded from the server
 */
export interface MiscBase{
	currentComponentId: string,
    history: string[],
	canvasWidth: number,
	canvasHeight: number,
	blockSize: number,
	prevBlockSize: number,
	globalBlockSize: number,
	lineWidth: number,
	ioRadius: number,
}
const initialState:Misc = {
	currentComponentId: 'global',
	history: ['global'],
	canvasWidth: getClosestBlock(0.8*window.innerWidth, 0, MINIMAL_BLOCKSIZE).roundedX,
	canvasHeight: window.innerHeight - 2*MINIMAL_BLOCKSIZE,
	blockSize: MINIMAL_BLOCKSIZE,
	prevBlockSize: MINIMAL_BLOCKSIZE,
	user: null,
	globalBlockSize: MINIMAL_BLOCKSIZE,
	lineWidth: LINE_WIDTH,
	ioRadius: DEFAULT_INPUT_DIM.width,
	selectedElement: null,
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
			const {lineWidth, ioRadius} = getSizes(newSize);
			state.lineWidth = lineWidth;
			state.ioRadius = ioRadius;
		},
		changeBlockSize: (state, action: PayloadAction<number>) => {
			const newSize = action.payload;
			if(newSize < 10 || newSize > 44){
				return;
			}
			state.prevBlockSize = state.blockSize;
			state.blockSize = newSize;
			const {lineWidth, ioRadius} = getSizes(newSize);
			state.lineWidth = lineWidth;
			state.ioRadius = ioRadius;
		},
		changeGlobalBlockSize: (state, action: PayloadAction<number>) => {
			if(action.payload < 10 || action.payload > 44) return;
			state.globalBlockSize = action.payload;
			const {lineWidth, ioRadius} = getSizes(action.payload);
			state.ioRadius = ioRadius;
			state.lineWidth = lineWidth;
		},
		changeMisc: (state, action: PayloadAction<{misc: MiscBase}>) => {
			return state = {...state, ...action.payload.misc};
		},
		setSelectedElement: (state, action: PayloadAction<string | null>) => {
			state.selectedElement = action.payload;
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
	changeGlobalBlockSize,
	changeMisc,
	setSelectedElement
} = misc.actions;