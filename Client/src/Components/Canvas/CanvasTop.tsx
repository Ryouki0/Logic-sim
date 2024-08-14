import React, { useEffect, useRef } from 'react';
import { CANVAS_WIDTH, CANVASTOP_HEIGHT, DEFAULT_BORDER_WIDTH, MINIMAL_BLOCKSIZE } from '../../Constants/defaultDimensions';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_BORDER_COLOR, DEFAULT_BUTTON_COLOR } from '../../Constants/colors';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { BackArrow } from '../BackArrow';
import useRedrawCanvas from '../../hooks/useRedrawCanvas';
export default function CanvasTop(){

	const currentComponentId = useSelector((state: RootState) => {return state.misc.currentComponentId;});
	const currentComponent = useSelector((state: RootState) => {return state.entities.gates[currentComponentId];});

	return <div style={{
		position: 'absolute',
		width: CANVAS_WIDTH,
		borderStyle: 'solid',
		borderWidth: DEFAULT_BORDER_WIDTH,
		borderColor: DEFAULT_BORDER_COLOR,
		height: CANVASTOP_HEIGHT,
		display: 'flex',
		alignItems: 'center',
		alignContent: 'center',
		flexDirection: 'column',
		backgroundColor: DEFAULT_BACKGROUND_COLOR,
	}}>
		<div style={{
			position: 'absolute',
			width: 400,
			height: CANVASTOP_HEIGHT - 2*DEFAULT_BORDER_WIDTH,
			justifySelf: 'center',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		}}>
			{currentComponent && <span style={{
				color: 'white',
				fontSize: 23,
				alignSelf: 'center',
				justifySelf:'center',
				marginTop: -2*DEFAULT_BORDER_WIDTH
			}}>
				Viewing component: {currentComponent?.name}
			</span>}
			
		</div>
		{currentComponent && <div
			style={{
				zIndex: 2,
				height: 2*MINIMAL_BLOCKSIZE,
				position: 'absolute',
				display: 'flex',
				alignSelf: 'flex-start',
				padding: 10,
			}}>
			<BackArrow 
				style={{
					width: 40,
					height: 40,
					alignSelf: 'center',
					justifySelf: 'center',
					color: 'white',
					display: 'flex',
    				alignItems: 'center',
   					justifyContent: 'center',
    				borderRadius: '50%',
    				backgroundColor: DEFAULT_BUTTON_COLOR,
    				cursor: 'pointer',
    				boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    				transition: 'background-color 0.3s, transform 0.3s',
				}}></BackArrow>
		</div>}
	</div>;
}