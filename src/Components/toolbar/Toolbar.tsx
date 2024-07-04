import React from 'react';
import Clock from './Clock';
import CreateButton from './CreateButton';
import SelectedComponent from './SelectedComponent';
import { CANVAS_WIDTH, DEFAULT_BORDER_WIDTH } from '../../Constants/defaultDimensions';

export default function Toolbar() {
    return <div style={{
        position: 'absolute',
        left: CANVAS_WIDTH,
        width: window.innerWidth - CANVAS_WIDTH,
        height: '100%',
        borderWidth: DEFAULT_BORDER_WIDTH,
        borderStyle: 'solid',
        borderLeft: 0,
        borderColor: 'rgb(60 60 60)',
        backgroundColor: 'rgb(100 100 100)',
    }}>
         <SelectedComponent></SelectedComponent>
         <Clock></Clock>
         <CreateButton></CreateButton>
     </div>
}