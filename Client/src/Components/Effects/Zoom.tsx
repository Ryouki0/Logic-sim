import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { changeBlockSize } from "../../state/slices/misc";
import { recalculatePositions } from "../../state/slices/entities";

export default function Zoom(){
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize;});
	const currentComponentId = useSelector((state: RootState) => {return state.misc.currentComponentId});
	const prevSize = useRef<number>(blockSize);
	const dispatch = useDispatch();
	useEffect(() => {
		const handleWheel = (e: WheelEvent) => {
			prevSize.current = blockSize;
			dispatch(changeBlockSize(e.deltaY));
		};

		dispatch(recalculatePositions({blockSize: blockSize, prevSize: prevSize.current, currentComponentId: currentComponentId}));

		window.addEventListener('wheel', handleWheel);
		return () => {
			window.removeEventListener('wheel', handleWheel);
		};
	}, [blockSize]);

	return null;
}