import React, { useCallback, useEffect, useRef, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { BinaryIO } from "../../Interfaces/BinaryIO";
import { DEFAULT_NON_AFFECTING_COLOR, DEFAULT_WIRE_COLOR, RED_ORANGE } from "../../Constants/colors";
import { adjustBrightness } from "../../utils/adjustBrightness";
import Square from "./Square";
import getIOPathColor from "../../utils/getIOPathColor";
import getIOBGColor from "../../utils/getIOBGColor";
import compareStringLists from "../../utils/compareStringLists";

interface InputProps{
	binaryInput: BinaryIO,
}

export const ioEquality = (prev: BinaryIO, next:BinaryIO) => {
	
	if(prev?.from?.length !== next?.from?.length) return false;
	if(prev?.otherSourceIds?.length !== next?.otherSourceIds?.length){
		return false;
	}
	if(prev?.to?.length !== next?.to?.length) return false;
	if(prev?.highImpedance !== next?.highImpedance){
		return false;
	}
	if(prev?.state !== next?.state){
		return false;
	}
	if(prev?.affectsOutput !== next?.affectsOutput){
		return false;
	}
	if(prev?.position?.x !== next?.position?.x || prev?.position?.y !== next?.position?.y){
		return false;
	}
	return true;
};

export const Input = React.memo(function Input({binaryInput} : InputProps){
	const eleRef = useRef<HTMLDivElement>(null);
	const thisInput = useSelector((state: RootState) => {
		return state.entities.binaryIO[binaryInput.id] ?? state.entities.currentComponent.binaryIO[binaryInput.id];
	}, ioEquality);
	const isGlobal = thisInput?.parent === 'global' && !thisInput?.gateId;
	const handleMouseDown = (e:MouseEvent) => {
		e.preventDefault();
		console.log(`\n\n`);
		console.log(`this input ID: ${thisInput?.id.slice(0,5)}`);
		console.log(`this input state: ${thisInput?.state}`);
		console.log(`this input is from: ${thisInput?.from?.map(from => from.id.slice(0.6)).join(', ')}`);
		console.log(`this input position is: X: ${thisInput?.position?.x} Y: ${thisInput?.position?.y}`);
		console.log(`this input parent: ${thisInput?.parent}`);
		thisInput?.to?.forEach(to => {
			console.log(`this input is to: ${to.id.slice(0,5)}`);
		});
		console.log(`this input affects the output: ${thisInput?.affectsOutput}`);
	};
    const ioRadius = useSelector((state: RootState) => {return state.misc.ioRadius});
	
	useEffect(() => {
		eleRef.current?.addEventListener('mousedown', handleMouseDown);

		return () => {
			eleRef.current?.removeEventListener('mousedown', handleMouseDown);
		};
	}, [thisInput]);

	return (
		<>
			<div ref={eleRef}
				style={{
					width: ioRadius,
					height: ioRadius,
					position: 'relative',
					userSelect: 'none',
					left: -(ioRadius / 2),
					...(isGlobal ? {} : binaryInput.style),
				}}
			>
				<CircularProgressbar
					value={100}
					background={true}
					styles={buildStyles({
						backgroundColor: getIOBGColor(thisInput),
						pathColor:  getIOPathColor(thisInput),
					})}
					strokeWidth={16}
				></CircularProgressbar>
				
			</div>
		</>
	);

}, (prevInput: InputProps, nextInput: InputProps) => {
	if(prevInput?.binaryInput.id !== nextInput?.binaryInput.id) return false;
	if(prevInput?.binaryInput.style?.top !== nextInput?.binaryInput?.style?.top) return false;
	return true;
})
	
