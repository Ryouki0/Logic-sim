
import React, { LegacyRef, useEffect, useRef } from 'react';
import '../index.css';
import { useDispatch, useSelector } from 'react-redux';
import { changeBlockSize, goBack } from '../state/slices/misc';
import { RootState } from '../state/store';
import { switchCurrentComponent } from '../state/slices/entities';
import { MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';


export function BackArrow({style}:{style?: React.CSSProperties}){

	const svgRef = useRef<SVGSVGElement | null>(null);
	const componentHistory = useSelector((state: RootState) => {return state.misc.history;});
	const globalBlockSize = useSelector((state: RootState) => {return state.misc.globalBlockSize});
	const ioRadius = useSelector((state: RootState) => {return state.misc.ioRadius});
	const dispatch = useDispatch();
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize});
	useEffect(() => {
		const handleBack = (e:MouseEvent) => {
			if(componentHistory.length === 0){
				return;
			}
			const lastId = componentHistory[componentHistory.length-2];
			
			dispatch(goBack());
			dispatch(changeBlockSize(globalBlockSize));
			dispatch(switchCurrentComponent({
				componentId: lastId, 
				prevComponent: componentHistory[componentHistory.length-1], 
				blockSize: lastId === 'global' ? globalBlockSize : blockSize,
				ioRadius: ioRadius
			}));
			
		};

		svgRef.current?.addEventListener('mousedown', handleBack);
		return () => {
			svgRef.current?.removeEventListener('mousedown', handleBack);
		};
	}, [componentHistory, globalBlockSize]);
	
	return <svg
		ref={svgRef}
		style={{...style}}
		className="back-arrow"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M19 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H19v-2z"
			fill="currentColor"
		/>
	</svg>;
}