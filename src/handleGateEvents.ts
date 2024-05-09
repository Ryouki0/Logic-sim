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
	setOffset: React.Dispatch<React.SetStateAction<{
        dx: number;
        dy: number;
    }>>,
	setPosition: (x: number, y: number) => void) => {
    
	const className = (e.target as HTMLDivElement).classList;
	if(!className.contains('Gate-container')){
		return;
	}
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
		//console.log("dx, dy", dx, dy);
		const {x,y} = ele.getBoundingClientRect();
		const {roundedX, roundedY} = getClosestBlock(dx, dy);
		// console.log(`x: ${x} roundedX ${roundedX} y: ${y} ${roundedY}`);
		// Set the position of element
		if(roundedX !== dx || roundedY !== dy){
			setPosition(roundedX, roundedY);
			//console.log(`Real rounded pos: ${roundedX} ${roundedY}`);
		}
 		setOffset({dx, dy});

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