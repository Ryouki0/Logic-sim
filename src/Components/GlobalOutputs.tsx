import React from 'react';
import { CANVAS_HEIGHT, CANVAS_WIDTH, DEFAULT_INPUT_DIM, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { getClosestBlock } from '../Constants/defaultDimensions';
import {v4 as uuidv4} from 'uuid';
import { Output } from './Output';
import { addGlobalOutput } from '../state/slices/entities';

export default function GlobalOutputs() {
	const outputs = useSelector((state: RootState) => {
		return Object.entries(state.entities.binaryIO).map(([key, io]) => {
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
 		 			top: roundedY - DEFAULT_INPUT_DIM.height/2, 
 		 			position:'absolute', 
 		 			left: -DEFAULT_INPUT_DIM.height/2
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
 			left: CANVAS_WIDTH - MINIMAL_BLOCKSIZE, 
 		}}
 		onContextMenu={e=> {handleRightClick(e);}}>
 		{outputEntries.map(([key, output], idx, array) => {
 			return <Output output={output} style={output.style} key={output.id}></Output>;
 		})}
 	</div>;
}