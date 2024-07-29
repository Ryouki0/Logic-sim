import React, { useCallback, useEffect, useRef, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
	DEFAULT_INPUT_DIM,
} from "../Constants/defaultDimensions";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state/store";
import { BinaryIO } from "../Interfaces/BinaryIO";

interface InputProps{
	binaryInput: BinaryIO,
	extraFn?: () => void;
	pointerEvents?: 'auto' | 'none',
}

export const ioEquality = (prev: BinaryIO, next:BinaryIO) => {
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

export function Input({binaryInput }: InputProps) {
	const eleRef = useRef<HTMLDivElement>(null);
	const thisInput = useSelector((state: RootState) => {
		return state.entities.binaryIO[binaryInput.id] ?? state.entities.currentComponent.binaryIO[binaryInput.id];}, ioEquality);
	
	const handleMouseDown = (e:MouseEvent) => {
		console.log(`\n\n`);
		console.log(`this input ID: ${thisInput?.id.slice(0,5)}`);
		console.log(`this input state: ${thisInput?.state}`);
		console.log(`this input is from: ${thisInput?.from?.id.slice(0,5)}`);
		console.log(`this input position is: X: ${thisInput?.position?.x} Y: ${thisInput?.position?.y}`);
		console.log(`this input parent: ${thisInput?.parent}`);
		thisInput?.to?.forEach(to => {
			console.log(`this input is to: ${to.id.slice(0,5)}`);
		})
	};
	
	useEffect(() => {
		eleRef.current?.addEventListener('mousedown', handleMouseDown);

		return () => {
			eleRef.current?.removeEventListener('mousedown', handleMouseDown);
		}
	}, [thisInput])

	return (
		<>
			{/* {console.log(`RENDER INPUT -- ${thisInput?.gateId?.slice(0,5)}`)} */}
			<div ref={eleRef}
				style={{
					width: DEFAULT_INPUT_DIM.width,
					height: DEFAULT_INPUT_DIM.height,
					position: 'relative',
					userSelect: 'none',
					left: -(DEFAULT_INPUT_DIM.width / 2),
					...binaryInput?.style,
				}}
				>
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
