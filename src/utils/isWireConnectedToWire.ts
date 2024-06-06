import { Wire } from "../Interfaces/Wire";
import { isPointOnWire } from "./isPointOnLine";

export default function isWireConnectedToWire(wire1: Wire, wire2:Wire){
	let {startX, startY, endX, endY} = wire1.linearLine;
	if(isPointOnWire(startX,startY,wire2) || isPointOnWire(endX,endY,wire2)){
		return true;
	}
	({startX,startY,endX,endY} = wire1.diagonalLine);
	if(isPointOnWire(startX,startY,wire2) || isPointOnWire(endX,endY,wire2)){
		return true;
	}
}