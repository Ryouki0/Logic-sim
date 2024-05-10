import { Dispatch, UnknownAction } from "redux";
import { setObjectClicked } from "./state/mouseEventsSlice";
import { getClosestBlock } from "./drawingFunctions/getClosestBlock";
import { transform } from "typescript";
import { changeGate } from "./state/objectsSlice";

const handleMouseDown = (
	e: React.MouseEvent, 
	eleRef:React.MutableRefObject<HTMLDivElement | null>, 
	dispatch:Dispatch<UnknownAction>,
	dx: number,
	dy: number,
	setOffset:(dx: number, dy: number) => void,
	setPosition: (x: number, y: number) => void) => {
    
	const className = (e.target as HTMLDivElement).classList;
	if(!className.contains('Gate-container')){
		return;
	}
	const ele = eleRef.current;
	if(!ele){
		return;
	}
	const {x,y} = ele.getBoundingClientRect();
	const startPos = {
		x: e.clientX - dx,
		y: e.clientY - dy,
	};
	const handleMouseMove = (e: MouseEvent) => {
		const ele = eleRef.current;
		if (!ele) {
			return;
		}

		// How far the mouse has been moved
		const dx = e.clientX - startPos.x;
		const dy = e.clientY - startPos.y;
		const {roundedX, roundedY} = getClosestBlock(dx, dy);
		
		// Set the position of element
		if(roundedX !== dx || roundedY !== dy){
			setPosition(roundedX, roundedY);
			//console.log(`Real rounded pos: ${roundedX} ${roundedY}`);
		}
 		setOffset(dx, dy);

	};

	const handleMouseUp = () => {
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
		dispatch(setObjectClicked(null));
	};

	document.addEventListener('mousemove', handleMouseMove);
	document.addEventListener('mouseup', handleMouseUp);
};

export default handleMouseDown;