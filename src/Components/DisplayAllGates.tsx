import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../state/store";
import { CustomGate } from "./CustomGate";
import useRedrawCanvas from "../hooks/useRedrawCanvas";
import { CANVAS_HEIGHT, CANVAS_OFFSET_LEFT, CANVAS_WIDTH, MINIMAL_BLOCKSIZE } from "../Constants/defaultDimensions";

export default function DisplayAllGates(){
	const allGates = useSelector((state: RootState) => {return state.entities.createdComponents;});

	return console.log('rendering allgates'),
	<div style={{display: 'flex', top: CANVAS_HEIGHT,
		position: 'absolute',
		width: CANVAS_WIDTH - 30,
		backgroundColor: 'rgb(140 140 140)',
		borderColor: 'rgb(60 60 60)',
		borderWidth: 5,
		padding: 10,
		borderStyle: 'solid'}}>
		{Object.entries(allGates)?.map(([key, gate]) => {
			return <CustomGate
				key={gate.id}
				gateProps={gate}
				preview={true}></CustomGate>;
		})}
	</div>;
}