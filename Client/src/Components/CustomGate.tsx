import React, { useEffect, useMemo, useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import handleMouseDown from '../handleGateEvents';
import { Input } from './IO/Input';
import { MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import { Output } from './IO/Output';
import { Gate } from '../Interfaces/Gate';
import { RootState } from '../state/store';
import './../gate.css';
import './../index.css';
import { calculateInputTop } from '../utils/Spatial/calculateInputTop';
import { setDraggingGate, setSelectedEntity } from '../state/slices/mouseEvents';
import { BinaryIO } from '../Interfaces/BinaryIO';
import { createSelector } from '@reduxjs/toolkit';
import { addGate, changeGatePosition, changeIOPosition, changeInputState, deleteComponent } from '../state/slices/entities';
import calculateGateHeight from '../utils/Spatial/calculateGateHeight';
import { Root } from 'react-dom/client';
import { private_excludeVariablesFromRoot } from '@mui/material';
import { CustomGateJSX } from './CustomGateJSX';
interface CustomGateProps{
    gateId: string,
	isBluePrint: boolean,
	position?: 'absolute' | 'relative'
}

function checkInputEquality(prev:BinaryIO[], next:BinaryIO[]){
	return prev?.length === next?.length;
}

function checkGateEquality(prev: Gate, next: Gate){
	if(!prev || !next){
		return true;
	}
	if(prev?.nextTick !== next?.nextTick){
		return false;
	}
	return prev.position?.x === next.position?.x && prev.position?.y === next.position?.y;
}

export const CustomGate = React.memo(function CustomGate({gateId, isBluePrint, position}:CustomGateProps){
	const eleRef = useRef<HTMLDivElement>(null);
	const spanRef = useRef<HTMLSpanElement>(null);
	const spanDivRef = useRef<HTMLDivElement>(null);
	const dispatch = useDispatch();
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize;});
	const prevSize = useRef<number>(blockSize);
	const thisGate = useSelector((state: RootState) => {
		if(isBluePrint){
			return state.entities.bluePrints.gates[gateId];
		}
		return state.entities.gates[gateId] ?? 
		state.entities.currentComponent.gates[gateId];
	}, checkGateEquality);
	const ioRadius = useSelector((state: RootState) => {return state.misc.ioRadius;});

	const offsetRef = useRef({dx: 
		thisGate?.position ? thisGate.position.x : 0, 
	dy: thisGate?.position ? thisGate.position.y : 0});

	const setOffset = (dx:number, dy:number) => {
		offsetRef.current = {...offsetRef.current, dx: dx, dy: dy};
	};
	const inputs = useSelector((state: RootState) => {
		if(isBluePrint){
			return thisGate?.inputs.map(inputId => {
				return state.entities.bluePrints.io[inputId];
			});

		}else{
			return thisGate?.inputs.map(input => {
				return state.entities.binaryIO[input] ?? state.entities.currentComponent.binaryIO[input];
			});
		}
	}, () => true);

	const outputs = useSelector((state: RootState) => {
		if(isBluePrint){
			return thisGate?.outputs.map(outputId => {
				return state.entities.bluePrints.io[outputId];
			});
		}else{
			return thisGate?.outputs.map(outputId => {
				return state.entities.binaryIO[outputId] ?? state.entities.currentComponent.binaryIO[outputId];
			});
		}
	}, () => true);

	function setPositions(x: number, y: number){
		dispatch(changeGatePosition({gate: thisGate, position: {x: x,y: y}, blockSize: blockSize, ioRadius}));
	};
	function stopDraggingGate(){
		dispatch(setDraggingGate(null));
	}
	const handleMouseDownEvent = (e: MouseEvent) => {
		e.stopPropagation();
		if(e.target !== eleRef.current && e.target !== spanRef.current && e.target !== spanDivRef.current) return;
		if(e.button !== 0) return;
		if(!isBluePrint){
			e.preventDefault();
			dispatch(setSelectedEntity({ type: 'Gate', entity: thisGate }));
			dispatch(setDraggingGate(thisGate?.id));
			handleMouseDown(e as any, eleRef, offsetRef.current.dx, offsetRef.current.dy, blockSize, setOffset, setPositions, stopDraggingGate);
		}
	};


	const handleContextMenu = (e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dispatch(deleteComponent(thisGate.id));
		dispatch(setSelectedEntity({entity: null, type: null}));
	};

	const handleBluePrintContextMenu = (e:MouseEvent) => {
		e.preventDefault();
		
	};
	useEffect(() => {
		if(!isBluePrint){
			eleRef.current?.addEventListener('contextmenu', handleContextMenu);
			eleRef.current?.addEventListener('mousedown', handleMouseDownEvent, {capture: true});
		}else{
			eleRef.current?.addEventListener('contextmenu', handleBluePrintContextMenu);
		}

		return () => {
			eleRef.current?.removeEventListener('contextmenu', handleContextMenu);
			eleRef.current?.removeEventListener('mousedown', handleMouseDownEvent, {capture: true});
			eleRef.current?.removeEventListener('contextmenu', handleBluePrintContextMenu);
			
		};
	}, [thisGate, blockSize, ioRadius]);

	const heightMultiplier = useMemo(() => {
		return calculateGateHeight(thisGate);
	}, [inputs]);

	//When zooming, the old offset would make the gate teleport, so change the offset to the new position
	useEffect(() => {
		
		const multipliers = {x: (thisGate.position!.x - 2*MINIMAL_BLOCKSIZE) / prevSize.current, y: (thisGate.position!.y - 2*MINIMAL_BLOCKSIZE) / prevSize.current};
		const newPosition = {x: multipliers.x * blockSize + 2*MINIMAL_BLOCKSIZE, y: multipliers.y * blockSize + 2*MINIMAL_BLOCKSIZE};
		offsetRef.current.dx = newPosition.x;
		offsetRef.current.dy = newPosition.y;
		prevSize.current = blockSize;
	}, [blockSize]);
	

	return <>
	<CustomGateJSX 
		thisGate={thisGate} 
		eleRef={eleRef} 
		spanDivRef={spanDivRef} 
		spanRef={spanRef} 
		heightMultiplier={heightMultiplier}
		isBluePrint={isBluePrint}
	></CustomGateJSX>
	{isBluePrint && inputs.map(input => {
		return <Input binaryInput={input} key={input.id}></Input>
	})}
	{isBluePrint && outputs.map(output => {
		return <Output id={output.id} key={output.id}></Output>
	})}
	</>
}, (prev: CustomGateProps, next: CustomGateProps) => {
	if(prev.gateId !== next.gateId) {
		return false;
	};
	if(prev.isBluePrint !== next.isBluePrint) {
		return false;};
	return true;
});