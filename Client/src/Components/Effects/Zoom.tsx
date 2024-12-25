import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { changeBlockSizeByTenPercent, changeGlobalBlockSize } from "../../state/slices/misc";
import { changeGateBlockSize, recalculatePositions } from "../../state/slices/entities";

export default function Zoom(){
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize;});
	const prevBlockSize = useSelector((state: RootState) => {return state.misc.prevBlockSize;});
	const currentComponentId = useSelector((state: RootState) => {return state.misc.currentComponentId;});
	const ioRadius = useSelector((state: RootState) => {return state.misc.ioRadius;});
	const isWheelEvent = useRef(false);
	const dispatch = useDispatch();
	useEffect(() => {
		const handleWheel = (e: WheelEvent) => {
			const newSize = parseFloat((e.deltaY > 0 ? blockSize * 0.9 : blockSize / 0.9).toFixed(20));
			if(newSize < 10 || newSize > 44){
				return;
			}
			dispatch(changeBlockSizeByTenPercent(e.deltaY));
			isWheelEvent.current = true;
		};

		if(isWheelEvent.current){
			isWheelEvent.current = false;
			dispatch(recalculatePositions({blockSize: blockSize, prevSize: prevBlockSize, currentComponentId: currentComponentId, ioRadius: ioRadius}));
			if(currentComponentId === 'global'){
				dispatch(changeGlobalBlockSize(blockSize));
			}else{
				dispatch(changeGateBlockSize({id: currentComponentId, newBlockSize: blockSize}));
			}	
		}

		window.addEventListener('wheel', handleWheel);
		return () => {
			window.removeEventListener('wheel', handleWheel);
		};
	}, [blockSize]);

	return null;
}