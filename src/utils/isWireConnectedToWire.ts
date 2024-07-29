import { Wire } from "../Interfaces/Wire";
import { isPointOnWire } from "./isPointOnLine";

/**
 * Checks if the endpoints of wire1 are on wire2.
 *
 * @param {Wire} wire1 - The wire whose endpoints are being checked against wire2.
 * @param {Wire} wire2 - The wire against which the endpoints of wire1 are being checked.
 * @returns {boolean} - Returns true if any endpoint of wire1 is on wire2, otherwise false.
 */
export default function isWireConnectedToWire(wire1: Wire, wire2: Wire):boolean {
	let { startX, startY, endX, endY } = wire1.linearLine;
	if (isPointOnWire(startX, startY, wire2)) {
		return true;
	}
	({ startX, startY, endX, endY } = wire1.diagonalLine);
	if (isPointOnWire(endX, endY, wire2)) {
		return true;
	}
	return false;
}