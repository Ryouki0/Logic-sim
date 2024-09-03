import React, { useState } from 'react';
import { CANVASTOP_HEIGHT, DEFAULT_BORDER_WIDTH, DEFAULT_INPUT_DIM, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { getClosestBlock } from '../Constants/defaultDimensions';
import {v4 as uuidv4} from 'uuid';
import { Output } from './Output';
import { addGlobalOutput } from '../state/slices/entities';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_BORDER_COLOR } from '../Constants/colors';
import { checkIo } from './GlobalInputs';
import { throttle } from '../utils/throttle';
import GhostInput from './GhostInput';

export default function GlobalOutputs() {
	const currentComponentId = useSelector((state: RootState) => {return state.misc.currentComponentId;});
	const outputs = useSelector((state: RootState) => {
		return Object.entries(state.entities.currentComponent.binaryIO).map(([key, io]) => {
			if((io.type === 'output' && !io.gateId) || (io.type === 'output' && io.gateId === currentComponentId)){
				return io;
			}else{
				return null;
			}
		}).filter((io): io is NonNullable<typeof io> => io !== null);}, checkIo);
 	const dispatch = useDispatch();
	const [showGhostOutput, setShowGhostOutput] = useState(false);
	const [ghostOutputPosition, setGhostOutputPosition] = useState<{x: number, y:number}>({x: 0, y:0});
 	const outputEntries = Object.entries(outputs);

	const canvasWidth = useSelector((state: RootState) => {return state.misc.canvasWidth;});
	const canvasHeight = useSelector((state: RootState) => {return state.misc.canvasHeight;});

	const throttledMouseMove = throttle((e:React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		const {roundedX, roundedY} = getClosestBlock(e.pageX, e.pageY);
		if(roundedY < CANVASTOP_HEIGHT){
			return;
		}
 		const outputEntries = Object.entries(outputs);
 		for(const [key, output] of outputEntries){
 			if(output?.position?.y === roundedY){
				if(showGhostOutput){
					setShowGhostOutput(false);
				}
 				return;
 			}
 		}
		if(!showGhostOutput){
			setShowGhostOutput(true);
		}
		if(ghostOutputPosition.y !== roundedY){
			setGhostOutputPosition({x:2*MINIMAL_BLOCKSIZE, y: roundedY + DEFAULT_BORDER_WIDTH});
		}
 	}, 16);


 	const handleRightClick = (e:React.MouseEvent<HTMLDivElement, MouseEvent>) => {
 		e.preventDefault();
 		const {roundedX, roundedY} = getClosestBlock(e.pageX, e.pageY);
 		dispatch(addGlobalOutput(
 		 	{
 		 		state:0,
				type: 'output',
 		 		id: uuidv4(),
				parent: 'global',
				name: `output ${outputs.length + 1}`,
				to: [],
				isGlobalIo: true,
 		 		position: {
 		 			x: canvasWidth - MINIMAL_BLOCKSIZE,
 		 			y: roundedY
 		 		},
 		 		style: {
 		 			top: roundedY - DEFAULT_INPUT_DIM.height/2,
					position: 'absolute',
 		 			left: (-DEFAULT_INPUT_DIM.height/2 - DEFAULT_BORDER_WIDTH) + canvasWidth - MINIMAL_BLOCKSIZE + DEFAULT_BORDER_WIDTH
 		 		}
 			}
 		));
 	};

 	return <div 
 		style={{
 			width: MINIMAL_BLOCKSIZE,
 			height: canvasHeight,
 			zIndex: 0,
			display: 'inline-block',
			marginBottom: 0,
 			backgroundColor: DEFAULT_BACKGROUND_COLOR,
			borderWidth: DEFAULT_BORDER_WIDTH,
			borderColor: DEFAULT_BORDER_COLOR,
			borderStyle: 'solid',
			borderBottom: 0,
 		}}
		onMouseLeave={e => setShowGhostOutput(false)}
		onMouseMove={e => {throttledMouseMove(e);}}
 		onContextMenu={e=> {handleRightClick(e);}}>
		<div style={{
			background: `linear-gradient(${DEFAULT_BACKGROUND_COLOR}, rgb(140, 140, 140))`,
			width: MINIMAL_BLOCKSIZE - 2*DEFAULT_BORDER_WIDTH,
			position: 'absolute',
			height: 2*MINIMAL_BLOCKSIZE,
			top: canvasHeight + DEFAULT_BORDER_WIDTH -2*MINIMAL_BLOCKSIZE
		}}>
		</div>
		<div style={{
			backgroundColor: DEFAULT_BACKGROUND_COLOR,
			position: 'absolute',
			width: MINIMAL_BLOCKSIZE - 2*DEFAULT_BORDER_WIDTH,
			height: CANVASTOP_HEIGHT - 2*DEFAULT_BORDER_WIDTH,
			left: -DEFAULT_BORDER_WIDTH
		}}>

		</div>
 		{outputEntries.map(([key, output], idx, array) => {
 			return <Output output={output} style={output.style} key={output.id}></Output>;
 		})}
		{showGhostOutput && <GhostInput x={ghostOutputPosition.x} y={ghostOutputPosition.y} type='output'></GhostInput>}
 	</div>;
}