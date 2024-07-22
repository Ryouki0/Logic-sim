import React from 'react';
import { CANVAS_HEIGHT, CANVAS_WIDTH, DEFAULT_BORDER_WIDTH, DEFAULT_INPUT_DIM, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { getClosestBlock } from '../Constants/defaultDimensions';
import {v4 as uuidv4} from 'uuid';
import { Output } from './Output';
import { addGlobalOutput } from '../state/slices/entities';

export default function GlobalOutputs() {
	const outputs = useSelector((state: RootState) => {
		return Object.entries(state.entities.currentComponent.binaryIO).map(([key, io]) => {
			if(io.type === 'output' && !io.gateId){
				return io;
			}else{
				return null;
			}
		}).filter((io): io is NonNullable<typeof io> => io !== null);});
 	const dispatch = useDispatch();
 	const outputEntries = Object.entries(outputs);

 	const handleRightClick = (e:React.MouseEvent<HTMLDivElement, MouseEvent>) => {
 		e.preventDefault();
 		const {roundedX, roundedY} = getClosestBlock(e.pageX, e.pageY);
 		dispatch(addGlobalOutput(
 		 	{
 		 		state:0,
				type: 'output',
 		 		id: uuidv4(),
				parent: 'global',
				to: [],
				isGlobalIo: true,
 		 		position: {
 		 			x: CANVAS_WIDTH - MINIMAL_BLOCKSIZE,
 		 			y: roundedY
 		 		},
 		 		style: {
 		 			top: roundedY - DEFAULT_INPUT_DIM.height/2 - DEFAULT_BORDER_WIDTH, 
 		 			position:'absolute',
 		 			left: -DEFAULT_INPUT_DIM.height/2 - DEFAULT_BORDER_WIDTH
 		 		}
 			}
 		));
 	};

 	return <div 
 		style={{
 			width: MINIMAL_BLOCKSIZE,
 			height: CANVAS_HEIGHT,
 			zIndex: 1,
 			backgroundColor: 'rgb(100, 100, 100)',
 			position: 'absolute',
			borderWidth: DEFAULT_BORDER_WIDTH,
			borderColor: 'rgb(60 60 60)',
			borderStyle: 'solid',
			borderBottom: 0,
 			left: CANVAS_WIDTH - MINIMAL_BLOCKSIZE, 
 		}}
 		onContextMenu={e=> {handleRightClick(e);}}>
			<div style={{
				background: 'linear-gradient(rgb(100, 100, 100), rgb(140, 140, 140))',
				width: MINIMAL_BLOCKSIZE - 2*DEFAULT_BORDER_WIDTH,
				position: 'absolute',
				height: 2*MINIMAL_BLOCKSIZE,
				top: CANVAS_HEIGHT + DEFAULT_BORDER_WIDTH -2*MINIMAL_BLOCKSIZE
			}}>
			</div>
			<div style={{
				backgroundColor: 'rgb(100 100 100)',
				position: 'absolute',
				width: MINIMAL_BLOCKSIZE - 2*DEFAULT_BORDER_WIDTH,
				height: MINIMAL_BLOCKSIZE - 2*DEFAULT_BORDER_WIDTH,
				left: -DEFAULT_BORDER_WIDTH
			}}>

			</div>
 		{outputEntries.map(([key, output], idx, array) => {
 			return <Output output={output} style={output.style} key={output.id}></Output>;
 		})}
 	</div>;
}