import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Wire } from "@Shared/interfaces";
import { Gate } from "@Shared/interfaces";
import { BinaryIO } from "../../Interfaces/BinaryIO";

export type EntityClicked = {type: 'Gate' | 'Wire' | 'BinaryIO' | null, entity: Gate | BinaryIO | Wire | null}
interface MouseEvents {
	entityClicked: EntityClicked,
	hoveringOverWire: Wire | null,
    drawingWire: string | null,
	selectedGate: string | null,
	selectedIo: {type: 'input' | 'output', startPos: {x: number, y: number}} | null,
	hoveringOverIo: BinaryIO | null,
	cameraOffset: {x: number, y: number}
}
const initialState: MouseEvents = { 
	entityClicked: {type: null, entity: null}, 
	hoveringOverWire: null, 
	drawingWire:null,
	selectedGate: null,
	selectedIo: null,
	hoveringOverIo: null,
	cameraOffset: {x: 0, y: 0}
};

const mouseEventsSlice = createSlice({
	name: "mouseEventsSlice",
	initialState,
	reducers: {
		setSelectedEntity: (state, action: PayloadAction<EntityClicked>) => {
			state.entityClicked = action.payload;
		},
		setHoveringOverWire: (state, action: PayloadAction<Wire | null>) => {
			state.hoveringOverWire = action.payload;
		},
		setDrawingWire: (state, action: PayloadAction<string | null>) => {
			state.drawingWire = action.payload;
		},
		setSelectedGateId: (state, action: PayloadAction<string | null>) => {
			state.selectedGate = action.payload;
		},
		setSelectedIo: (state, action: PayloadAction<{type: 'input' | 'output', startPos: {x: number, y:number}} | null>) => {
			state.selectedIo = action.payload;
		},
		setHoveringOverIo: (state, action: PayloadAction<BinaryIO | null>) => {
			state.hoveringOverIo = action.payload;
		},
		setCameraOffset: (state, action:PayloadAction<{dx: number, dy: number}>) => {
			const dx = action.payload.dx;
			const dy = action.payload.dy;
			state.cameraOffset = {x: state.cameraOffset.x + dx, y: state.cameraOffset.y + dy};
		}
	},
});

export const {
	setSelectedEntity,
	setHoveringOverWire,
	setDrawingWire,
	setSelectedGateId,
	setHoveringOverIo,
	setSelectedIo,
	setCameraOffset
} = mouseEventsSlice.actions;
    
export default mouseEventsSlice.reducer;