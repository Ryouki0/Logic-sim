import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Wire } from "../../Interfaces/Wire";
import { Gate } from "../../Interfaces/Gate";
import { BinaryIO } from "../../Interfaces/BinaryIO";

export type EntityClicked = {type: 'Gate' | 'Wire' | 'BinaryInput' | null, entity: Gate | BinaryIO | Wire | null}
interface IEntityClicked {
	entityClicked: EntityClicked,
	hoveringOverWire: Wire | null,
    drawingWire: string | null,
}
const initialState: IEntityClicked = { entityClicked: {type: null, entity: null}, hoveringOverWire: null, drawingWire:null};

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
		}
	},
});

export const {
	setSelectedEntity,
	setHoveringOverWire,
	setDrawingWire} = mouseEventsSlice.actions;
    
export default mouseEventsSlice.reducer;