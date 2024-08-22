import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state/store";
import { CANVAS_HEIGHT, CANVAS_OFFSET_LEFT, CANVAS_WIDTH, DEFAULT_BORDER_WIDTH, MINIMAL_BLOCKSIZE } from "../Constants/defaultDimensions";
import { Gate } from "../Interfaces/Gate";
import { setSelectedGateId } from "../state/slices/mouseEvents";
import { changeBluePrintPosition } from "../state/slices/entities";
import { createSelector } from "@reduxjs/toolkit";
import '../menu.css';
const checkAllGatesEquality = (prev: {[key: string]: Gate}, next: {[key: string]: Gate}) => {
	const prevEntries = Object.entries(prev);
	const nextEntries = Object.entries(next);
	if(prevEntries?.length !== nextEntries?.length){
		return false;
	}
	return true;
};

export default function DisplayAllGates(){
	const selectGates = (state: RootState) => state.entities.bluePrints.gates;
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const bluePrintsSelector = createSelector(
  		[selectGates],
  		(gates) => {
    	const topLevelComponents: { [key: string]: Gate } = {};
    	Object.entries(gates).forEach(([key, gate]) => {
      	if(gate.parent === 'global') {
        	topLevelComponents[key] = gate;
      	}
			});
			return topLevelComponents;
		}
	);

	useEffect(() => {
		const handleScroll = (e:WheelEvent) => {
			scrollRef.current!.scrollLeft += e.deltaY;
		}
		scrollRef.current?.addEventListener('wheel', handleScroll)
	}, [])

	const bluePrints = useSelector(bluePrintsSelector);
	const dispatch = useDispatch();
	const currentComponentId = useSelector((state: RootState) => {return state.misc.currentComponentId;});
	const canvasWidth = useSelector((state: RootState) => {return state.misc.canvasWidth});
	const canvasHeight = useSelector((state: RootState) => {return state.misc.canvasHeight});
	const isDisabled = currentComponentId !== 'global';
	return (
		<div style={{
			display:'flex', 
		top: canvasHeight,
		width: canvasWidth,
		position: 'absolute',
		height: 2*MINIMAL_BLOCKSIZE,
		zIndex: 0,
		backgroundColor: 'rgb(140 140 140)',
		borderColor: 'rgb(60 60 60)',
		borderWidth: DEFAULT_BORDER_WIDTH,
		borderStyle: 'solid',
		alignContent: 'center',
		left: 0,
		}}>
<div ref = {scrollRef}
	style={{
		display: 'flex',
		top: canvasHeight ,
		width: canvasWidth,
		overflowY: 'hidden',
		alignItems: 'center',
		overflowX: 'scroll',
		scrollbarWidth: 'none',
		padding: 10,
		alignContent: 'center',
		marginLeft: 3*MINIMAL_BLOCKSIZE,
	}}
	onMouseDown={e => e.preventDefault()}
	>
		{Object.entries(bluePrints)?.map(([key, gate]) => {
			return <div
				onMouseDown={e => {
					if(isDisabled || e.button !== 0) return;
					e.stopPropagation();
					dispatch(setSelectedGateId(key));
					dispatch(changeBluePrintPosition({gateId: key, position: {x: e.pageX, y: e.pageY}}));}}
				style={{
					backgroundColor: isDisabled ? 'rgb(90 90 90)': 'rgb(70 70 70)',
					height: 40,
					opacity: isDisabled ? 0.5 : 1,
					marginRight: 7,
					left: 3*MINIMAL_BLOCKSIZE,
					alignSelf: 'center',
					display: 'flex',
					flexShrink: 0,
					justifyContent: 'center',
					alignItems: 'center',
					cursor: isDisabled ? 'not-allowed' : 'pointer',
					width: 3*MINIMAL_BLOCKSIZE,
				}} key={key}>
				<span style={{
					color: 'white',
					fontSize: 18,
					userSelect: 'none',
				}}>{gate.name}</span>
			</div>;
		})
		}
	</div>
		</div>
	
	);
}