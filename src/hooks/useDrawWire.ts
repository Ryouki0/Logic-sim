import { Dispatch, UnknownAction } from "redux";
import { Line } from "../Interfaces/Line";
import { Wire } from "../Interfaces/Wire";
import { addWire, changeWirePosition } from "../state/objectsSlice";
import { getClosestBlock } from "../drawingFunctions/getClosestBlock";
import { v4 as uuidv4 } from 'uuid';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state/store";
import { setDrawingWire } from "../state/mouseEventsSlice";

const checkWireLenghtEquality = (prev: Wire[], next: Wire[]) => {
	return prev.length === next.length;
};


export default function useDrawWire() {
	const dispatch = useDispatch();

	function startDrawing(
		e: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
		from: {id: string, type: 'inputs' | 'outputs', gateId?: string | null | undefined} | null = null,
		wire?: Wire
	){
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
		const thisWireId = uuidv4();
		let currentWire:Wire = {
			linearLine: {...line},
			diagonalLine: {...line},
			id: thisWireId,
			from: from,
			wirePath: wire ? [...wire.wirePath, thisWireId] : [thisWireId],
			connectedToId: [],
		};
		dispatch(setDrawingWire(thisWireId));
		if(from?.gateId && from?.type ==='inputs'){
			currentWire.from = null;
			currentWire.connectedToId = [{...from}];
			}
		
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
		//currentWire.linearLine.startX = roundedX;
		//currentWire.linearLine.startY = roundedY;
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
				const newWire:Wire = {
					linearLine: {...currentWire.linearLine}, 
					diagonalLine: {...currentWire.diagonalLine}, 
					id: currentWire.id,
					from: currentWire.from,
					wirePath: currentWire.wirePath,
					connectedToId: currentWire.connectedToId,
				};
				dispatch(changeWirePosition(newWire));
			}
		};

		const mouseupListener = (event: MouseEvent) => {
		
			document.removeEventListener("mousemove", mouseMoveListener);
			document.removeEventListener("mouseup", mouseupListener);
			dispatch(setDrawingWire(null));
		};
    
		document.addEventListener("mousemove", mouseMoveListener);
		document.addEventListener("mouseup", mouseupListener);

	}
	return startDrawing;
}