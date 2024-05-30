import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { DEFAULT_INPUT_DIM } from '../Constants/defaultDimensions';

export default function GhostInput({x, y}: {x:number, y:number}) {

    return <div style={{
        width: DEFAULT_INPUT_DIM.width, 
        height: DEFAULT_INPUT_DIM.width, 
        position: 'absolute', 
        left:x-(DEFAULT_INPUT_DIM.width / 2),
        top:y-(DEFAULT_INPUT_DIM.width / 2)}}>
        <CircularProgressbar value={100} background={true} styles={buildStyles(
            {pathColor: 'grey', backgroundColor: 'grey'}
        )}></CircularProgressbar>
    </div>
}