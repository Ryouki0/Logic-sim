import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { DEFAULT_BORDER_WIDTH, DEFAULT_INPUT_DIM, MINIMAL_BLOCKSIZE } from '../../Constants/defaultDimensions';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';

export default function GhostInput({x, y, type}: {x:number, y:number, type: 'input' | 'output'}) {
	const canvasWidth = useSelector((state: RootState) => {return state.misc.canvasWidth;});
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize;});

	const getLeftPos = () => {
		if(type === 'input'){
			return x-(DEFAULT_INPUT_DIM.width/2) - DEFAULT_BORDER_WIDTH;
		}else{
			return canvasWidth - MINIMAL_BLOCKSIZE  - (DEFAULT_INPUT_DIM.width/2);
		}
	};

	return <div style={{
		width: DEFAULT_INPUT_DIM.width, 
		height: DEFAULT_INPUT_DIM.width, 
		position: 'absolute',
		left: getLeftPos(),
		top: y-(DEFAULT_INPUT_DIM.width / 2) - DEFAULT_BORDER_WIDTH}}>
		<CircularProgressbar value={100} background={true} styles={buildStyles(
			{pathColor: 'grey', backgroundColor: 'grey'}
		)}></CircularProgressbar>
	</div>;
}