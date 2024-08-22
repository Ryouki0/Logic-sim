import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { Wire } from '@Shared/interfaces';
import { calculateLinePoints, isPointOnDiagonalLine, isPointOnLine } from '../utils/Spatial/isPointOnLine';


export default function useIsWireClicked(){
	const wires = useSelector((state: RootState) => {return state.entities.currentComponent.wires;});
	const dispatch = useDispatch();
	/**
	 * Tells if a point is on any wire (Only gives back the last wire that contains the point).
	 * @param x X coord of the point
	 * @param y Y coord of the point
	 * @returns The wire that contains the point, else undefined | null
	 */
	const checkWire = (x:number, y:number): Wire | undefined | null => {
		if(!wires){
			return;
		}
		let wire = null;
		Object.entries(wires).forEach(([key, w]) => {
			let {startX, startY, endX, endY} = calculateLinePoints(w.linearLine);
			if(isPointOnLine(startX,startY,endX,endY, x, y)){
				wire = w;
				return;
			}
			({startX, startY, endX, endY} = w.diagonalLine);

			if(isPointOnDiagonalLine(startX, startY, endX, endY, x, y)){
				wire = w;
				return;
			}
		});
		return wire;
	};

	/**
	 * Gives back all the wires that contain a point
	 * @param x X coord of the point
	 * @param y Y coord of the point
	 * @returns A list of wires, or undefined | null
	 */
	const getAllWire = (x:number, y:number): Wire[] | undefined | null => {
		if(!wires){
			return;
		}
		const allWire:Wire[] = [];
		Object.entries(wires).forEach(([key, w]) => {
			let {startX, startY, endX, endY} = calculateLinePoints(w.linearLine);
			if(isPointOnLine(startX,startY,endX,endY, x, y)){
				allWire.push(w);
				return;
			}
			({startX, startY, endX, endY} = w.diagonalLine);

			if(isPointOnDiagonalLine(startX, startY, endX, endY, x, y)){
				allWire.push(w);
				return;
			}
		});
		return allWire;
	};
	return {checkWire, getAllWire};
}