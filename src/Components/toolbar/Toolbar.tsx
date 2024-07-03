import React from 'react';
import Clock from './Clock';
import CreateButton from './CreateButton';
import SelectedComponent from './SelectedComponent';
import { CANVAS_WIDTH } from '../../Constants/defaultDimensions';

export default function Toolbar() {
    return <div style={{
        position: 'absolute',
        left: CANVAS_WIDTH,
        width: window.innerWidth - CANVAS_WIDTH,
        height: '70%',
    }}>
         <SelectedComponent></SelectedComponent>
         <Clock></Clock>
         <CreateButton></CreateButton>
     </div>
}