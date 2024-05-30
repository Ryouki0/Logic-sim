import React from 'react';
import { CANVAS_WIDTH_MULTIPLIER, DEFAULT_INPUT_DIM, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { getClosestBlock } from '../drawingFunctions/getClosestBlock';
import { addGlobalOutput } from '../state/objectsSlice';
import {v4 as uuidv4} from 'uuid';
import { Output } from './Output';

export default function GlobalOutputs() {
    const outputs = useSelector((state: RootState) => {return state.objectsSlice.globalOutputs});
    const dispatch = useDispatch();
    const outputEntries = Object.entries(outputs);

    const handleRightClick = (e:React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        const {roundedX, roundedY} = getClosestBlock(e.pageX, e.pageY);
        for(const [key, output] of outputEntries){
            if(output.position?.y === roundedY){
                return;
            }
        }
        dispatch(addGlobalOutput(
            {
                state:0,
                id: uuidv4(),
                position: {
                    x: CANVAS_WIDTH_MULTIPLIER - MINIMAL_BLOCKSIZE,
                    y: roundedY
                },
                style: {
                    top: roundedY - DEFAULT_INPUT_DIM.height/2, 
                    position:'absolute', 
                    left: -DEFAULT_INPUT_DIM.height/2
                }
            }
        ))
    }

    return <div 
    style={{
        width: MINIMAL_BLOCKSIZE,
        height: CANVAS_WIDTH_MULTIPLIER,
        zIndex: 1,
        backgroundColor: 'rgb(100, 100, 100)',
        position: 'absolute',
        left: CANVAS_WIDTH_MULTIPLIER - MINIMAL_BLOCKSIZE, 
    }}
    onContextMenu={e=> {handleRightClick(e)}}>
        {outputEntries.map(([key, output], idx, array) => {
            return <Output output={output} style={output.style} key={output.id}></Output>
        })}
    </div>
}