import React, { useEffect, useRef, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
	DEFAULT_INPUT_DIM,
} from "../Constants/defaultDimensions";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state/store";
import { BinaryInput } from "../Interfaces/BinaryInput";
import startDrawingLine from "../DrawLine";
import { stat } from "fs";
import { AMBER, RED_ORANGE, SEA_MID_GREEN } from "../Constants/colors";
import { changeInputPosition } from "../state/objectsSlice";

interface InputProps{
	binaryInput: BinaryInput,
	gateId?: string,
	inputIdx?: number,
	onClick?(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void,
	onRightClick?(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void,
}

function checkInputEquality(prev:BinaryInput, next: BinaryInput){
	//console.log(`input should render? ${prev?.state}!==${next?.state} ${prev?.state !== next?.state}`);
	
	if(prev?.state !== next?.state || prev?.from !== next?.from){
		return false;
	}else{
		return true;
	}
}

export function Input({binaryInput,gateId,inputIdx, onClick, onRightClick}: InputProps) {
	const dispatch = useDispatch();
	const eleRef = useRef<HTMLDivElement>(null);
	//const objectClicked = useSelector((state: RootState) => {return state.mouseEventsSlice.objectClicked;});
	
	const currentInput = useSelector((state: RootState) => {
		if(!gateId){
			return state.objectsSlice.currentInputs[binaryInput.id]
		}else{
			const foundIndex = state.objectsSlice.gates.findIndex(g => g.id === gateId);
			return state.objectsSlice.gates[foundIndex]?.inputs[inputIdx??0];
		}
		},checkInputEquality
	);

	
	const connectedTo = useSelector((state: RootState) => {
		if(gateId){
			if(currentInput?.from){
				return state.objectsSlice.currentInputs[currentInput.from.id];
			}
		}
		return null;
	}) 
	
	
	function handleMouseDown(e: React.MouseEvent<any>){
		e.stopPropagation();
		if(onClick){
			onClick(e);
		}
		if(gateId){
			console.log(`connected To: ${connectedTo?.id} state: ${connectedTo?.state}`);
			console.log(`this inputs id: ${currentInput.id}`)
		}
		startDrawingLine(e, dispatch, binaryInput);
	}

	return (
		<>
		{/*ateId ? console.log(`currentInput state: ${currentInput?.state}`) : null*/}
			<div ref={eleRef}
			style={{
				width: DEFAULT_INPUT_DIM.width,
				height: DEFAULT_INPUT_DIM.height,
				position: 'relative',
				left: -(DEFAULT_INPUT_DIM.width / 2),
				...binaryInput.style,
			}}
			onMouseDown={handleMouseDown}
			onContextMenu={onRightClick ? onRightClick : () => {console.log('undefined')}}>
				<CircularProgressbar
					value={100}
					background={true}
					styles={buildStyles({
						backgroundColor: "black",
						pathColor: connectedTo ? (connectedTo?.state === 1 ? RED_ORANGE : AMBER) : 'black',
					})}
					strokeWidth={14}
				></CircularProgressbar>
			</div>
		</>
	);
}
