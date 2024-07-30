import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state/store";
import { CustomGate } from "./CustomGate";
import useRedrawCanvas from "../hooks/useRedrawCanvas";
import { CANVAS_HEIGHT, CANVAS_OFFSET_LEFT, CANVAS_WIDTH, DEFAULT_BORDER_WIDTH, MINIMAL_BLOCKSIZE } from "../Constants/defaultDimensions";
import { Gate } from "../Interfaces/Gate";
import { setSelectedGateId } from "../state/slices/mouseEvents";
import { changeBluePrintPosition } from "../state/slices/entities";
import { createSelector } from "@reduxjs/toolkit";

const checkAllGatesEquality = (prev: {[key: string]: Gate}, next: {[key: string]: Gate}) => {
	const prevEntries = Object.entries(prev);
	const nextEntries = Object.entries(next);
	if(prevEntries?.length !== nextEntries?.length){
		return false;
	}
	return true;
};

export default function DisplayAllGates(){
	const selectGates = (state: RootState) => state.entities.bluePrints.gates;

	const bluePrintsSelector = createSelector(
  		[selectGates],
  		(gates) => {
    	const topLevelComponents: { [key: string]: Gate } = {};
    	Object.entries(gates).forEach(([key, gate]) => {
      	if(gate.parent === 'global') {
        	topLevelComponents[key] = gate;
      	}
			});
			return topLevelComponents;
		}
	);

	const bluePrints = useSelector(bluePrintsSelector);
	const dispatch = useDispatch();

	return <div style={{display: 'flex', top: CANVAS_HEIGHT,
		position: 'absolute',
		width: CANVAS_WIDTH,
		height: 2*MINIMAL_BLOCKSIZE,
		zIndex: 0,
		backgroundColor: 'rgb(140 140 140)',
		borderColor: 'rgb(60 60 60)',
		borderWidth: DEFAULT_BORDER_WIDTH,
		padding: 10,
		alignContent: 'center',
		paddingLeft: 2*MINIMAL_BLOCKSIZE,
		borderStyle: 'solid'
	}}
	onMouseDown={e => e.preventDefault()}
	>
		{Object.entries(bluePrints)?.map(([key, gate]) => {
			return <div
				onMouseDown={e => {
					if(e.button !== 0) return;
					e.stopPropagation();
					dispatch(setSelectedGateId(key));
					dispatch(changeBluePrintPosition({gateId: key, position: {x: e.pageX, y: e.pageY}}));}}
				style={{
					backgroundColor: 'rgb(70 70 70)',
					height: 40,
					marginRight: 7,
					alignSelf: 'center',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					cursor: 'pointer',
					width: 3*MINIMAL_BLOCKSIZE,
				}} key={key}>
				<span style={{
					color: 'white',
					fontSize: 18,
					userSelect: 'none',
				}}>{gate.name}</span>
			</div>;
		})
		}
	</div>;
}