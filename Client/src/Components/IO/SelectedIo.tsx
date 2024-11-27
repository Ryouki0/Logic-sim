import React, { useEffect, useState } from "react";
import { BinaryIO } from "../../Interfaces/BinaryIO";
import { Input } from "./Input";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { getClosestBlock, } from "../../Constants/defaultDimensions";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { DEFAULT_GATE_COLOR } from "../../Constants/colors";
import { addInput } from "../../state/slices/entities";
import { checkIo } from "../Canvas/CanvasLeftSide";
import {v4 as uuidv4} from 'uuid';
import { getTokenSourceMapRange } from "typescript";
import { setSelectedIo } from "../../state/slices/mouseEvents";
import { getIOLeftStyle, getLeftStyle } from "../../utils/Spatial/getIOStyles";

export default function SelectedIo(){

	const selectedIo = useSelector((state: RootState) => {return state.mouseEventsSlice.selectedIo;});
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize;});
	const cameraOffset = useSelector((state: RootState) => {return state.mouseEventsSlice.cameraOffset;});
	const currentComponentId = useSelector((state: RootState) => {return state.misc.currentComponentId;});
	const inputs = useSelector((state: RootState) => {
		return Object.entries(state.entities.currentComponent.binaryIO).map(([key, io]) => 
		{
			if((io.type === 'input' && !io.gateId) || (io.type === 'input' && io.gateId === currentComponentId)){
				return io;
			}else{
				return null;
			}
		})
			.filter((io): io is NonNullable<typeof io> => io !== null);
	}, checkIo);
	const ioRadius = useSelector((state: RootState) => {return state.misc.ioRadius;});

	const outputs = useSelector((state: RootState) => {
		return Object.entries(state.entities.currentComponent.binaryIO).map(([key, io]) => {
			if((io.type === 'output' && !io.gateId) || (io.type === 'output' && io.gateId === currentComponentId)){
				return io;
			}else{
				return null;
			}
		}).filter((io): io is NonNullable<typeof io> => io !== null);
	}, checkIo);

	const [position, setPosition] = useState({x: selectedIo?.startPos.x ?? 0, y:selectedIo?.startPos.y ?? 0});
	const [shouldShow, setShouldShow] = useState(false);
	const dispatch = useDispatch();
	const handleMouseMove = (e:MouseEvent) => {
		const middleX = e.x - cameraOffset.x;
		const middleY = e.y - cameraOffset.y;
		const {roundedX, roundedY} = getClosestBlock(middleX, middleY, blockSize);
		setPosition({x: roundedX, y: roundedY});

	};

	const handleMouseDown = (e: MouseEvent) => {
		console.log(`selectedIo: ${selectedIo}`);
		if(e.button !== 0 || !selectedIo) return;
		console.log(`putting in at x: ${position.x} y: ${position.y}`);
		dispatch(addInput({
			name: `${selectedIo.type} ${(selectedIo?.type === 'input' ? inputs : outputs).length + 1}`,
			id: uuidv4(),
			type: `${selectedIo!.type}`,
			state: 0,
			isGlobalIo: true,
			parent: 'global',
			to: [],
			style: {
				top: position.y,
				left: position.x 
			},
			position: {x: position.x , y:position.y}
		}));
	};

	const handleContextMenu = (e:MouseEvent) => {
		e.preventDefault();
		dispatch(setSelectedIo(null));
		setShouldShow(false);
	};

	useEffect(() => {
		if(selectedIo){
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mousedown', handleMouseDown);
			document.addEventListener('contextmenu', handleContextMenu);
			setShouldShow(true);
		}
		// console.log(`useEffect: selectedIo: ${selectedIo}`)
		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mousedown', handleMouseDown);
			document.removeEventListener('contextmenu', handleContextMenu);
		};
	}, [selectedIo, position]);

	useEffect(() => {
		if(selectedIo){
			setPosition({x: selectedIo!.startPos!.x, y: selectedIo.startPos!.y});
		}
	}, [selectedIo]);


	return <>
		{shouldShow && <div style={{
			position: 'absolute',
			left: getLeftStyle(selectedIo?.type, blockSize, cameraOffset, position),
			top: position.y - blockSize/2 + cameraOffset.y,
			width: 2*blockSize,
			height: blockSize,
			borderTopLeftRadius: selectedIo?.type === 'input' ? 10 : 0,
			borderBottomLeftRadius: selectedIo?.type === 'input' ? 10 : 0,
			borderTopRightRadius: selectedIo?.type === 'output' ? 10 : 0,
			borderBottomRightRadius: selectedIo?.type === 'output' ? 10 : 0,
			display: 'flex',
			backgroundColor: DEFAULT_GATE_COLOR,
		}}>
			<span onClick={e => {e.preventDefault();}} 
				style={{
					color: 'whitesmoke',
					position: 'absolute',
					userSelect: 'none',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)'}}>
				Off
			</span>
			<div style={{
				width: ioRadius,
				height: ioRadius,
				position: 'relative',
				userSelect: 'none',
				left: getIOLeftStyle(selectedIo?.type, blockSize, ioRadius),
				alignSelf: 'center',
			}}
			>
				<CircularProgressbar
					value={100}
					background={true}
					styles={buildStyles({
						backgroundColor: 'black',
						pathColor: 'black',
					})}
					strokeWidth={16}
				></CircularProgressbar>
				
			</div>
		</div>}
	</>;
}