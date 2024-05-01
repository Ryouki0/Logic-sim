import React, { useEffect } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { drawLine } from '../drawingFunctions/drawLine';
import { MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';

export default function useRedrawCanvas(){
    const wires = useSelector((state: RootState) => {return state.objectsSlice.wires}, shallowEqual);

    if(!wires){
        return;
    }
    const canvasEle = document.getElementById("main-canvas") as HTMLCanvasElement;
    if(!canvasEle) return;
    
    const context = canvasEle.getContext("2d");
    if(!context) return;

    context.clearRect(0,0,canvasEle.width, canvasEle.height);
    console.log(`drawing wires`);
    for(var i=0;i<wires.length;i++){
        context.strokeStyle = "red";
        drawLine(wires[i].linearLine, context);
        context.strokeStyle = "blue";
        drawLine(wires[i].diagonalLine, context);
    }
    context.strokeStyle = 'black';
    context.lineWidth = 1;
    for(var i = 0;i<canvasEle.width;i+=MINIMAL_BLOCKSIZE){
        for(var j = 0; j<canvasEle.height; j+= MINIMAL_BLOCKSIZE){
          context.strokeRect(i,j,1,1);
          context.fillRect(i,j,1,1);
        }
      }
}