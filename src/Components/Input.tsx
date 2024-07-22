import React, { useEffect, useRef, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
	DEFAULT_INPUT_DIM,
} from "../Constants/defaultDimensions";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state/store";
import { AMBER, RED_ORANGE, SEA_MID_GREEN } from "../Constants/colors";
import useDrawWire from "../hooks/useDrawWire";
import { BinaryIO } from "../Interfaces/BinaryIO";

interface InputProps{
	binaryInput: BinaryIO,
	gateId?: string,
	inputIdx?: number,
	
}

const inputEquality = (prev: BinaryIO, next:BinaryIO) => {
	if(prev?.from?.id !== next?.from?.id){
		return false;
	}
	if(prev?.state !== next?.state){
		return false;
	}
	if(prev?.position?.x !== next?.position?.x || prev?.position?.y !== next?.position?.y){
		return false;
	}
	return true;
};

export function Input({binaryInput,gateId,inputIdx}: InputProps) {
	const eleRef = useRef<HTMLDivElement>(null);
	//const objectClicked = useSelector((state: RootState) => {return state.mouseEventsSlice.objectClicked;});
	const startDrawing = useDrawWire();
	const thisInput = useSelector((state: RootState) => {
		return state.entities.binaryIO[binaryInput.id] ?? state.entities.currentComponent.binaryIO[binaryInput.id];}, inputEquality);
	//const allInputs = useSelector((state:RootState) => {return state.entities.currentInputs});
	
	const handleMouseDown = (e:React.MouseEvent<any>) => {
		e.stopPropagation();
		console.log(`\n\n`);
		console.log(`this input ID: ${thisInput?.id.slice(0,5)}`);
		console.log(`this input state: ${thisInput?.state}`);
		console.log(`this input is from: ${thisInput?.from?.id.slice(0,5)}`);
		console.log(`this input position is: X: ${thisInput?.position?.x} Y: ${thisInput?.position?.y}`);
		console.log(`this input parent: ${thisInput?.parent}`);
		thisInput?.to?.forEach(to => {
			console.log(`this input is to: ${to.id.slice(0,5)}`);
		})
		startDrawing(e, {id:binaryInput.id, type: 'input', gateId: gateId});
	};
	
	
	return (
		<>
			{/* {console.log(`RENDER INPUT -- ${thisInput?.gateId?.slice(0,5)}`)} */}
			<div ref={eleRef}
				style={{
					width: DEFAULT_INPUT_DIM.width,
					height: DEFAULT_INPUT_DIM.height,
					position: 'relative',
					left: -(DEFAULT_INPUT_DIM.width / 2),
					...binaryInput?.style,
				}}
				onMouseDown={e => {handleMouseDown(e);}}>
				<CircularProgressbar
					value={100}
					background={true}
					styles={buildStyles({
						backgroundColor: thisInput?.state ? "rgb(255 60 60)" : 'black',
						pathColor: "black",
					})}
					strokeWidth={14}
				></CircularProgressbar>
			</div>
		</>
	);
}
