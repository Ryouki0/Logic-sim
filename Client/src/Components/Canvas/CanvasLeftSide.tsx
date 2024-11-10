import React, { useEffect, useRef, useState } from 'react';
import { CANVASTOP_HEIGHT, CANVAS_HEIGHT, CANVAS_OFFSET_LEFT, CANVAS_WIDTH, DEFAULT_BORDER_WIDTH, MINIMAL_BLOCKSIZE,getClosestBlock } from '../../Constants/defaultDimensions';
import { Input } from '../IO/Input';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import {v4 as uuidv4} from 'uuid';
import GhostInput from '../IO/GhostInput';
import { throttle } from '../../utils/throttle';
import { BinaryIO } from '../../Interfaces/BinaryIO';
import { addInput, changeInputState } from '../../state/slices/entities';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_BORDER_COLOR } from '../../Constants/colors';
import { textStlye } from '../../Constants/commonStyles';
import { createSelector } from '@reduxjs/toolkit';

export function checkIo(prev:BinaryIO[],next:BinaryIO[]){
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
	const eleRef = useRef<HTMLDivElement | null>(null);
	const canvasHeight = useSelector((state: RootState) => {return state.misc.canvasHeight;});
 	
 	return <div style={{backgroundColor: DEFAULT_BACKGROUND_COLOR, 
 			width: 2*MINIMAL_BLOCKSIZE, 
 			position: 'absolute',
 			height: canvasHeight - CANVASTOP_HEIGHT,
		left: 0,
		bottom: 2*MINIMAL_BLOCKSIZE,
		borderStyle: 'solid',
		userSelect: 'none',
		borderColor: DEFAULT_BORDER_COLOR,
		borderWidth: DEFAULT_BORDER_WIDTH,
		borderBottom: 0,
 			zIndex: 2,
	}}
	ref={eleRef}
 		>
		<div style={{
			width: 2*MINIMAL_BLOCKSIZE - DEFAULT_BORDER_WIDTH,
			position: 'absolute',
			height: 2*DEFAULT_BORDER_WIDTH,
			left: -DEFAULT_BORDER_WIDTH,
			top: -2*DEFAULT_BORDER_WIDTH,
			borderColor: DEFAULT_BORDER_COLOR,
			borderLeftWidth: DEFAULT_BORDER_WIDTH,
			borderTop: 0,
			borderRight: 0,
			borderBottom: 0,
			borderStyle: 'solid',
			backgroundColor: DEFAULT_BACKGROUND_COLOR,
		}}></div>
		<div style={{
			position: 'absolute',
			top: canvasHeight + DEFAULT_BORDER_WIDTH - 2*MINIMAL_BLOCKSIZE - CANVASTOP_HEIGHT,
			background: `linear-gradient(${DEFAULT_BACKGROUND_COLOR}, rgb(140 140 140))`,
			height: 2*MINIMAL_BLOCKSIZE,
			width: 2*MINIMAL_BLOCKSIZE - 2*DEFAULT_BORDER_WIDTH,
		}}>

		</div>
 	</div>;
}