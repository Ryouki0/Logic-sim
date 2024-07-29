import React from 'react';
import { CANVAS_WIDTH, DEFAULT_BORDER_WIDTH, MINIMAL_BLOCKSIZE } from '../../Constants/defaultDimensions';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_BORDER_COLOR } from '../../Constants/colors';

export default function CanvasTop(){

	return <div style={{
		position: 'absolute',
		width: CANVAS_WIDTH,
		borderStyle: 'solid',
		borderWidth: DEFAULT_BORDER_WIDTH,
		borderColor: DEFAULT_BORDER_COLOR,
		height: MINIMAL_BLOCKSIZE,
		backgroundColor: DEFAULT_BACKGROUND_COLOR,
	}}>

	</div>;
}