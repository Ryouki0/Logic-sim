import React, { useEffect, useRef, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
	DEFAULT_INPUT_DIM,
} from "../Constants/defaultDimensions";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state/store";
import { BinaryInput } from "../Interfaces/BinaryInput";
import startDrawingLine from "../hooks/useDrawWire";
import { stat } from "fs";
import { AMBER, RED_ORANGE, SEA_MID_GREEN } from "../Constants/colors";
import useDrawWire from "../hooks/useDrawWire";
import { connect } from "http2";

interface InputProps{
	binaryInput: BinaryInput,
	gateId?: string,
	inputIdx?: number,
	
}



export function Input({binaryInput,gateId,inputIdx}: InputProps) {
	const eleRef = useRef<HTMLDivElement>(null);
	//const objectClicked = useSelector((state: RootState) => {return state.mouseEventsSlice.objectClicked;});
	const startDrawing = useDrawWire();
	const currentInput = useSelector((state: RootState) => {
		if(!binaryInput.gateId){
			return state.objectsSlice.globalInputs[binaryInput.id];
		}else{
			return state.objectsSlice.gates[binaryInput.gateId]?.inputs[binaryInput.id];
		}
	});
	//const allInputs = useSelector((state:RootState) => {return state.objectsSlice.currentInputs});
	const from = useSelector((state: RootState) => {
		if(currentInput?.from){
			const inputOrOutput = currentInput.from?.type;
			if(currentInput.from.gateId){
				return state.objectsSlice.gates[currentInput.from.gateId][inputOrOutput][currentInput.from.id];
			}else{
				return state.objectsSlice.globalInputs[currentInput.from?.id];
			}
		}
	})
	
	function handleMouseDown(e: React.MouseEvent<any>){
		e.stopPropagation();
		if(from){
			console.log(`${from.id} ${from.state}`);
		}
		// console.log(`this inpot is TO: ${currentInput.to?.[0]?.id}`);
		// console.log(`this input is from: ${currentInput.from?.type} ${currentInput.from?.id}`);
		// console.log(`this inputs position is: ${currentInput.position?.x} ${currentInput.position?.y}`);
		startDrawing(e, {id: currentInput.id, type: 'inputs', gateId: binaryInput.gateId});
	}
	const getPathColor = () => {
		if(currentInput?.gateId){
			return currentInput?.from ? (currentInput?.state === 1 ? RED_ORANGE : AMBER) : 'black'
		}else{
			return currentInput?.state ? RED_ORANGE : AMBER;
		}
	}
	return (
		<>
			{/*gateId ? console.log(`currentInput state: ${currentInput?.state}`) : null*/}
			<div ref={eleRef}
				style={{
					width: DEFAULT_INPUT_DIM.width,
					height: DEFAULT_INPUT_DIM.height,
					position: 'relative',
					left: -(DEFAULT_INPUT_DIM.width / 2),
					...binaryInput.style,
				}}
				onMouseDown={handleMouseDown}>
				<CircularProgressbar
					value={100}
					background={true}
					styles={buildStyles({
						backgroundColor: "black",
						pathColor: getPathColor(),
					})}
					strokeWidth={currentInput?.from ? 12 : 100}
				></CircularProgressbar>
			</div>
		</>
	);
}
