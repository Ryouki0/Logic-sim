import React, { useEffect } from 'react';
import useDrawWire from '../../hooks/useDrawWire';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import isOnIo from '../../utils/Spatial/isOnIo';

export default function DrawWireFromIo(){
	const io = useSelector((state: RootState) => {return state.entities.currentComponent.binaryIO;});
	const currentComponentId = useSelector((state: RootState) => {return state.misc.currentComponentId;});
	const cameraOffset = useSelector((state: RootState) => {return state.mouseEventsSlice.cameraOffset;});
	const startDrawing = useDrawWire(cameraOffset);
	const ioRadius = useSelector((state: RootState) => {return state.misc.ioRadius;});

	useEffect(() => {
		if(currentComponentId !== 'global') return;
		const handleMouseDown = (e: MouseEvent) => {
			if(e.button !== 0) return;
			for(const [key, io] of ioEntries){
				if(isOnIo(e.x, e.y, io, cameraOffset, ioRadius)){
					e.preventDefault();
					e.stopPropagation();
					startDrawing(e as unknown as React.MouseEvent<any>);
					return;
				}
			}
		};
		const ioEntries = Object.entries(io);
		document.addEventListener('mousedown', handleMouseDown, {capture: true});

		return () => {
			document.removeEventListener('mousedown', handleMouseDown, {capture: true});
		};
	}, [startDrawing, io, currentComponentId, cameraOffset]);

	return null;
}