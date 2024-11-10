import React, { useEffect, useRef, useState } from "react";
import MainCanvas from "./Components/Canvas/MainCanvas";
import BottomCanvas from "./Components/Canvas/BottomCanvas";
import DisplayAllGates from "./Components/DisplayAllGates";
import MovableGates from "./Components/MovableGates";
import GlobalInputs from "./Components/Canvas/CanvasLeftSide";
import GlobalOutputs from "./Components/Canvas/CanvasRightSide";
import EmptyComponent from "./Components/Effects/ConnectLogic";
import Toolbar from "./Components/toolbar/Toolbar";
import CanvasTop from "./Components/Canvas/CanvasTop";
import BootstrapLogic from "./Components/Effects/BootstrapLogic";
import SelectedGate from "./Components/SelectedGate";
import HoveringOverIO from "./Components/Effects/HoveringOverIO";
import DrawWireFromIo from "./Components/Effects/DrawWireFromIo";
import { useDispatch, useSelector } from "react-redux";
import { setCanvasDim } from "./state/slices/misc";
import { getClosestBlock } from "./Constants/defaultDimensions";
import BackToMenu from "./Components/toolbar/BackToMenu";
import { RootState } from "./state/store";
import Zoom from "./Components/Effects/Zoom";
import GlobalInput from "./Components/IO/GlobalInput";
import SelectedIo from "./Components/IO/SelectedIo";
import GlobalOutput from "./Components/IO/GlobalOutput";
import '../node_modules/react-circular-progressbar/dist/styles.css';
function Simulation() {
	const dispatch = useDispatch();
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize;});
	const divRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		const handleResize = () => {
			dispatch(setCanvasDim({width: getClosestBlock(0.8*window.innerWidth, 0, blockSize).roundedX, height: window.innerHeight - 2*blockSize}));
			//console.log(`changed canvas dim to: ${window.innerWidth}`);
		};

		
		document.body.style.overflow = 'hidden';
		window.addEventListener('resize', handleResize);
	}, []);

	return (
		<div ref={divRef}
			style={{
				display: 'flex',
				justifyContent: 'flex-end',
				width: '100vw',
				height: '100vh',
			}}>
			<GlobalInput></GlobalInput>
			<GlobalOutput></GlobalOutput>
			<Zoom></Zoom>
			<GlobalInputs></GlobalInputs>
			<DisplayAllGates></DisplayAllGates>
			<MainCanvas></MainCanvas>
			<BottomCanvas></BottomCanvas>
			<CanvasTop></CanvasTop>
			<MovableGates></MovableGates>
			<EmptyComponent></EmptyComponent>
			<BootstrapLogic></BootstrapLogic>
			<SelectedGate></SelectedGate>
			<HoveringOverIO></HoveringOverIO>
			<DrawWireFromIo></DrawWireFromIo>
			<GlobalOutputs></GlobalOutputs>
			<Toolbar></Toolbar>
			<BackToMenu></BackToMenu>
			<SelectedIo></SelectedIo>
		</div>
	);
}

export default Simulation;
