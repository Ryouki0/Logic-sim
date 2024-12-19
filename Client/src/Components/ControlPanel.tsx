import React, { useState } from 'react';
import { CANVAS_WIDTH, DEFAULT_BORDER_WIDTH } from '../Constants/defaultDimensions';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_BORDER_COLOR } from '../Constants/colors';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';
import Toolbar from './toolbar/Toolbar';
import Settings from './Settings';
import Tabs from './toolbar/Tabs';

export default function ControlPanel(){
	const canvasWidth = useSelector((state: RootState) => {return state.misc.canvasWidth;});

	const [currentTab, setCurrentTab] = useState<'general' | 'settings'>('general');


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
		<Tabs setCurrentTab={setCurrentTab}></Tabs>
		{currentTab === 'general' ? <Toolbar></Toolbar> : <Settings></Settings>}
	</div>;
}