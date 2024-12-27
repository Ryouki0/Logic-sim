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
import Tabs from './Tabs';
import SaveButton from './SaveButton';

export default function Toolbar() {


	return <>
		<SelectedComponent></SelectedComponent>
		<DisplayError></DisplayError>
		<Clock></Clock>
		<CreateButton></CreateButton>
	</>;
		
}