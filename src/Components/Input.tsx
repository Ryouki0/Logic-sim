import React, { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
	DEFAULT_CANVAS_DIM,
	DEFAULT_INPUT_DIM,
} from "../Constants/defaultDimensions";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state/store";
import { BinaryInput } from "../Interfaces/BinaryInput";
import startDrawingLine from "../DrawLine";
import { stat } from "fs";
import { AMBER, SEA_MID_GREEN } from "../Constants/colors";

interface InputProps{
	binaryInput: BinaryInput,
	onClick?(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void,
	onRightClick?(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void,
}

function checkInputEquality(prev:BinaryInput, next: BinaryInput){
	console.log(`input should render? ${prev?.state}!==${next?.state} ${prev?.state !== next?.state}`);
	
	if(prev?.state !== next?.state){
		return false;
	}else{
		return true;
	}
}

export function Input({binaryInput, onClick, onRightClick}: InputProps) {

	//const objectClicked = useSelector((state: RootState) => {return state.mouseEventsSlice.objectClicked;});
	const currentInput = useSelector((state: RootState) => {
		const foundIndex = state.objectsSlice.currentInputs.findIndex(input => input.id === binaryInput.id);
		return state.objectsSlice.currentInputs[foundIndex];
	},checkInputEquality);
		if(onClick){
		console.log('rendering input with state: ',binaryInput.state);
		console.log(`currentInput in state: `, currentInput?.id);
	}
	const dispatch = useDispatch();
	function handleMouseUp(e:React.MouseEvent<HTMLDivElement, MouseEvent>) {
		
	}

	function handleMouseDown(e: React.MouseEvent<any>){
		e.stopPropagation();
		if(onClick){
			onClick(e);
		}
		startDrawingLine(e, dispatch, binaryInput);
	}

	return (
		<>
		{/*console.log('rendering input...')*/}
			<div style={{
				width: DEFAULT_INPUT_DIM.width,
				height: DEFAULT_INPUT_DIM.height,
				position: 'relative',
				left: -(DEFAULT_INPUT_DIM.width / 2),
				...binaryInput.style,
			}}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onContextMenu={onRightClick ? onRightClick : () => {console.log('undefined')}}>
				<CircularProgressbar
					value={100}
					background={true}
					styles={buildStyles({
						backgroundColor: "grey",
						pathColor: currentInput?.state === 1 ? SEA_MID_GREEN : AMBER,
					})}
					strokeWidth={12}
				></CircularProgressbar>
			</div>
		</>
	);
}
