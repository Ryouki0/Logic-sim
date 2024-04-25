import React, { useEffect, useRef } from "react";
import "./App.css";
import { AndGate } from "./Components/AndGate";
import { DEFAULT_CANVAS_DIM } from "./Constants/defaultDimensions";
import startDrawingLine from "./DrawLine";
import { Line } from "./Interfaces/Line";
import { useDispatch } from "react-redux";
function App() {

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef || !canvasRef.current) {
      return;
    }
    canvasRef.current.width = window.innerWidth * 0.8;
    canvasRef.current.height = window.innerHeight * 0.8;
    
  }, []);

  const dispatch = useDispatch();

  return (
    <>
    {console.log("rendering whole App...")},
      <canvas
        id="main-canvas"
        ref={canvasRef}
        onMouseDown={(e) => startDrawingLine(e, dispatch)}
        style={{
          backgroundColor: "rgb(100 100 100 / 30%)",
          marginLeft: "10%",
        }}
      >
        alt text
      </canvas>
      <AndGate></AndGate>
    </>
  );
}

export default App;
