import { Line } from "@Shared/interfaces";
import {Wire} from'@Shared/interfaces';
import { changeWirePosition } from "../state/slices/entities";
import { getClosestBlock } from "../Constants/defaultDimensions";
import { v4 as uuidv4 } from 'uuid';
import { useDispatch, useSelector } from "react-redux";
import { setDrawingWire } from "../state/slices/mouseEvents";
import useIsWireClicked from "./useIsWireClicked";
import { RootState } from "../state/store";


export default function useDrawWire(cameraOffset: {x: number, y:number}) {
	const dispatch = useDispatch();
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize;});
	function startDrawing(
		e: React.MouseEvent<any>,
	){
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
		const thisWireId = uuidv4();
		const currentWire:Wire = {
			linearLine: {...line},
			diagonalLine: {...line},
			id: thisWireId,
			parent: 'global',
			targets: [],
		};
		dispatch(setDrawingWire(thisWireId));
		
		/**
		 * It calculates the offset of the main canvas (if there is an offset)
		 * @param event The `mousedown` event on the main canvas
		 * @returns The top-left edge of the main canvas
		 */
		const getClientOffset = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
			const { pageX, pageY } = event;
			const x = pageX - canvasEle.offsetLeft;
			const y = pageY - canvasEle.offsetTop;
      
			return {x,y};
		};

		const mouseDownListener = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {

			let {x, y} = getClientOffset(event);
			x = x - cameraOffset.x;
			y = y - cameraOffset.y;
			const {roundedX, roundedY} = getClosestBlock(x,y, blockSize);
			line.startX = roundedX;
			line.startY = roundedY;
			lastPosition.x = roundedX;

			lastPosition.y = roundedY;
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
			}
		};

		const mouseMoveListener = (event: MouseEvent) => {
      
			let {x, y} = getClientOffset((event as unknown) as React.MouseEvent<HTMLCanvasElement, MouseEvent>);
			x = x - cameraOffset.x;
			y = y - cameraOffset.y;
			const {roundedX, roundedY} = getClosestBlock(x,y, blockSize);
      
			if(lastPosition.x !== roundedX || lastPosition.y !== roundedY){
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
					parent: currentWire.parent,
					targets: currentWire.targets,
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