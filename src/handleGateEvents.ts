import { Dispatch, UnknownAction } from "redux";
import { setObjectClicked } from "./state/mouseEventsSlice";
import { getClosestBlock } from "./drawingFunctions/getClosestBlock";
import { transform } from "typescript";
import { changeGate, changeInputPosition } from "./state/objectsSlice";

const handleMouseDown = (
	e: React.MouseEvent, 
	eleRef:React.MutableRefObject<HTMLDivElement | null>, 
	dispatch:Dispatch<UnknownAction>,
	dx: number,
	dy: number,
	setOffset:(dx: number, dy: number) => void,
	setPosition: (x: number, y: number) => void) => {
    
	const className = (e.target as HTMLDivElement).classList;
	// if(!className.contains('Gate-container')){
	// 	return;
	// }
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
		// Set the position of element
		if(roundedX !== currentPos.x || roundedY !== currentPos.y){
			setPosition(roundedX, roundedY);
			//console.log(`Real rounded pos: ${roundedX} ${roundedY}`);
			//console.log(`currentPos: ${currentPos.x} ${currentPos.y}`);
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