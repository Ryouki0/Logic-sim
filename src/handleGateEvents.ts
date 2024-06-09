import { Dispatch, UnknownAction } from "redux";
import { getClosestBlock } from "./drawingFunctions/getClosestBlock";
import { transform } from "typescript";
import { changeGate, changeInputPosition } from "./state/slices/entities";

const handleMouseDown = (
	e: React.MouseEvent, 
	eleRef:React.MutableRefObject<HTMLDivElement | null>, 
	dispatch:Dispatch<UnknownAction>,
	dx: number,
	dy: number,
	setOffset:(dx: number, dy: number) => void,
	setPosition: (x: number, y: number) => void) => {
    
	const ele = eleRef.current;
	if(!ele){
		return;
	}
	
	const {x,y} = ele.getBoundingClientRect();
	const startPos = {
		x: e.pageX - dx,
		y: e.pageY - dy,
	};
	const handleMouseMove = (e: MouseEvent) => {
		const ele = eleRef.current;
		if (!ele) {
			return;
		}

		// How far the mouse has been moved
		const dx = e.pageX - startPos.x;
		const dy = e.pageY - startPos.y;
		const {roundedX, roundedY} = getClosestBlock(dx, dy);
		const currentPos = ele.getBoundingClientRect();
		// Set the position of element to the nearest block
		if(roundedX !== currentPos.x || roundedY !== currentPos.y){
			setPosition(roundedX, roundedY);
		}
 		setOffset(dx, dy);

	};

	const handleMouseUp = () => {
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
		
	};

	document.addEventListener('mousemove', handleMouseMove);
	document.addEventListener('mouseup', handleMouseUp);
};

export default handleMouseDown;