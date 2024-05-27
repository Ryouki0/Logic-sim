import { Line } from "../Interfaces/Line";

export default function checkLineEquality(line: Line, other: Line){
	const {startX, startY, endX, endY} = line;
	const {startX: startX2, startY: startY2, endX:endX2, endY: endY2} = other;
	if(startX !== startX2 || startY !== startY2 || endX !== endX2 || endY !== endY2){
		return false;
	}
	return true;
}