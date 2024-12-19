import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { BinaryIO } from "../../Interfaces/BinaryIO";
import getIOPathColor from "../../utils/getIOPathColor";
import getIOBGColor from "../../utils/getIOBGColor";
import { RootOptions } from "react-dom/client";
import { createSelector } from "@reduxjs/toolkit";
import { State } from "pixi.js";
import path from "path";

interface InputProps{
	binaryInput: BinaryIO,
}

export const ioEquality = (prev: BinaryIO, next:BinaryIO) => {
	if(prev?.state !== next?.state){
		return false;
	}
	if(prev?.from?.length !== next?.from?.length) return false;
	if(prev?.otherSourceIds?.length !== next?.otherSourceIds?.length){
		return false;
	}
	if(prev?.to?.length !== next?.to?.length) return false;
	if(prev?.highImpedance !== next?.highImpedance){
		return false;
	}
	
	if(prev?.affectsOutput !== next?.affectsOutput){
		return false;
	}
	if(prev?.position?.x !== next?.position?.x || prev?.position?.y !== next?.position?.y){
		return false;
	}
	if(prev?.wireColor !== next?.wireColor) return false;
	return true;
};

export const checkSourceEquality = (prev: BinaryIO[] | undefined, next: BinaryIO[] | undefined) => {
	if(prev?.length !== next?.length) return false;
	let areTrueSourcesEqual = false;
	prev?.forEach((io, idx) => {
		if(io && !io.highImpedance){
			if(next?.[idx] && !next?.[idx].highImpedance){
				areTrueSourcesEqual = true;
			}
		}
	});
	return areTrueSourcesEqual;
};

export const checkTrueSourceEquality = (prev: BinaryIO | undefined, next: BinaryIO | undefined) => {
	if(prev?.wireColor !== next?.wireColor) return false;
	return true;
};
export const Input = React.memo(function Input({binaryInput} : InputProps){
	const eleRef = useRef<HTMLDivElement>(null);
	const thisInput = useSelector((state: RootState) => {
		return state.entities.binaryIO[binaryInput.id] ?? state.entities.currentComponent.binaryIO[binaryInput.id] ?? state.entities.bluePrints.io[binaryInput.id];
	}, ioEquality);
	
	const pathColor:string | undefined = useSelector((state: RootState) => {
		const sourceList: (BinaryIO | undefined)[] | undefined = thisInput?.from?.map(from => {
			return state.entities.currentComponent.binaryIO[from.id] ?? undefined;
		});
		return getIOPathColor(thisInput, sourceList);
	});

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
	
	useEffect(() => {
		eleRef.current?.addEventListener('mousedown', handleMouseDown);

		return () => {
			eleRef.current?.removeEventListener('mousedown', handleMouseDown);
		};
	}, [thisInput, pathColor]);

	return (
		<div ref={eleRef}
			style={{
				width: `var(--io-radius)`,
				height: `var(--io-radius)`,
				position: 'absolute',
				userSelect: 'none',
				willChange: 'transform',
				transform: `translate(calc(${thisInput?.position?.x ?? 0}px - var(--io-radius) / 2), calc(${thisInput?.position?.y ?? 0}px - var(--io-radius) / 2))`,
			}}
		>
			<CircularProgressbar
				value={100}
				background={true}
				styles={buildStyles({
					backgroundColor: getIOBGColor(thisInput),
					pathColor:  pathColor,
				})}
				strokeWidth={16}
			></CircularProgressbar>
				
		</div>
	);

}, (prevInput: InputProps, nextInput: InputProps) => {
	if(prevInput?.binaryInput.id !== nextInput?.binaryInput.id){
		return false;
	} 
	if(prevInput?.binaryInput.style?.top !== nextInput?.binaryInput?.style?.top) {
		return false;
	}
	return true;
});
	
