import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../state/store";
import { CustomGate } from "./CustomGate";
import useRedrawCanvas from "../hooks/useRedrawCanvas";
import { CANVAS_HEIGHT, CANVAS_OFFSET_LEFT, CANVAS_WIDTH, DEFAULT_BORDER_WIDTH, MINIMAL_BLOCKSIZE } from "../Constants/defaultDimensions";
import { Gate } from "../Interfaces/Gate";

const checkAllGatesEquality = (prev: {[key: string]: Gate}, next: {[key: string]: Gate}) => {
	const prevEntries = Object.entries(prev);
	const nextEntries = Object.entries(next);
	if(prevEntries?.length !== nextEntries?.length){
		return false;
	}
	return true;
}

export default function DisplayAllGates(){
	const allGates = useSelector((state: RootState) => {
		const topLevelComponents:{[key: string]: Gate}= {};
		Object.entries(state.entities.bluePrints.gates).forEach(([key, gate]) => {
			if(gate.parent === 'global'){
				topLevelComponents[key] = gate;
			}
		})
		return topLevelComponents;
	}, checkAllGatesEquality);

	return console.log('rendering allgates'),
	<div style={{display: 'flex', top: CANVAS_HEIGHT,
		position: 'absolute',
		width: CANVAS_WIDTH,
		height: '10%',
		zIndex: 0,
		backgroundColor: 'rgb(140 140 140)',
		borderColor: 'rgb(60 60 60)',
		borderWidth: DEFAULT_BORDER_WIDTH,
		padding: 10,
		paddingLeft: 2*MINIMAL_BLOCKSIZE,
		borderStyle: 'solid'}}
		onMouseDown={e => e.preventDefault()}
		>
		{Object.entries(allGates)?.map(([key, gate]) => {
			return <div style={{
				borderColor: 'rgb (200 200 200)',
				borderWidth: 2,
				marginRight: 30,
			}} key={key}>
			<CustomGate
				key={gate.id}
				gateProps={gate}
				preview={true}></CustomGate>
			</div>
		})}
	</div>;
}