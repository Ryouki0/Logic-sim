import React, { useEffect, useRef, useState } from "react";
import MainCanvas from "./Components/Canvas/MainCanvas";
import BottomCanvas from "./Components/Canvas/BottomCanvas";
import DisplayAllGates from "./Components/DisplayAllGates";
import MovableGates from "./Components/MovableGates";
import GlobalInputs from "./Components/GlobalInputs";
import GlobalOutputs from "./Components/GlobalOutputs";
import EmptyComponent from "./Components/Effects/ConnectLogic";
import Toolbar from "./Components/toolbar/Toolbar";
import CanvasTop from "./Components/Canvas/CanvasTop";
import BootstrapLogic from "./Components/Effects/bootstrapLogic";
import SelectedGate from "./Components/SelectedGate";
import HoveringOverIO from "./Components/Effects/HoveringOverIO";
import DrawWireFromIo from "./Components/Effects/DrawWireFromIo";
import { useDispatch } from "react-redux";
import { setCanvasDim } from "./state/slices/misc";
import { MINIMAL_BLOCKSIZE } from "./Constants/defaultDimensions";
import BackToMenu from "./Components/toolbar/BackToMenu";
function Simulation() {
	const dispatch = useDispatch();
	const divRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		const handleResize = () => {
			dispatch(setCanvasDim({width: 0.8*window.innerWidth, height: window.innerHeight - 2*MINIMAL_BLOCKSIZE}))
			//console.log(`changed canvas dim to: ${window.innerWidth}`);
		}
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

		</div>
	);
}

export default Simulation;
