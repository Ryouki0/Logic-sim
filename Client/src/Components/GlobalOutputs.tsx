import React from 'react';
import { CANVASTOP_HEIGHT, DEFAULT_BORDER_WIDTH, DEFAULT_INPUT_DIM, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { getClosestBlock } from '../Constants/defaultDimensions';
import {v4 as uuidv4} from 'uuid';
import { Output } from './Output';
import { addGlobalOutput } from '../state/slices/entities';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_BORDER_COLOR } from '../Constants/colors';
import { checkIo } from './GlobalInputs';

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
 	const outputEntries = Object.entries(outputs);

	const canvasWidth = useSelector((state: RootState) => {return state.misc.canvasWidth});
	const canvasHeight = useSelector((state: RootState) => {return state.misc.canvasHeight});

 	const handleRightClick = (e:React.MouseEvent<HTMLDivElement, MouseEvent>) => {
 		e.preventDefault();
 		const {roundedX, roundedY} = getClosestBlock(e.pageX, e.pageY);
 		dispatch(addGlobalOutput(
 		 	{
 		 		state:0,
				type: 'output',
 		 		id: uuidv4(),
				parent: 'global',
				name: 'output 1',
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
 	</div>;
}