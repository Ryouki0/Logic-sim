import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { ioEquality } from "./Input";
import { DEFAULT_GATE_COLOR } from "../../Constants/colors";
import { CANVAS_OFFSET_LEFT, CANVASTOP_HEIGHT, getClosestBlock } from "../../Constants/defaultDimensions";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { textStlye } from "../../Constants/commonStyles";
import { changeInputState, changeIOStyle, deleteInput } from "../../state/slices/entities";
import { ModuleSource } from "module";
import { getIOLeftStyle, getLeftStyle } from "../../utils/Spatial/getIOStyles";
import { EmitFlags, transform } from "typescript";
import { off } from "process";
import getIOPathColor from "../../utils/getIOPathColor";
import getIOBGColor from "../../utils/getIOBGColor";
import { setSelectedEntity } from "../../state/slices/mouseEvents";
import { checkSingleIo } from "../Preview/InputPreview";

export default function CustomIO({id, showButton}:{id:string, showButton: boolean}){
	const thisIO = useSelector((state: RootState) => {
		return state.entities.binaryIO[id] ?? state.entities.currentComponent.binaryIO[id];
	}, ioEquality);
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize;});
	const cameraOffset = useSelector((state: RootState) => {return state.mouseEventsSlice.cameraOffset;});
    
	const eleRef = useRef<HTMLDivElement | null>(null);
	const spanRef = useRef<HTMLSpanElement | null>(null);
    
	const [isMouseDown, setIsMouseDown] = useState(false);
	const ioRadius = useSelector((state: RootState) => {return state.misc.ioRadius;});

	const relativeStartPos = useRef<{x: number, y: number}>({x: -1, y: -1});
	const prevSize = useRef(blockSize);
	const offset = useRef<{dx: number, dy: number}>({
		dx:thisIO?.style?.left as number ?? 0, 
		dy: thisIO?.style?.top as number ?? 0
	});


	const handleMouseDown = (e:MouseEvent | React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
		if(e.target !== eleRef.current && e.target !== spanRef.current) return;
		if(e.button !== 0) return;
		dispatch(setSelectedEntity({entity: thisIO, type: 'BinaryIO'}));
		// console.log(`\n\n`);
		// console.log(`styles: left: ${thisIO.style!.left} top: ${thisIO.style!.top}`);

		// console.log(`this input ID: ${thisIO?.id.slice(0,5)}`);
		// console.log(`this input state: ${thisIO?.state}`);
		// console.log(`this input is from: ${thisIO?.from?.map(from => from.id.slice(0.6)).join(', ')}`);
		// console.log(`this input position is: X: ${thisIO?.position?.x} Y: ${thisIO?.position?.y}`);
		// console.log(`this input parent: ${thisIO?.parent}`);
		// thisIO?.to?.forEach(to => {
		// 	console.log(`this input is to: ${to.id.slice(0,5)}`);
		// });
		// console.log(`this input affects the output: ${thisIO?.affectsOutput}`);
		relativeStartPos.current = {x: e.pageX - offset.current.dx, y:e.pageY - offset.current.dy};
		setIsMouseDown(true);
	};

	const handleMouseMove = (e:MouseEvent) => {
		if(!isMouseDown) return;
		const dx = e.pageX - relativeStartPos.current.x;
		const dy = e.pageY - relativeStartPos.current.y;
		const {roundedX, roundedY} = getClosestBlock(dx, dy, blockSize);
		if(roundedX !== thisIO?.style?.left as number || roundedY !== thisIO?.style?.top as number){
			dispatch(changeIOStyle({id: id, top: roundedY, left: roundedX}));
			setHasMoved(true);
		}
		offset.current = {dx: dx, dy: dy};
	};
	const dispatch = useDispatch();
	const [hasMoved, setHasMoved] = useState(false);
    

	const handleMouseUp = (e:MouseEvent) => {
		if(e.button !== 0) return;
		setHasMoved(false);
		setIsMouseDown(false);
		if(e.target !== eleRef.current && e.target !== spanRef.current) return;
	};
	const handleInputMouseUp = (e:MouseEvent) => {
		if(e.button !== 0) return;
		if(!isMouseDown) return;
		if(thisIO?.type === 'output') return;
		if(!hasMoved){
			dispatch(changeInputState(thisIO?.id));
		}
	};

	const handleContextMenu = (e:MouseEvent) => {
		e.preventDefault();
		dispatch(deleteInput(thisIO?.id));
	};
	useEffect(() => {
		eleRef.current?.addEventListener('mousedown', handleMouseDown);
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		eleRef.current?.addEventListener('mouseup', handleInputMouseUp);
		eleRef.current?.addEventListener('contextmenu', handleContextMenu);
		return () => {
			eleRef.current?.removeEventListener('mousedown', handleMouseDown);
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			eleRef.current?.removeEventListener('mouseup', handleInputMouseUp);
			eleRef.current?.removeEventListener('contextmenu', handleContextMenu);
		};
	}, [blockSize, thisIO, isMouseDown, hasMoved]);

	//When zooming, the old offset would make the I/O teleport, so change the offset to the new position
	useEffect(() => {
		
		const multipliers = {
			x:(thisIO?.position!.x - CANVAS_OFFSET_LEFT) / prevSize.current, 
			y: (thisIO?.position!.y - CANVASTOP_HEIGHT) / prevSize.current
		};

		const newPosition = {
			x: (multipliers.x * blockSize)+CANVAS_OFFSET_LEFT, 
			y: multipliers.y * blockSize + CANVASTOP_HEIGHT
		};

		const newRoundedPosition = getClosestBlock(newPosition.x, newPosition.y, blockSize);
		offset.current.dx = newRoundedPosition.roundedX;
		offset.current.dy = newRoundedPosition.roundedY;
		prevSize.current = blockSize;
	}, [blockSize]);

	return  <div 
		ref = {eleRef}
		className="shadow" 
		style={{
			position: 'absolute',
			left: getLeftStyle(thisIO?.type, blockSize, cameraOffset, {x:thisIO!.style!.left as number, y: thisIO!.style!.top as number}),
			top: ((thisIO?.style!.top as number ?? 0) - blockSize/2) + cameraOffset.y,
			width: 2*blockSize,
			height: blockSize,
			zIndex: 1,
			borderTopLeftRadius: thisIO?.type === 'input' ? 10 : 0,
			borderBottomLeftRadius: thisIO?.type === 'input' ? 10 : 0,
			borderTopRightRadius: thisIO?.type === 'output' ? 10 : 0,
			borderBottomRightRadius: thisIO?.type === 'output' ? 10 : 0,
			display: 'flex',
			backgroundColor: DEFAULT_GATE_COLOR,
		}}>
		<span
			ref = {spanRef}
			style={{
				position: 'absolute',
				color: 'whitesmoke',
				userSelect: 'none',
				cursor: thisIO?.type === 'input' ? 'pointer' : 'auto',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)'}}>
			{thisIO?.state ? 'On' : 'Off'}
		</span>
		<div onClick={e => {e.stopPropagation();}} 
			style={{
				width: ioRadius,
				height: ioRadius,
				position: 'relative',
				userSelect: 'none',
				left: getIOLeftStyle(thisIO?.type, blockSize, ioRadius),
				alignSelf: 'center',
			}}
		><CircularProgressbar
				value={100}
                
				background={true}
				styles={
                    
					buildStyles({
						backgroundColor: getIOBGColor(thisIO),
						pathColor: getIOPathColor(thisIO),
					})}
                
				strokeWidth={16}
			></CircularProgressbar>
            
        
		</div>
	</div>;
}