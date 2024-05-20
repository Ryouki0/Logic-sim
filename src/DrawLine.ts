import { Dispatch, UnknownAction } from "redux";
import { Line } from "./Interfaces/Line";
import { Wire } from "./Interfaces/Wire";
import { changeWire } from "./state/objectsSlice";
import { getClosestBlock } from "./drawingFunctions/getClosestBlock";
import { BinaryOutput } from "./Interfaces/BinaryOutput";
import { BinaryInput } from "./Interfaces/BinaryInput";
import { setObjectClicked } from "./state/mouseEventsSlice";
import { v4 as uuidv4 } from 'uuid';
import checkIfPointInRect from "./hooks/useConnecting";
export default function startDrawingLine(
	e: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
	dispatch:Dispatch<UnknownAction>,
	from: null | BinaryOutput | BinaryInput = null,
) {
	const canvasEle = document.getElementById("main-canvas") as HTMLCanvasElement;
	if (!canvasEle) {
		return;
	}
	const context = canvasEle.getContext("2d");
	if (!context) {
		return;
	}
	//console.log('drawline from: ', from);
	const line: Line = {startX: 0, startY: 0, endX: 0, endY: 0};
	const lastPosition = {x: 0, y: 0};
	const currentWire: Wire = {
		linearLine: {...line} as Line, 
		diagonalLine: {...line} as Line, 
		id: uuidv4(),
		from: from}; 
	dispatch(setObjectClicked('Wire'));
	const getClientOffset = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
		const { pageX, pageY } = event;
		const x = pageX - canvasEle.offsetLeft;
		const y = pageY - canvasEle.offsetTop;
      
		return {x,y};
	};

	const mouseDownListener = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {

		//dispatch(setObjectClicked("Wire"));
		const {x, y} = getClientOffset(event);
		const {roundedX, roundedY} = getClosestBlock(x,y);
		line.startX = roundedX;
		line.startY = roundedY;
		lastPosition.x = roundedX;

		lastPosition.y = roundedY;
		currentWire.linearLine.startX = roundedX;
		currentWire.linearLine.startY = roundedY;
	};
    
	mouseDownListener(e);

	const calculateLineBreak = (tempLine: Line) => {

		const diffX = tempLine.endX - tempLine.startX;
		const diffY = tempLine.endY - tempLine.startY;
        
		if(Math.abs(diffX) >= Math.abs(diffY)){
          
			if(diffX > 0){
				line.endX -= Math.abs(diffY);
			}else{
				line.endX += Math.abs(diffY);
			}
			line.endY = line.startY;
			currentWire.linearLine = {...line};
			currentWire.diagonalLine = {startX: line.endX,startY:line.startY, endX: tempLine.endX, endY: tempLine.endY} as Line;
			//drawLine(currentWire.diagonalLine, context);
		}
		else if(Math.abs(diffY) > Math.abs(diffX)){

			if(diffY > 0){
				line.endY -= Math.abs(diffX);
			}else{
				line.endY += Math.abs(diffX);
			}
			line.endX = line.startX;
			currentWire.linearLine ={...line};
			currentWire.diagonalLine = {startX: line.endX,startY:line.endY, endX: tempLine.endX, endY: tempLine.endY} as Line;
			//drawLine(currentWire.diagonalLine, context);
		}
	};

	const mouseMoveListener = (event: MouseEvent) => {
      
		const {x, y} = getClientOffset((event as unknown) as React.MouseEvent<HTMLCanvasElement, MouseEvent>);
		const {roundedX, roundedY} = getClosestBlock(x,y);
      
		//console.log(`X: ${x} roundedX: ${roundedX} lastPosY: ${lastPosition.y} roundedY: ${roundedY}`);
		if(lastPosition.x !== roundedX || lastPosition.y !== roundedY){
			//console.log('bigger than min block size');
			line.endX = roundedX;
			line.endY = roundedY;
			lastPosition.x = roundedX;
			lastPosition.y = roundedY;

			currentWire.linearLine.endX = roundedX;
			currentWire.linearLine.endY = roundedY;
			calculateLineBreak({startX:line.startX, startY: line.startY, endX: lastPosition.x, endY: lastPosition.y} as Line);
			//console.log(`REAL LINE: startY: ${line.startY} - ${line.endY}  startX: ${line.startX} - ${line.endX}`);
			//drawLine(line, context);
			const newWire:Wire = {...currentWire, linearLine: {...currentWire.linearLine}, diagonalLine: {...currentWire.diagonalLine}, id: currentWire.id, from: currentWire.from, };
			dispatch(changeWire(newWire));
		}
	};

	const mouseupListener = (event: MouseEvent) => {
		//console.log("mouse up listener called");
		//checkIfPointInRect({x: lastPosition.x, y: lastPosition.y}, {})
		document.removeEventListener("mousemove", mouseMoveListener);
		document.removeEventListener("mouseup", mouseupListener);
		dispatch(setObjectClicked(null));
	};
    
	document.addEventListener("mousemove", mouseMoveListener);
	document.addEventListener("mouseup", mouseupListener);
}