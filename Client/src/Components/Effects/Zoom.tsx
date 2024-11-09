import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { changeBlockSizeByTenPercent, changeGlobalBlockSize } from "../../state/slices/misc";
import { changeGateBlockSize, recalculatePositions } from "../../state/slices/entities";

export default function Zoom(){
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize;});
	const prevBlockSize = useSelector((state: RootState) => {return state.misc.prevBlockSize});
	const currentComponentId = useSelector((state: RootState) => {return state.misc.currentComponentId});
	const prevSize = useRef<number>(blockSize);
	const isWheelEvent = useRef(false);
	const dispatch = useDispatch();
	useEffect(() => {
		const handleWheel = (e: WheelEvent) => {
			dispatch(changeBlockSizeByTenPercent(e.deltaY));
			isWheelEvent.current = true;
		};

		if(isWheelEvent.current){
			//console.log(`recalculating positions for: newSize: ${blockSize} prev:${prevBlockSize} componentID: ${currentComponentId}`);
			dispatch(recalculatePositions({blockSize: blockSize, prevSize: prevBlockSize, currentComponentId: currentComponentId}));
			if(currentComponentId === 'global'){
				dispatch(changeGlobalBlockSize(blockSize));
			}else{
				dispatch(changeGateBlockSize({id: currentComponentId, newBlockSize: blockSize}));
			}
			isWheelEvent.current = false;
		}

		window.addEventListener('wheel', handleWheel);
		return () => {
			window.removeEventListener('wheel', handleWheel);
		};
	}, [blockSize, currentComponentId]);

	return null;
}