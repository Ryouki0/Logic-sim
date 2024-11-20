import React, { useEffect, useRef } from 'react';
import { CANVAS_WIDTH, CANVASTOP_HEIGHT, DEFAULT_BORDER_WIDTH, MINIMAL_BLOCKSIZE } from '../../Constants/defaultDimensions';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_BORDER_COLOR, DEFAULT_BUTTON_COLOR } from '../../Constants/colors';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { BackArrow } from '../BackArrow';
export default function CanvasTop(){
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize;});

	const currentComponentId = useSelector((state: RootState) => {return state.misc.currentComponentId;});
	const currentComponent = useSelector((state: RootState) => {return state.entities.gates[currentComponentId];});
	const canvasWidth = useSelector((state: RootState) =>{return state.misc.canvasWidth;});
	const canvasHeight = useSelector((state: RootState) => {return state.misc.canvasHeight;});
	return <div style={{
		width: canvasWidth,
		zIndex: 2,
		position: 'absolute',
		left: 0,
		borderStyle: 'solid',
		top: 0,
		borderWidth: DEFAULT_BORDER_WIDTH,
		borderColor: DEFAULT_BORDER_COLOR,
		height: CANVASTOP_HEIGHT,
		display: 'inline-flex',
		alignItems: 'center',
		alignContent: 'center',
		flexDirection: 'column',
		backgroundColor: DEFAULT_BACKGROUND_COLOR,
	}}>
		<div style={{
			width: canvasWidth/2,
			height: canvasHeight - 2*DEFAULT_BORDER_WIDTH,
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
				zIndex: 10,
				height: 2*blockSize,
				position: 'absolute',
				display: 'flex',
				alignSelf: 'flex-start',
				padding: 10,
			}}>
			<BackArrow 
				style={{
					width: 32,
					height: 32,
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