import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Wire } from "@Shared/interfaces";
import { Gate } from "@Shared/interfaces";
import { BinaryIO } from "../../Interfaces/BinaryIO";

export type EntityClicked = {type: 'Gate' | 'Wire' | 'BinaryIO' | null, entity: Gate | BinaryIO | Wire | null}
interface MouseEvents {
	entityClicked: EntityClicked,
	hoveringOverWire: Wire | null,
    drawingWire: string | null,
	draggingGate: string | null,
	selectedGate: string | null,
	selectedIo: {type: 'input' | 'output', startPos: {x: number, y: number}} | null,
	hoveringOverIo: BinaryIO | null,
	cameraOffset: {x: number, y: number},
	showColorPicker: {show: boolean, id: string | null},
	colorPickerOption: 'Wire' | 'WireTree',
}
const initialState: MouseEvents = { 
	entityClicked: {type: null, entity: null}, 
	hoveringOverWire: null, 
	drawingWire:null,
	draggingGate: null,
	selectedGate: null,
	selectedIo: null,
	hoveringOverIo: null,
	cameraOffset: {x: 0, y: 0},
	showColorPicker: {show: false, id: null},
	colorPickerOption: 'Wire'
};

const mouseEventsSlice = createSlice({
	name: "mouseEventsSlice",
	initialState,
	reducers: {
		/**
		 * Sets the entity that has information displayed about it
		 * @param {PayloadAction<EntityClicked>} action - The action containing the payload of type `EntityClicked`
		 */
		setSelectedEntity: (state, action: PayloadAction<EntityClicked>) => {
			state.entityClicked = action.payload;
		},
		/**
		 * Sets the current wire that is being hovered over.
		 * @param {PayloadAction<Wire | null>} action - The wire that is under the cursor, or null.
		 */
		setHoveringOverWire: (state, action: PayloadAction<Wire | null>) => {
			state.hoveringOverWire = action.payload;
		},
		/**
		 * Sets the currently drawn wire's ID. (To not run the connection logic everytime there is a change in this wire)
		 * @param {PayloadAction<string | null>} action - The new wire ID, or null 
		 */
		setDrawingWire: (state, action: PayloadAction<string | null>) => {
			state.drawingWire = action.payload;
		},
		/**
		 * Sets the selected blueprint ID, while dragging the blueprint
		 * @param {PayloadAction<string | null>} action - The selected blueprint's ID, or null 
		 */
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
		},
		setShowColorPicker: (state, action: PayloadAction<{show: boolean, id: string | null}>) => {
			state.showColorPicker = action.payload;
		},
		setColorPickerOption: (state, action: PayloadAction<'Wire' | 'WireTree'>) => {
			state.colorPickerOption = action.payload;
		},
		setDraggingGate: (state, action: PayloadAction<string | null>) => {
			state.draggingGate = action.payload;
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
	setCameraOffset,
	setShowColorPicker,
	setColorPickerOption,
	setDraggingGate
} = mouseEventsSlice.actions;
    
export default mouseEventsSlice.reducer;