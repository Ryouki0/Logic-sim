import React, { useEffect, useRef, useState } from 'react';
import { CANVAS_HEIGHT, CANVAS_OFFSET_LEFT, CANVAS_WIDTH, DEFAULT_INPUT_DIM, MINIMAL_BLOCKSIZE,getClosestBlock } from '../Constants/defaultDimensions';
import { BinaryInput } from '../Interfaces/BinaryInput';
import { Input } from './Input';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import {v4 as uuidv4} from 'uuid';
import GhostInput from './GhostInput';
import { throttle } from '../utils/throttle';
import { BinaryIO } from '../Interfaces/BinaryIO';
import { addInput, changeInputState } from '../state/slices/entities';

function checkInputs(prev:BinaryIO[],next:BinaryIO[]){
	return prev?.length === next?.length;
}
export default function GlobalInputs(){
	const currentInputsRef = useRef<HTMLDivElement | null>(null);
	const inputs = useSelector((state: RootState) => {
		return Object.entries(state.entities.binaryIO).map(([key, io]) => 
		{
			if(io.type === 'input' && !io.gateId){
				return io;
			}else{
				return null;
			}
		})
			.filter((io): io is NonNullable<typeof io> => io !== null);
	}, checkInputs);
 	const [{x, y}, setGhostInputPosition] = useState({x:0,y:0});
 	const [showGhostInput,setShowGhostInput] = useState(false);
 	const dispatch = useDispatch();
 	const handleRightClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
 		e.preventDefault();
 		const {roundedX, roundedY} = getClosestBlock(e.pageX, e.pageY);
 		dispatch(addInput({
 			state: 0,
 			id: uuidv4(),
			type: 'input',
			parent: 'global',
			to: [],
			isGlobalIo: true,
 			style: {top: roundedY - DEFAULT_INPUT_DIM.height/2},
 			position: {x: 2*MINIMAL_BLOCKSIZE, y: roundedY}
 		} as BinaryIO));
 	};

	
 	const throttledMouseMove = throttle((e:React.MouseEvent<HTMLDivElement, MouseEvent>) => {
 		const inputEntries = Object.entries(inputs);
 		const {roundedX, roundedY} = getClosestBlock(e.pageX, e.pageY);
 		for(const [key, input] of inputEntries){
 			if(input?.position?.y === roundedY){
 				setShowGhostInput(false);
 				return;
 			}
 		}
 		setShowGhostInput(true);
 		setGhostInputPosition({x:2*MINIMAL_BLOCKSIZE, y: roundedY});
 	}, 16);
 	return <div id='current-inputs'
 		style={{backgroundColor: 'rgb(80 80 80)', 
 			width: 2*MINIMAL_BLOCKSIZE, 
 			height: CANVAS_HEIGHT, 
 			position: 'absolute',
 			zIndex: 1,
 			marginLeft: CANVAS_OFFSET_LEFT}}
 		onContextMenu={handleRightClick}
 		onMouseLeave={e => setShowGhostInput(false)}
 		onMouseMove={e => {throttledMouseMove(e);}}
 		ref = {currentInputsRef}>
 		{inputs.map(( input, idx) => {
 			return (
 				<div key={uuidv4()} style={{alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
 					<Input binaryInput={{...input,
						style: {top: input.style?.top, position: 'absolute', left: 2*MINIMAL_BLOCKSIZE - (DEFAULT_INPUT_DIM.width/2)}, }} 
 					></Input>
 					<button style={{
						top: input.style?.top, 
						marginTop:3,
						position: 'absolute',
						alignSelf:'center', 
						borderRadius: 10, 
						borderWidth: 0, 
						userSelect: 'none'
					}} onClick={e => dispatch(changeInputState(input.id))}>
 						{input.state ? 'ON' : 'OFF'}
 					</button>
 				</div>
 			);
 		})}
 		{showGhostInput && <GhostInput x={x} y={y}></GhostInput>}
 	</div>;
}