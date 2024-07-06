import React, { useEffect, useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import handleMouseDown from '../handleGateEvents';
import { Input } from './Input';
import { DEFAULT_INPUT_DIM, LINE_WIDTH, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import { BinaryInput } from '../Interfaces/BinaryInput';
import { Output } from './Output';
import { Gate } from '../Interfaces/Gate';
import { RootState } from '../state/store';
import {v4 as uuidv4} from 'uuid';
import './../gate.css';
import { calculateInputTop } from '../utils/calculateInputTop';
import { setSelectedEntity } from '../state/slices/mouseEventsSlice';
import { BinaryIO } from '../Interfaces/BinaryIO';
import { addGate, changeGatePosition, changeIOPosition, changeInputState, deleteComponent } from '../state/slices/entities';
import { text } from 'stream/consumers';
interface CustomGateProps{
    gateProps: Gate,
	preview: boolean,
	disableFunctionality?: boolean,
	position?: 'absolute' | 'relative'
}

function checkInputEquality(prev:BinaryIO[], next:BinaryIO[]){
	return prev?.length === next?.length;
}
function checkOutputEquality(prev: BinaryIO[], next: BinaryIO[]){
	let isEqual = true;
	prev?.forEach((prev,idx,array) => {
		if(prev?.state !== next[idx]?.state){
			isEqual = false;
		}
	});
	return isEqual;
	
}
function checkGateEquality(prev: Gate, next: Gate){
	if(!prev || !next){
		return true;
	}
	
	return prev.position?.x === next.position?.x && prev.position?.y === next.position?.y;
}

function CustomGate({gateProps, preview, position, disableFunctionality}:CustomGateProps){
	const eleRef = React.useRef<HTMLDivElement>(null);
	const dispatch = useDispatch();
	
	const thisGate = useSelector((state: RootState) => {return state.entities.gates[gateProps.id];}, checkGateEquality);
    
	const offsetRef = useRef({dx: 
		thisGate?.position ? thisGate.position.x : 0, 
	dy: thisGate?.position ? thisGate.position.y : 0});

	const setOffset = (dx:number, dy:number) => {
		offsetRef.current = {...offsetRef.current, dx: dx, dy: dy};
	};

	const inputs = useSelector((state: RootState) => {
		if(preview){
			return gateProps.inputs.map(inputId => {
				return state.entities.bluePrints.io[inputId];
			})
		}else{
			return gateProps.inputs.map(input => {
				return state.entities.binaryIO[input];
			});
		}
		
	}, checkInputEquality);

	const outputs = useSelector((state: RootState) => {
		if(preview){
			return gateProps.outputs.map(outputId => {
				return state.entities.bluePrints.io[outputId];
			})
		}else{
			return gateProps.outputs.map(outputId => {
				return state.entities.binaryIO[outputId];
			});
		}
		
	}, checkOutputEquality);
	const inputLength = gateProps.inputs.length;
	const outputLength = gateProps.outputs.length;

	function setPositions(x: number, y: number){
		//console.log(`gateProps.position changing: ${thisGate?.position?.x} ${thisGate?.position?.y}`)
		
		inputs.forEach((input,idx,array)=> {
			
			dispatch(changeIOPosition({id: input.id, position:{
				x:x, 
				y:y + (calculateInputTop(idx, array.length) + DEFAULT_INPUT_DIM.height/2 + idx*DEFAULT_INPUT_DIM.height)}} ))
		})
		outputs.forEach((output,idx,array) => {
			dispatch(changeIOPosition({
				id: output.id,
				position: {
					x:x + 3*MINIMAL_BLOCKSIZE,
					y:y + calculateInputTop(idx, array.length) + (idx*DEFAULT_INPUT_DIM.height) +DEFAULT_INPUT_DIM.height/2,
				}
			}))
		})
		dispatch(changeGatePosition({gate: thisGate, position: {x: x,y: y}}));
	};

	
	const calculateDivHeight = () => {
		const longest = inputLength > outputLength ? inputLength : outputLength;
		if(inputLength <= 1 && outputLength <= 1){
			return 2*MINIMAL_BLOCKSIZE + LINE_WIDTH;
		}
		return longest % 2 === 0 ? (longest * MINIMAL_BLOCKSIZE) + LINE_WIDTH : ((longest-1) * MINIMAL_BLOCKSIZE) +LINE_WIDTH;
	};

	const print = () => {
		
	};

	const handlePreviewMouseDown = () => {
		dispatch(addGate({...gateProps, position: {
			x: eleRef.current?.getBoundingClientRect() ? eleRef.current.getBoundingClientRect().x : 0,
			y: eleRef.current?.getBoundingClientRect() ? eleRef.current.getBoundingClientRect().y : 0,
		}}));
		
		console.log('created gate');
	};

	return	(
		<>
			{/*console.log('RENDER CUSTOMGATE ')*/}
			<div ref={eleRef} 
				className='Gate-container'
				style={{width: 3*MINIMAL_BLOCKSIZE, 
					height: calculateDivHeight(),
					position: position ? position : 'relative',
					top: thisGate?.position ? thisGate.position.y : 0,
					left: thisGate?.position ? thisGate.position.x : 0,
					borderTopRightRadius: 30,
					borderBottomRightRadius: 30,
					display: 'inline-block',
					justifySelf: 'center',
					cursor: 'pointer',
					backgroundColor: "rgb(100 100 100)"}} 
				id={gateProps.id}
				onContextMenu={e => {
					e.preventDefault();
					e.stopPropagation();
					dispatch(deleteComponent(thisGate.id))}}
				onMouseEnter={e => {if(preview){
					e.stopPropagation();
					print();
					handlePreviewMouseDown();
				}}}
			
				onMouseDown={e => {if(preview){ }
				else{
					e.stopPropagation();
					dispatch(setSelectedEntity({type: 'Gate', entity: gateProps}));

					handleMouseDown(e, eleRef, dispatch, offsetRef.current.dx, offsetRef.current.dy, setOffset, setPositions);
				}}}
			>
				{inputs.map((input, idx, array) => {
					return <Input binaryInput={{...input, 
						style: {
							top: calculateInputTop(idx, array.length)
						}}} 
						gateId={gateProps.id} 
						key={input?.id}></Input>;
				})}
				<div 
				style={{
					position: "absolute", 
					left: "50%", 
					top: "50%", 
					transform: "translate(-50%, -50%)"
				}}> 
					<span style={{fontSize: 23, 
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