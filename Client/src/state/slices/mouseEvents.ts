import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Wire } from "@Shared/interfaces";
import { Gate } from "@Shared/interfaces";
import { BinaryIO } from "../../Interfaces/BinaryIO";

export type EntityClicked = {type: 'Gate' | 'Wire' | 'BinaryInput' | null, entity: Gate | BinaryIO | Wire | null}
interface MouseEvents {
	entityClicked: EntityClicked,
	hoveringOverWire: Wire | null,
    drawingWire: string | null,
	selectedGate: string | null,
	hoveringOverIo: BinaryIO | null,
}
const initialState: MouseEvents = { 
	entityClicked: {type: null, entity: null}, 
	hoveringOverWire: null, 
	drawingWire:null,
	selectedGate: null,
	hoveringOverIo: null,
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
		setHoveringOverIo: (state, action: PayloadAction<BinaryIO | null>) => {
			state.hoveringOverIo = action.payload;
		}
	},
});

export const {
	setSelectedEntity,
	setHoveringOverWire,
	setDrawingWire,
	setSelectedGateId,
	setHoveringOverIo
} = mouseEventsSlice.actions;
    
export default mouseEventsSlice.reducer;