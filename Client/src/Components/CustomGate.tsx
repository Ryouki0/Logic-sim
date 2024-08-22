import React, { useEffect, useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import handleMouseDown from '../handleGateEvents';
import { Input } from './Input';
import { DEFAULT_INPUT_DIM, LINE_WIDTH, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import { Output } from './Output';
import { Gate } from '../Interfaces/Gate';
import { RootState } from '../state/store';
import './../gate.css';
import { calculateInputTop } from '../utils/Spatial/calculateInputTop';
import { setSelectedEntity } from '../state/slices/mouseEvents';
import { BinaryIO } from '../Interfaces/BinaryIO';
import { createSelector } from '@reduxjs/toolkit';
import { addGate, changeGatePosition, changeIOPosition, changeInputState, deleteComponent } from '../state/slices/entities';
import calculateGateHeight from '../utils/Spatial/calculateGateHeight';
interface CustomGateProps{
    gateProps: Gate,
	isBluePrint: boolean,
	disableFunctionality?: boolean,
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

function CustomGate({gateProps, isBluePrint, position, disableFunctionality}:CustomGateProps){
	const eleRef = useRef<HTMLDivElement>(null);
	const spanRef = useRef<HTMLSpanElement>(null);
	const dispatch = useDispatch();
	
	const thisGate = useSelector((state: RootState) => {
		if(isBluePrint){
			return state.entities.bluePrints.gates[gateProps.id];
		}
		return state.entities.gates[gateProps.id] ?? 
		state.entities.currentComponent.gates[gateProps.id];}, checkGateEquality);
    
	const offsetRef = useRef({dx: 
		thisGate?.position ? thisGate.position.x : 0, 
	dy: thisGate?.position ? thisGate.position.y : 0});

	const setOffset = (dx:number, dy:number) => {
		offsetRef.current = {...offsetRef.current, dx: dx, dy: dy};
	};

	const inputs = useSelector((state: RootState) => {
		if(isBluePrint){
			return gateProps.inputs.map(inputId => {
				return state.entities.bluePrints.io[inputId];
			});

		}else{
			return gateProps.inputs.map(input => {
				return state.entities.binaryIO[input] ?? state.entities.currentComponent.binaryIO[input];
			});
		}
	}, () => true);

	const outputs = useSelector((state: RootState) => {
		if(isBluePrint){
			return gateProps.outputs.map(outputId => {
				return state.entities.bluePrints.io[outputId];
			});
		}else{
			return gateProps.outputs.map(outputId => {
				return state.entities.binaryIO[outputId] ?? state.entities.currentComponent.binaryIO[outputId];
			});
		}
	}, () => true);

	function setPositions(x: number, y: number){
		dispatch(changeGatePosition({gate: thisGate, position: {x: x,y: y}}));
	};

	const handleMouseDownEvent = (e: MouseEvent) => {
		if(e.target !== eleRef.current && e.target !== spanRef.current) return;
		if(e.button !== 0) return;
		if(!isBluePrint){
			e.preventDefault();
			dispatch(setSelectedEntity({ type: 'Gate', entity: thisGate }));
			handleMouseDown(e as any, eleRef, dispatch, offsetRef.current.dx, offsetRef.current.dy, setOffset, setPositions);
		}
	  };

	const handleContextMenu = (e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dispatch(deleteComponent(thisGate.id));
	};

	const handleBluePrintContextMenu = (e:MouseEvent) => {
		e.preventDefault();
		
	};
	useEffect(() => {
		if(!isBluePrint){
			eleRef.current?.addEventListener('contextmenu', handleContextMenu);
			eleRef.current?.addEventListener('mousedown', handleMouseDownEvent);
		}else{
			eleRef.current?.addEventListener('contextmenu', handleBluePrintContextMenu);
		}

		return () => {
			eleRef.current?.removeEventListener('contextmenu', handleContextMenu);
			eleRef.current?.removeEventListener('mousedown', handleMouseDownEvent);
			eleRef.current?.removeEventListener('contextmenu', handleBluePrintContextMenu);
			
		};
	}, [inputs, outputs, thisGate]);

	return	(
		<>
			{/* {console.log(`rendering customgate: ${thisGate?.id.slice(0,6)}`)} */}
			<div ref={eleRef}
				className='Gate-container'
				style={{width: 3*MINIMAL_BLOCKSIZE, 
					height: calculateGateHeight(thisGate),
					position: position ? position : 'relative',
					top: thisGate?.position ? thisGate.position.y : 0,
					left: thisGate?.position ? thisGate.position.x : 0,
					borderTopRightRadius: 30,
					borderBottomRightRadius: 30,
					display: 'inline-block',
					justifySelf: 'center',
					cursor: 'pointer',
					backgroundColor: "rgb(117 117 117)"}} 
				id={gateProps.id}
			>
				{inputs?.map((input, idx, array) => {
					return <Input binaryInput={{...input, 
						style: {
							top: calculateInputTop(idx, array.length)
						}}} 
					key={input?.id}></Input>;
				})}
				<div 
					style={{
						position: "absolute", 
						left: "50%", 
						top: "50%", 
						transform: "translate(-50%, -50%)"
					}}> 
					<span ref={spanRef}
						style={{fontSize: MINIMAL_BLOCKSIZE/2 +4, 
        				userSelect: 'none', 
				        color: 'white'}}>
						{gateProps.name}
					</span>
				</div>
				{outputs.map((output,idx,array) => {
					return <Output output={output} style={
						{
							top: calculateInputTop(idx, array.length) + (idx*DEFAULT_INPUT_DIM.height),
							position:'absolute',
							left:3*MINIMAL_BLOCKSIZE - DEFAULT_INPUT_DIM.height/2}} key={output?.id}></Output>;
				})}
			</div>
		</>
	);
}
export {CustomGate};