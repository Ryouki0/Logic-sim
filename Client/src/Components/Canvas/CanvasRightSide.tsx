import React, { useState } from 'react';
import { CANVASTOP_HEIGHT, DEFAULT_BORDER_WIDTH, MINIMAL_BLOCKSIZE } from '../../Constants/defaultDimensions';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_BORDER_COLOR } from '../../Constants/colors';
export default function GlobalOutputs() {
	const canvasHeight = useSelector((state: RootState) => {return state.misc.canvasHeight;});

 	return <div 
 		style={{
 			width: 2*MINIMAL_BLOCKSIZE,
 			height: canvasHeight,
 			zIndex: 1,
			display: 'inline-block',
			marginBottom: 0,
 			backgroundColor: DEFAULT_BACKGROUND_COLOR,
			borderWidth: DEFAULT_BORDER_WIDTH,
			borderColor: DEFAULT_BORDER_COLOR,
			borderStyle: 'solid',
			borderBottom: 0,
 		}}>
		<div style={{
			backgroundColor: DEFAULT_BACKGROUND_COLOR,
			width: 2*MINIMAL_BLOCKSIZE - 2*DEFAULT_BORDER_WIDTH,
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
 		
 	</div>;
}