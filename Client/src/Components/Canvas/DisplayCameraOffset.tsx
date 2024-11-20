import React from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { RootState } from '../../state/store';
import { CANVAS_OFFSET_LEFT, CANVASTOP_HEIGHT, MINIMAL_BLOCKSIZE } from '../../Constants/defaultDimensions';

export default function DisplayCameraOffset(){
    const canvasWidth = useSelector((state: RootState) => {return state.misc.canvasWidth});
    const canvasHeight = useSelector((state: RootState) => {return state.misc.canvasHeight});
    const cameraOffset = useSelector((state: RootState) => {return state.mouseEventsSlice.cameraOffset});
    return <div style={{
        position: 'absolute', 
        zIndex: 52, 
        left: canvasWidth - 2*MINIMAL_BLOCKSIZE, 
        top: CANVASTOP_HEIGHT,
        transform: 'translateX(-100%)'}}>
        <span style={{color: 'white', fontSize: 18, opacity: 0.6, userSelect: 'none'}}>X:{cameraOffset.x} Y: {cameraOffset.y}</span>
    </div>;
}