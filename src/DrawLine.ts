import { Dispatch, UnknownAction } from "redux";
import { MINIMAL_BLOCKSIZE } from "./Constants/defaultDimensions";
import { Line } from "./Interfaces/Line";
import { setObjectClicked } from "./state/mouseEventsSlice";
import { store } from "./state/store";
import { Wire } from "./Interfaces/Wire";
import { setWires } from "./state/objectsSlice";


export default function startDrawingLine(
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
    dispatch: Dispatch<UnknownAction>
  ) {
    console.log("started drawing line...");
    const canvasEle = document.getElementById("main-canvas") as HTMLCanvasElement;
    if (!canvasEle) {
      return;
    }
    const context = canvasEle.getContext("2d");
    if (!context) {
      return;
    }

    const line: Line = {startX: 0, startY: 0, endX: 0, endY: 0};
    const lastPosition = {x: 0, y: 0};
    let isDrawStart = false;
    let currentWire: Wire = {linearLine: line, diagonalLine: line, id: crypto.randomUUID()}; 

    const isBiggerThanMovementBlock = (currentMousePos: {x:number, y:number}) => {
      const distanceX = currentMousePos.x % MINIMAL_BLOCKSIZE;
      const distanceY = currentMousePos.y % MINIMAL_BLOCKSIZE;

      //console.log(`distanceX: ${distanceX} distanceY: ${distanceY}`);

      if(distanceX >= (MINIMAL_BLOCKSIZE / 2)){
        currentMousePos.x += MINIMAL_BLOCKSIZE - distanceX;
      }
      else if(distanceX < (MINIMAL_BLOCKSIZE/2)){
        currentMousePos.x -= distanceX;
      }
      if(distanceY >= (MINIMAL_BLOCKSIZE/2)){
        currentMousePos.y += MINIMAL_BLOCKSIZE - distanceY;
      }
      else if(distanceY < (MINIMAL_BLOCKSIZE/2)){
        currentMousePos.y -= distanceY;
      }
      return {roundedX: currentMousePos.x, roundedY: currentMousePos.y};
    }


    const getClientOffset = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      let { pageX, pageY } = event;
      let x = pageX - canvasEle.offsetLeft;
      let y = pageY - canvasEle.offsetTop;
      
      return {x,y};
    };

    const mouseDownListener = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      const currentlyClicked = store.getState().mouseEventsSlice.objectClicked;
      if(currentlyClicked == "Gate" || currentlyClicked == "Input"){
        return;
      }

      dispatch(setObjectClicked("Wire"));
      const {x, y} = getClientOffset(event);
      const {roundedX, roundedY} = isBiggerThanMovementBlock({x,y});
      line.startX = roundedX;
      line.startY = roundedY;
      lastPosition.x = roundedX;
      lastPosition.y = roundedY;
      
      currentWire.linearLine.startX = roundedX;
      currentWire.linearLine.startY = roundedY;

    };

    mouseDownListener(e);

    const calculateLineBreak = (tempLine: Line) => {
        console.log(`startX: ${tempLine.startX} startY: ${tempLine.startY} endX: ${tempLine.endX} endY: ${tempLine.endY}`);
        console.log(`MainLine startX: ${line.startX} main startY: ${line.startY} main endX: ${line.endX} main endY: ${line.endY}`);

        const diffX = tempLine.endX - tempLine.startX;
        const diffY = tempLine.endY - tempLine.startY;
        
        if(Math.abs(diffX) > Math.abs(diffY)){
          
          if(diffX > 0){
            line.endX -= Math.abs(diffY);
          }else{
            line.endX += Math.abs(diffY);
          }
          line.endY = line.startY;
          drawLine({startX: line.endX,startY:line.startY, endX: tempLine.endX, endY: tempLine.endY} as Line);
          
        }
        else if(Math.abs(diffY) > Math.abs(diffX)){

          if(diffY > 0){
            line.endY -= Math.abs(diffX);
          }else{
            line.endY += Math.abs(diffX);
          }
          line.endX = line.startX;
          drawLine({startX: line.endX,startY:line.endY, endX: tempLine.endX, endY: tempLine.endY} as Line);
        } 
      }

    const drawLine = (line: Line) => {
      console.log(`drawing line ${line.startY} ${line.endY}`);
      context.beginPath();
      context.lineWidth = 5;
      context.moveTo(line.startX, line.startY);
      context.lineTo(line.endX, line.endY);
      context.stroke();
    };


    const mouseMoveListener = (event: MouseEvent) => {
      
      const {x, y} = getClientOffset((event as unknown) as React.MouseEvent<HTMLCanvasElement, MouseEvent>);
      const {roundedX, roundedY} = isBiggerThanMovementBlock({x,y});
      
      console.log(`X: ${x} roundedX: ${roundedX} lastPosY: ${lastPosition.y} roundedY: ${roundedY}`);
      if(lastPosition.x !== roundedX || lastPosition.y !== roundedY){
        //console.log('bigger than min block size');
        clearCanvas();
        line.endX = roundedX;
        line.endY = roundedY;
        lastPosition.x = roundedX;
        lastPosition.y = roundedY;

        // currentWire.linearLine.endX = roundedX;
        // currentWire.linearLine.endY = roundedY;

        calculateLineBreak({startX:line.startX, startY: line.startY, endX: lastPosition.x, endY: lastPosition.y} as Line);
        console.log(`REAL LINE: startY: ${line.startY} - ${line.endY}  startX: ${line.startX} - ${line.endX}`);
        drawLine(line);
      }
      
    };

    const mouseupListener = (event: MouseEvent) => {
      document.removeEventListener("mousemove", mouseMoveListener);
      document.removeEventListener("mouseup", mouseupListener);
      dispatch(setObjectClicked(null));
      dispatch(setWires([currentWire]));
    };

    const clearCanvas = () => {
      context.clearRect(0, 0, canvasEle.width, canvasEle.height);
    };
    
    document.addEventListener("mousemove", mouseMoveListener);
    document.addEventListener("mouseup", mouseupListener);
  }