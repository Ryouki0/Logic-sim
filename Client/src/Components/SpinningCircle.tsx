import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../state/store";
import calculateGateHeight from "../utils/Spatial/calculateGateHeight";
import { Gate, Wire } from "@Shared/interfaces";
import { MINIMAL_BLOCKSIZE } from "../Constants/defaultDimensions";
import { BinaryIO } from "../Interfaces/BinaryIO";
import { stat } from "fs";
import getType from "../utils/getType";

const checkThisEntity = (prev: Gate | Wire | BinaryIO | undefined, next: Gate | Wire | BinaryIO | undefined) => {
	const prevType = getType(prev);
	const nextType = getType(next);
	if(prev && !next) return false;
	if(prevType !== nextType){
		return false;
	}if(prevType === 'Wire') return true;
	if(prevType === 'Gate'){
		const prevGate = prev as Gate;
		const nextGate = next as Gate;
		if(prevGate.position!.x !== nextGate.position!.x || prevGate.position!.y !== nextGate.position!.y){
			return false;
		}if(prevGate.id !== nextGate.id) return false;

	}if(prevType === 'BinaryIO'){
		const prevIo = prev as BinaryIO;
		const nextIo = next as BinaryIO;
		if(prevIo.position!.x !== nextIo.position!.x || prevIo.position!.y !== nextIo.position!.y){
			return false;
		}if(prevIo.id !== nextIo.id) return false;
	}
	return true;
};

const SpinningCircle = () => {
	const selectedEntity = useSelector((state: RootState) => {return state.mouseEventsSlice.entityClicked;});
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize;});
	const ioRadius = useSelector((state: RootState) => {return state.misc.ioRadius;});
	const cameraOffset = useSelector((state: RootState) => {return state.mouseEventsSlice.cameraOffset;});
	const selectedGate = useSelector((state: RootState) => {return state.mouseEventsSlice.selectedGate;});
	const [shouldShow, setShouldShow] = useState(true);
	const prevBlockSize = useRef(blockSize);
	const currentBlockSize = useRef(blockSize);
	const shouldUpdateShow = useRef(true);

	const thisEntity: Gate | Wire | BinaryIO | undefined = useSelector((state: RootState) => {
		if(selectedEntity?.type === 'Gate'){
			return state.entities.currentComponent.gates[selectedEntity?.entity!.id];
		}else if(selectedEntity?.type === 'BinaryIO'){
			return state.entities.currentComponent.binaryIO[selectedEntity!.entity!.id];
		}else{
			return state.entities.currentComponent.wires[selectedEntity?.entity?.id!];
		}
	}, checkThisEntity);
    
	useEffect(() => {
		prevBlockSize.current = currentBlockSize.current;
		currentBlockSize.current = blockSize;
	}, [blockSize, ioRadius]);

	useEffect(() => {
		setShouldShow(true);
	}, [selectedEntity]);

	function getRadius():{radius: number, center: {x: number, y: number}}{
		if(selectedEntity?.type === 'Gate'){
			const height = calculateGateHeight(thisEntity as Gate, blockSize);
			const width = 3*blockSize;
			const longest = height > width ? height : width;
			return {
				radius: (longest/2) + 0.1*longest,
				center: {
					x: (thisEntity as Gate)?.position!.x + width/2,
					y: (thisEntity as Gate)?.position!.y + height/2
				}};
		}else if(selectedEntity?.type === 'BinaryIO'){
			return {
				radius: ioRadius,
				center: {
					x: (thisEntity as BinaryIO)?.position!.x,
					y: (thisEntity as BinaryIO)?.position!.y,
				} 
			};
		}else{
			return {
				radius: 0,
				center: {
					x: 0,
					y: 0,
				}
			};
		}
	}
	const {radius, center} = getRadius();
	const size = radius * 2; // Circle's diameter
	const style = {
		width: `${size}px`,
		height: `${size}px`,
		top: `${center.y - radius + cameraOffset.y}px`,
		left: `${center.x - radius + cameraOffset.x}px`,
	};

	
	const handleMouseDown = (e: MouseEvent) => {
		if(e.button !== 0 || selectedGate) return; 
		const target = e.target as HTMLElement;
		if(target.classList.contains('Gate-container') || target.classList.contains('CircularProgressbar') 
            || target.classList.contains('CircularProgressbar-path') || target.classList.contains('io')){
			setShouldShow(true);
			return;
		}else{
			setShouldShow(false);
		}
	};

	useEffect(() => {
		document.addEventListener('mousedown', handleMouseDown);
		return () => {
			document.removeEventListener('mousedown', handleMouseDown);
		};
	}, [selectedEntity, blockSize, ioRadius, thisEntity]);

	useEffect(() => {
		if(prevBlockSize.current !== blockSize){
			shouldUpdateShow.current = false;
			return;
		}
		if(shouldUpdateShow.current){
			setShouldShow(true);
		}
	}, [thisEntity]);

	return <>
		{shouldShow ? 
			(selectedEntity?.entity ? <div className="spinning-circle" style={{...style, pointerEvents: 'none'}}></div> : null) 
			: null}
	</>;
};

export default SpinningCircle;
