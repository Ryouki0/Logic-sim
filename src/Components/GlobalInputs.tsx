import React, { useEffect, useRef, useState } from 'react';
import { CANVAS_HEIGHT, CANVAS_OFFSET_LEFT, CANVAS_WIDTH, DEFAULT_BORDER_WIDTH, DEFAULT_INPUT_DIM, MINIMAL_BLOCKSIZE,getClosestBlock } from '../Constants/defaultDimensions';
import { Input } from './Input';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import {v4 as uuidv4} from 'uuid';
import GhostInput from './GhostInput';
import { throttle } from '../utils/throttle';
import { BinaryIO } from '../Interfaces/BinaryIO';
import { addInput, changeInputState } from '../state/slices/entities';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_BORDER_COLOR } from '../Constants/colors';

function checkInputs(prev:BinaryIO[],next:BinaryIO[]){
	if(prev?.length !== next?.length){
		return false;
	}
	for(const [idx, io] of prev.entries()){
		if((io.state !== next[idx].state) || (io.id !== next[idx].id)){
			return false;
		}
	}
	return true;
}
export default function GlobalInputs(){
	const currentInputsRef = useRef<HTMLDivElement | null>(null);
	const [pointerEvents, setPointerEvents] = useState<'auto' | 'none'>('auto');
	const currentComponentId = useSelector((state: RootState) => {return state.misc.currentComponentId});
	const inputs = useSelector((state: RootState) => {
		return Object.entries(state.entities.currentComponent.binaryIO).map(([key, io]) => 
		{
			if((io.type === 'input' && !io.gateId) || (io.type === 'input' && io.gateId === currentComponentId)){
				return io;
			}else{
				return null;
			}
		})
			.filter((io): io is NonNullable<typeof io> => io !== null);
	}, checkInputs);
	const eleRef = useRef<HTMLDivElement | null>(null);
 	const [ghostInputPosition, setGhostInputPosition] = useState({x:0,y:0});
 	const [showGhostInput,setShowGhostInput] = useState(false);
 	const dispatch = useDispatch();
 	const handleRightClick = (e: MouseEvent) => {
 		e.preventDefault();
 		const {roundedX, roundedY} = getClosestBlock(e.pageX, e.pageY);
 		dispatch(addInput({
 			state: 0,
 			id: uuidv4(),
			type: 'input',
			parent: 'global',
			name: `input ${inputs.length + 1}`,
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
				if(showGhostInput){
					setShowGhostInput(false);
				}
 				return;
 			}
 		}
		if(!showGhostInput){
			setShowGhostInput(true);
		}
		if(ghostInputPosition.y !== roundedY){
			setGhostInputPosition({x:2*MINIMAL_BLOCKSIZE, y: roundedY});
		}
 	}, 16);

	const handleMouseLeave = (e: MouseEvent) => {
		setShowGhostInput(false);
	};

	useEffect(() => {
		eleRef.current?.addEventListener('contextmenu', handleRightClick);
		eleRef.current?.addEventListener('mousemove', throttledMouseMove);
		eleRef.current?.addEventListener('mouseleave', handleMouseLeave);

		return () => {
			eleRef.current?.removeEventListener('contextmenu', handleRightClick);
			eleRef.current?.removeEventListener('mousemove', throttledMouseMove);
			eleRef.current?.removeEventListener('mouseleave', handleMouseLeave);
		};
	}, [ghostInputPosition, showGhostInput, pointerEvents]);

 	return <div id='current-inputs'
 		style={{backgroundColor: 'rgb(70 70 70)', 
 			width: 2*MINIMAL_BLOCKSIZE, 
 			height: CANVAS_HEIGHT,
 			position: 'absolute',
			borderStyle: 'solid',
			userSelect: 'none',
			borderColor: DEFAULT_BORDER_COLOR,
			borderWidth: DEFAULT_BORDER_WIDTH,
			borderBottom: 0,
 			zIndex: 1,
 			marginLeft: CANVAS_OFFSET_LEFT
		}}
		ref={eleRef}
 		>
		<div style={{
			position: 'absolute',
			width: 2*MINIMAL_BLOCKSIZE,
			height: MINIMAL_BLOCKSIZE - 2*DEFAULT_BORDER_WIDTH,
			top: 0,
			left: -DEFAULT_BORDER_WIDTH,
			borderColor: DEFAULT_BORDER_COLOR,
			borderLeftWidth: DEFAULT_BORDER_WIDTH,
			borderTop: 0,
			borderRight: 0,
			borderBottom: 0,
			borderStyle: 'solid',
			backgroundColor: DEFAULT_BACKGROUND_COLOR,
			zIndex: 0,
		}}></div>
		<div style={{
			position: 'absolute',
			top: CANVAS_HEIGHT + DEFAULT_BORDER_WIDTH - 2*MINIMAL_BLOCKSIZE,
			background: `linear-gradient(${DEFAULT_BACKGROUND_COLOR}, rgb(140 140 140))`,
			height: 2*MINIMAL_BLOCKSIZE,
			width: 2*MINIMAL_BLOCKSIZE - 2*DEFAULT_BORDER_WIDTH,

		}}>

		</div>
 		{inputs.map(( input, idx) => {
 			return (
 				<div key={uuidv4()} style={{
					alignItems: 'center', 
					justifyContent: 'center', 
					position: 'absolute', 
					userSelect: 'none', 
					zIndex: 1}}
				>
 					<Input binaryInput={{
						...input,
						style: {
							top: (input.style?.top as number) - DEFAULT_BORDER_WIDTH, 
							position: 'relative', 
							left: 2*MINIMAL_BLOCKSIZE - (DEFAULT_INPUT_DIM.width/2) - (1*DEFAULT_BORDER_WIDTH)}, 
					}}
 					></Input>
 					{currentComponentId === 'global' && <button style={{
						top: input.style?.top, 
						
						position: 'absolute',
						alignSelf:'center', 
						borderRadius: 10,
						borderWidth: 0, 
						userSelect: 'none'
					}} onClick={e => {
						e.preventDefault();
						dispatch(changeInputState(input.id));}}>
 						{input.state ? 'ON' : 'OFF'}
 					</button>}
 				</div>
 			);
 		})}
 		{showGhostInput && <GhostInput x={ghostInputPosition.x} y={ghostInputPosition.y}></GhostInput>}
 	</div>;
}