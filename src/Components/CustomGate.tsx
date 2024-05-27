import React, { useEffect, useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import handleMouseDown from '../handleGateEvents';
import { Input } from './Input';
import { DEFAULT_INPUT_DIM, LINE_WIDTH, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import { BinaryInput } from '../Interfaces/BinaryInput';
import { Output } from './Output';
import { Gate } from '../Interfaces/Gate';
import { addGate, changeGate, changeInputPosition, removeGate } from '../state/objectsSlice';
import { RootState } from '../state/store';
import {v4 as uuidv4} from 'uuid';
import './../gate.css';
import { calculateInputTop } from '../utils/calculateInputTop';
import { BinaryOutput } from '../Interfaces/BinaryOutput';
import allGates from '../state/allGates';
interface CustomGateProps{
    gateProps: Gate,
	preview: boolean,
	position?: 'absolute' | 'relative'
}

function checkInputEquality(prev:BinaryInput[], next:BinaryInput[]){
	
}

function checkGateEquality(prev: Gate, next: Gate){
	if(!prev || !next){
		return true;
	}
	
	return prev.position?.x === next.position?.x && prev.position?.y === next.position?.y;
}

function CustomGate({gateProps, preview, position}:CustomGateProps){
	const eleRef = React.useRef<HTMLDivElement>(null);
	const dispatch = useDispatch();
	
	const thisGate = useSelector((state: RootState) => {return state.objectsSlice.gates[gateProps.id]}, checkGateEquality);
    
	const offsetRef = useRef({dx: 
		thisGate?.position ? thisGate.position.x : 0, 
	dy: thisGate?.position ? thisGate.position.y : 0});

	const setOffset = (dx:number, dy:number) => {
		offsetRef.current = {...offsetRef.current, dx: dx, dy: dy};
	};

	const inputs = useSelector((state: RootState) => {
		if(!preview){
			return state.objectsSlice.gates[gateProps.id].inputs;
		}else{
			const index = state.allGatesSlice.findIndex(g => g.id === gateProps.id);
			return state.allGatesSlice[index]?.inputs;
		}
		
	});
	const inputLength = Object.entries(inputs).length;

	const outputs = gateProps.outputs;
	const outputLength = Object.entries(outputs).length;
	

	function setPositions(x: number, y: number){
		//console.log(`gateProps.position changing: ${thisGate?.position?.x} ${thisGate?.position?.y}`);
		dispatch(changeInputPosition({x: x,y:y, gateId: thisGate.id}));
		dispatch(changeGate({gate: thisGate, newPos: {x: x,y: y}}));
	};

	
	const calculateDivHeight = () => {
		if(inputLength <= 1 && Object.entries(outputs).length <= 1){
			return 2*MINIMAL_BLOCKSIZE + LINE_WIDTH;
		}
		return inputLength % 2 === 0 ? (inputLength * MINIMAL_BLOCKSIZE) + LINE_WIDTH : ((inputLength-1) * MINIMAL_BLOCKSIZE) +LINE_WIDTH;
	};


	const handlePreviewMouseDown = () => {
		const newInputs:{[key: string]:BinaryInput} = {};
		for(var i=0;i<inputLength;i++){
			const id = uuidv4();
			newInputs[id] = ({state: 0, id: id, gateId: gateProps.id});
		};
		const newOutputs:{[key:string]: BinaryOutput} = {};
		for(var i =0;i<outputLength;i++){
			const id = uuidv4();
			newOutputs[id] = ({state: 0, id: id, gateId:gateProps.id});
		}
		dispatch(addGate({...gateProps,
			inputs: newInputs,
			outputs: newOutputs,
			id: uuidv4(), position: {
				x: eleRef.current?.getBoundingClientRect().x ? eleRef.current.getBoundingClientRect().x : 0, 
				y: eleRef.current?.getBoundingClientRect().y ? eleRef.current.getBoundingClientRect().y : 0
			}}));
		//console.log('created gate');
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
				onContextMenu={e => {e.stopPropagation(); e.preventDefault();dispatch(removeGate(gateProps.id));}}
				onMouseEnter={e => {if(preview){
					e.stopPropagation(); 
					handlePreviewMouseDown();
				}}}
			
				onMouseDown={e => {if(preview){ }
				else{
					console.log(`thisgate ID: ${thisGate.id}`);
					handleMouseDown(e, eleRef, dispatch, offsetRef.current.dx, offsetRef.current.dy, setOffset, setPositions);
				}}}
			>
				{Object.entries(inputs)?.map(([key, input], idx, array) => {
					return <Input binaryInput={{style: {
						top: calculateInputTop(idx, array.length),
						cursor: 'default'},
					state: input.state, id: input.id,
					gateId: gateProps.id}} gateId={gateProps.id} inputIdx={idx} key={input.id}></Input>;
				})}
				<div style={{position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)"}}> 
					<span
						key={gateProps.id}
						style={{color: 'white', cursor: "drag", userSelect: 'none', fontSize: 22, fontWeight: 500}} 
						onMouseDown={e => { e.stopPropagation();
							preview ? handlePreviewMouseDown()
								: handleMouseDown(e, eleRef, dispatch, offsetRef.current.dx, offsetRef.current.dy, setOffset, setPositions);
						}}
					>{gateProps.name}</span>
				</div>
				{Object.entries(outputs).map(([key, output], idx, array) => {
					return <Output style={{position: 'absolute', left:
                        (3*MINIMAL_BLOCKSIZE)-DEFAULT_INPUT_DIM.width/2,
					top:calculateInputTop(idx, array.length),
					cursor: 'default'}} output={{state: 0, id: output.id, gateId: gateProps.id}} key={output.id}></Output>;
				})}
			</div>
		</>
	);
}
export {CustomGate};