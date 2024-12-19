import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';

export default function AddCSSVariables(){
	const cameraOffset = useSelector((state: RootState) => {return state.mouseEventsSlice.cameraOffset;});
	const ioRadius = useSelector((state: RootState) => {return state.misc.ioRadius;});

	useEffect(() => {
		document.documentElement.style.setProperty('--camera-offsetX', `${cameraOffset.x}px`);
		document.documentElement.style.setProperty('--camera-offsetY', `${cameraOffset.y}px`);
	}, [cameraOffset]);

	useEffect(() => {
		document.documentElement.style.setProperty('--io-radius', `${ioRadius}px`);
	}, [ioRadius]);

	return null;
} 