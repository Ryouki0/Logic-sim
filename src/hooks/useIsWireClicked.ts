import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { LINE_WIDTH, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import { Line } from '../Interfaces/Line';

export default function useIsWireClicked(){
    const wires = useSelector((state: RootState) => {return state.objectsSlice.wires});
    
    function calculateLinePoints(line:Line, offset: number = 3){
            let { startX, endX, startY, endY } = line;
            
            const newStartX = (Math.min(startX, endX)) + offset*MINIMAL_BLOCKSIZE;
            const newEndX = Math.max(startX, endX) + offset*MINIMAL_BLOCKSIZE;

            const newStartY = Math.min(startY, endY);
            const newEndY = Math.max(startY, endY);
            startX = newStartX;
            startY = newStartY;
            endX = newEndX;
            endY = newEndY;
            return {startX, startY, endX, endY};
    }

    function isPointOnLine(startX:number,startY:number,endX:number,endY:number, px:number,py:number, calculatePoints: boolean = false){
        if(calculatePoints){
            ({startX, startY, endX, endY} = calculateLinePoints({startX, startY, endX, endY} as Line))
        }
        if(startX - (Math.trunc(LINE_WIDTH/2) + 1) <= px && endX + (Math.trunc(LINE_WIDTH / 2) + 1) > px){
            if(startY - (Math.trunc(LINE_WIDTH/2) + 1) <= py && endY + (Math.trunc(LINE_WIDTH/2) + 1) > py){
                return true;
            }
        }
        return false;
    }

    function isPointOnDiagonalLine(startX: number, startY: number, endX: number, endY: number, x: number, y: number) {
        const m = (endY - startY) / (endX - startX);
        const startPointX = startX + 3*MINIMAL_BLOCKSIZE;
        const endPointX = endX + 3*MINIMAL_BLOCKSIZE;

        const b = startY - m * startPointX;

        const distance = Math.abs(m * x - y + b) / Math.sqrt(m * m + 1);
        if(!isPointOnLine( startX, startY, endX, endY, x, y, true)){
            return false;
        }

        return distance <= Math.trunc(LINE_WIDTH / 2) + 1;
    }

    const checkWire = (x:number, y:number) => {
        if(!wires){
            return;
        }
        wires.forEach(w => {
            let {startX, startY, endX, endY} = calculateLinePoints(w.linearLine);
            isPointOnLine(startX, startY, endX, endY, x, y);
            
            ({startX, startY, endX, endY} = w.diagonalLine);
            

            console.log(isPointOnDiagonalLine(startX, startY, endX, endY, x, y));
        })
    }
    return checkWire;
}