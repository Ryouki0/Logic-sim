import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state/store";
import { CANVAS_HEIGHT, CANVAS_OFFSET_LEFT, CANVAS_WIDTH, DEFAULT_BORDER_WIDTH, getClosestBlock, MINIMAL_BLOCKSIZE } from "../Constants/defaultDimensions";
import { Gate } from "../Interfaces/Gate";
import { setSelectedGateId, setSelectedIo } from "../state/slices/mouseEvents";
import { changeBluePrintPosition } from "../state/slices/entities";
import { createSelector } from "@reduxjs/toolkit";
import '../menu.css';
import BlueprintSettings from "./BlueprintSettings";
import SelectedIo from "./IO/SelectedIo";
import { resolveObjectURL } from "buffer";
import { DEFAULT_BACKGROUND_COLOR } from "../Constants/colors";
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
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize;});
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const [showSettings, setShowSettings] = useState<{show: boolean, x: number, y:number, gate: Gate | null}>
	({show: false, x: 0, y: 0, gate: null});
	const [showSelectedIo, setShowSelectedIo] = useState(false);
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
	const ioRadius = useSelector((state: RootState) => {return state.misc.ioRadius;});
	useEffect(() => {
		const handleScroll = (e:WheelEvent) => {
			e.stopPropagation();
			scrollRef.current!.scrollLeft += e.deltaY;
		};
		const resetSettings = (e:MouseEvent) => {
			
			const settingsNode = document.querySelector('.blueprint-settings') as HTMLElement;
			
			if(settingsNode && settingsNode.contains(e.target as Node)){
				return;
			}

			setShowSettings({show: false, x: 0, y: 0, gate: null});
		};
		if(showSettings.show){
			document.addEventListener('mousedown', resetSettings);
		}
		scrollRef.current?.addEventListener('wheel', handleScroll);
		return () => {
			document.removeEventListener('mousedown', resetSettings);
			scrollRef.current?.removeEventListener('wheel', handleScroll);
		};
	}, [showSettings]);

	const handleMouseDown = (e:React.MouseEvent<HTMLDivElement, MouseEvent>, key: string, gate:Gate) => {
		if(isDisabled) return;
		e.stopPropagation();
		e.preventDefault();
		if(e.button === 0){
			e.stopPropagation();
			dispatch(setSelectedGateId(key));
			const {roundedX, roundedY} = getClosestBlock(e.pageX, e.pageY, blockSize);
			dispatch(changeBluePrintPosition({gateId: key, position: {x: roundedX, y: roundedY}, blockSize: blockSize, ioRadius: ioRadius}));
		}else if(e.button === 2){
			e.preventDefault();
			if(gate.name === 'NO' || gate.name ==='AND' || gate.name === 'SWITCH' || gate.name ==='DELAY'){
				return;
			}
			setShowSettings({show: true, x:e.pageX, y:e.pageY,gate: gate});
		}
	};

	const handleIOClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, type: 'input' | 'output') => {
		if(e.button !== 0) return;
		if(isDisabled) return;
		e.stopPropagation();
		e.preventDefault();
		setShowSelectedIo(true);
		const {roundedX, roundedY} = getClosestBlock(e.pageX, e.pageY, blockSize);

		dispatch(setSelectedIo({type: type, startPos: {x: roundedX, y: roundedY}}));
	};

	const bluePrints = useSelector(bluePrintsSelector);
	const dispatch = useDispatch();
	const currentComponentId = useSelector((state: RootState) => {return state.misc.currentComponentId;});
	const canvasWidth = useSelector((state: RootState) => {return state.misc.canvasWidth;});
	const canvasHeight = useSelector((state: RootState) => {return state.misc.canvasHeight;});
	const isDisabled = currentComponentId !== 'global';
	return (
		<>
			<div className="displayAllGates" 
				style={{
					display:'flex', 
					top: canvasHeight,
					width: canvasWidth,
					position: 'absolute',
					height: 2*MINIMAL_BLOCKSIZE,
					zIndex: 1,
					backgroundColor: DEFAULT_BACKGROUND_COLOR,
					borderColor: 'rgb(60 60 60)',
					borderWidth: DEFAULT_BORDER_WIDTH,
					borderStyle: 'solid',
					alignContent: 'center',
					left: 0,
				} as React.CSSProperties}>
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
						marginLeft: 3*MINIMAL_BLOCKSIZE + 10,
					}}
					onMouseDown={e => e.preventDefault()}
				>
					<div
						onMouseDown={e => {handleIOClick(e, 'input');}}
						onContextMenu={e=> {e.preventDefault(); e.stopPropagation();}}
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
						}} key={'Input'}>
						<span style={{
							color: 'white',
							fontSize: 18,
							userSelect: 'none',
						}}>Input</span>
					</div>
					<div
						onMouseDown={e => {handleIOClick(e, 'output');}}
						onContextMenu={e=> {e.preventDefault(); e.stopPropagation();}}
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
						}} key={'Output'}>
						<span style={{
							color: 'white',
							fontSize: 18,
							userSelect: 'none',
						}}>Output</span>
					</div>
					{Object.entries(bluePrints)?.map(([key, gate]) => {
						return <div
							onMouseDown={e => {handleMouseDown(e, key, gate);}}
							onContextMenu={e=> {e.preventDefault(); e.stopPropagation();}}
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
							} as React.CSSProperties} key={key}>
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
			{showSettings?.show && <BlueprintSettings 
				gate={showSettings?.gate!}
				setShowSettings={setShowSettings}
				style={{
					position: 'absolute', 
					left: showSettings.x, 
					top: showSettings.y - 5*MINIMAL_BLOCKSIZE,
					zIndex: 1,}}></BlueprintSettings>}
		</>
		
	
	);
}