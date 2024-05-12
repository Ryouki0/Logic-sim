import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../state/store";
import { CustomGate } from "./CustomGate";
import useRedrawCanvas from "../hooks/useRedrawCanvas";
import { MINIMAL_BLOCKSIZE } from "../Constants/defaultDimensions";

export default function DisplayAllGates(){
	const allGates = useSelector((state: RootState) => {return state.allGatesSlice;});

	return console.log('rendering allgates'),
	<div style={{display: 'flex', marginLeft: 3*MINIMAL_BLOCKSIZE}}>
		{allGates?.map((gate) => {
			return <CustomGate
				key={gate.id}
				gateProps={gate} 
				preview={true}></CustomGate>;
		})}
	</div>;
}