import React, { useEffect, useRef } from 'react';
import startDrawingLine from '../DrawLine';
import { useDispatch, useSelector } from 'react-redux';
import useRedrawCanvas from '../hooks/useRedrawCanvas';
import { RootState } from '../state/store';

export default function MainCanvas(){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dispatch = useDispatch();
    const currentlyClicked = useSelector((state: RootState) => {return state.mouseEventsSlice.objectClicked});

    useEffect(() => {
        if (!canvasRef || !canvasRef.current) {
          return;
        }
        canvasRef.current.width = window.innerWidth * 0.8;
        canvasRef.current.height = window.innerHeight * 0.8;
        
      }, []);
    useRedrawCanvas();
      
    return (
        <>
            <canvas
        id="main-canvas"
        ref={canvasRef}
        onMouseDown={(e) => {startDrawingLine(e, dispatch, currentlyClicked)}}
        style={{
          backgroundColor: "rgb(100 100 100 / 30%)",
          marginLeft: "10%",
        }}
      >
        alt text
      </canvas>
      
        </>
    )
}