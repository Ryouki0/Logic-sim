import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { setHoveringOverIo, setSelectedEntity } from '../../state/slices/mouseEvents';
import isOnIo from '../../utils/Spatial/isOnIo';
import { BinaryIO } from '../../Interfaces/BinaryIO';

export default function HoveringOverIO(){

	const io = useSelector((state: RootState) => {return state.entities.currentComponent.binaryIO;});
	const dispatch = useDispatch();
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize;});
	const currentlyHoveringOverIo = useSelector((state: RootState) => {return state.mouseEventsSlice.hoveringOverIo;});
	const currentComponent = useSelector((state: RootState) => {return state.misc.currentComponentId;});
	const spanRef = useRef<HTMLSpanElement | null>(null);
    const ioRadius = useSelector((state: RootState) => {return state.misc.ioRadius});
	const cameraOffset = useSelector((state: RootState) => {return state.mouseEventsSlice.cameraOffset});
	useEffect(() => {
		const ioEntries = Object.entries(io);

		const handleMouseMove = (e:MouseEvent) => {
			for(const [key, io] of ioEntries){
                
				if(isOnIo(e.x, e.y, io, cameraOffset, ioRadius)){
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

		const handleMouseDown = (e:MouseEvent) => {
			for(const [key, io] of ioEntries){
                
				if(isOnIo(e.x, e.y, io, cameraOffset, ioRadius)){
					dispatch(setSelectedEntity({entity: io, type: 'BinaryIO'}));
					return;
				}
			}
		};
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mousedown', handleMouseDown);
		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mousedown', handleMouseDown);
		};
	}, [io, currentlyHoveringOverIo, cameraOffset]);
   

	return <>
		{currentlyHoveringOverIo && 
        <span ref={spanRef}
        	style={{
        		fontSize: 20,
        		fontWeight: 400,
        		color: 'white', 
        		position: 'absolute',
        		userSelect: 'none',
        		zIndex: 2, 
        		top: currentlyHoveringOverIo.position!.y - 1.5*blockSize + cameraOffset.y,
        		left: currentlyHoveringOverIo.position!.x + cameraOffset.x,
        		transform: 'translateX(-40%)'
        	}}>{currentlyHoveringOverIo.name}</span>}
	</>;
}