import React from 'react';
import Clock from './Clock';
import CreateButton from './CreateButton';
import SelectedComponent from './SelectedComponent';
import { CANVAS_WIDTH, DEFAULT_BORDER_WIDTH } from '../../Constants/defaultDimensions';
import DisplayError from './DisplayError';
import BackToMenu from './BackToMenu';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_BORDER_COLOR } from '../../Constants/colors';

export default function Toolbar() {

	const canvasWidth = useSelector((state: RootState) => {return state.misc.canvasWidth;});

	return <div style={{
		left: CANVAS_WIDTH,
		alignSelf: 'flex-end',
		justifySelf: 'flex-end',
		width: window.innerWidth - canvasWidth,
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
		zIndex: 3,
		borderWidth: DEFAULT_BORDER_WIDTH,
		borderStyle: 'solid',
		borderLeft: 0,
		borderColor: DEFAULT_BORDER_COLOR,
		backgroundColor: DEFAULT_BACKGROUND_COLOR,
	}}>
		<SelectedComponent></SelectedComponent>
		<DisplayError></DisplayError>
		<Clock></Clock>
		<CreateButton></CreateButton>
	</div>;
}