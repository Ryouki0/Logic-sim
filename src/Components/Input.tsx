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

interface InputProps{
	binaryInput: BinaryInput,
	onClick?(): void,
}

export function Input({binaryInput, onClick}: InputProps) {

	const objectClicked = useSelector((state: RootState) => {return state.mouseEventsSlice.objectClicked;});
	const currentInput = useSelector((state: RootState) => {return state.objectsSlice.currentInputs[0];});
	const dispatch = useDispatch();
	function handleMouseUp(e:React.MouseEvent<HTMLDivElement, MouseEvent>) {
		if(objectClicked == 'Wire'){
			console.log(`connected ${objectClicked}`);
		}
	}

	function handleMouseDown(e: React.MouseEvent<any>){
		startDrawingLine(e, dispatch, binaryInput);
	}

	return (
		<>
			<div style={{
				width: DEFAULT_INPUT_DIM.width,
				height: DEFAULT_INPUT_DIM.height,
				position: 'relative',
				left: -(DEFAULT_INPUT_DIM.width / 2),
				...binaryInput.style,
			}}
			onMouseDown={e => handleMouseDown(e)}
			onMouseUp={(e) => {handleMouseUp(e);}}>
				<CircularProgressbar
					value={100}
					background={true}
					styles={buildStyles({
						backgroundColor: currentInput?.state ? "red" : "grey",
						trailColor: "grey",
						pathColor: "rgb(204 102 0)",
					})}
					strokeWidth={16}
				></CircularProgressbar>
			</div>
		</>
	);
}
