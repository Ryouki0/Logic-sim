import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { DEFAULT_INPUT_DIM, MINIMAL_BLOCKSIZE } from '../../Constants/defaultDimensions';
import { setHoveringOverIo } from '../../state/slices/mouseEvents';
import isOnIo from '../../utils/isOnIo';

export default function HoveringOverIO(){

	const io = useSelector((state: RootState) => {return state.entities.currentComponent.binaryIO;});
	const dispatch = useDispatch();
	const currentlyHoveringOverIo = useSelector((state: RootState) => {return state.mouseEventsSlice.hoveringOverIo;});
	const spanRef = useRef<HTMLSpanElement | null>(null);

	useEffect(() => {
		const ioEntries = Object.entries(io);

		const handleMouseMove = (e:MouseEvent) => {
			for(const [key, io] of ioEntries){
                
				if(isOnIo(e.x, e.y, io)){
					if(currentlyHoveringOverIo?.id === key){
						return;
					}
					dispatch(setHoveringOverIo(io));
					return;
				}
			}
			if(!currentlyHoveringOverIo) return;
			dispatch(setHoveringOverIo(null));
		};

		document.addEventListener('mousemove', handleMouseMove);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
		};
	}, [io, currentlyHoveringOverIo]);
   

	return <>
		{currentlyHoveringOverIo && 
        <span ref={spanRef}
        	style={{
        		fontSize: 20,
        		fontWeight: 400,
        		color: 'white', 
        		position: 'absolute', 
        		zIndex: 2, 
        		top: currentlyHoveringOverIo.position!.y - 1.5*MINIMAL_BLOCKSIZE,
        		left: currentlyHoveringOverIo.position!.x,
        		transform: 'translateX(-40%)'
        	}}>{currentlyHoveringOverIo.name}</span>}
	</>;
}