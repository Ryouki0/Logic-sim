import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { CANVAS_OFFSET_LEFT, LINE_WIDTH, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import { Line } from '../Interfaces/Line';
import { removeWire,} from '../state/objectsSlice';
import { Wire } from '../Interfaces/Wire';
import { calculateLinePoints, isPointOnDiagonalLine, isPointOnLine } from '../utils/isPointOnLine';


export default function useIsWireClicked(){
	const wires = useSelector((state: RootState) => {return state.objectsSlice.wires;});
	const dispatch = useDispatch();

	const checkWire = (x:number, y:number): Wire | undefined | null => {
		if(!wires){
			return;
		}
		let wire = null
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
	return checkWire;
}