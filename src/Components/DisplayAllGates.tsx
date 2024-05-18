import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../state/store";
import { CustomGate } from "./CustomGate";
import useRedrawCanvas from "../hooks/useRedrawCanvas";
import { CANVAS_OFFSET_LEFT, CANVAS_WIDTH_MULTIPLIER, MINIMAL_BLOCKSIZE } from "../Constants/defaultDimensions";

export default function DisplayAllGates(){
	const allGates = useSelector((state: RootState) => {return state.allGatesSlice;});

	return console.log('rendering allgates'),
	<div style={{display: 'flex', top: window.innerHeight * CANVAS_WIDTH_MULTIPLIER,
	position: 'absolute',
	width: (window.innerWidth * CANVAS_WIDTH_MULTIPLIER) - 30,
	backgroundColor: 'rgb(140 140 140)',
	borderColor: 'rgb(60 60 60)',
	borderWidth: 5,
	padding: 10,
	borderStyle: 'solid'}}>
		{allGates?.map((gate) => {
			return <CustomGate
				key={gate.id}
				gateProps={gate}
				preview={true}></CustomGate>;
		})}
	</div>;
}