import React from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { RootState } from '../state/store';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import { DEFAULT_WIRE_COLOR } from '../Constants/colors';

export default function WireHead(){
    const wires = useSelector((state: RootState) => {return state.entities.currentComponent.wires});

    return <>
        {Object.entries(wires).map(([key, wire]) => {
            return <div>
                <div style={{
                position: 'absolute',
                top: wire.diagonalLine.endY - 10,
                left: wire.diagonalLine.endX - 10,
                width: 20,
                height: 20,
            }}>
                <CircularProgressbar 
                value={100}
                background={true}
                styles={buildStyles({
                    backgroundColor: 'grey',
                    pathColor: DEFAULT_WIRE_COLOR
                })}></CircularProgressbar>
            </div>
            <div style={{
                position: 'absolute',
            }}>

            </div>
                </div>
        })}
        
    </>
}