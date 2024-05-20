import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { CANVAS_OFFSET_LEFT, LINE_WIDTH, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import { Line } from '../Interfaces/Line';
import { removeWire, removeWireFromGateInput } from '../state/objectsSlice';
import { Wire } from '../Interfaces/Wire';


export default function useIsWireClicked(){
    const wires = useSelector((state: RootState) => {return state.objectsSlice.wires});
    const dispatch = useDispatch();
    function calculateLinePoints(line:Line){
            let { startX, endX, startY, endY } = line;
            
            const newStartX = (Math.min(startX, endX)) + CANVAS_OFFSET_LEFT;
            const newEndX = Math.max(startX, endX) + CANVAS_OFFSET_LEFT;

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
        const startPointX = startX + CANVAS_OFFSET_LEFT;
        const endPointX = endX + CANVAS_OFFSET_LEFT;

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
            if(isPointOnLine(startX, startY, endX, endY, x, y)){
                dispatch(removeWire(w));
                if(w.connectedTo){
                    //dispatch(removeWireFromGateInput())
                }
                return;
            }
            
            ({startX, startY, endX, endY} = w.diagonalLine);
            

            if(isPointOnDiagonalLine(startX, startY, endX, endY, x, y)){
                dispatch(removeWire(w));
            }
        })
    }
    return checkWire;
}