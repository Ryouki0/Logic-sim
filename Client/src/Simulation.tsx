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
import { getClosestBlock, MINIMAL_BLOCKSIZE } from "./Constants/defaultDimensions";
import BackToMenu from "./Components/toolbar/BackToMenu";
import { RootState } from "./state/store";
import Zoom from "./Components/Effects/Zoom";
import GlobalInput from "./Components/IO/GlobalInput";
import SelectedIo from "./Components/IO/SelectedIo";
import GlobalOutput from "./Components/IO/GlobalOutput";
import '../node_modules/react-circular-progressbar/dist/styles.css';
import DisplayCameraOffset from "./Components/Canvas/DisplayCameraOffset";
import ColorPicker from "./Components/toolbar/ColorPicker/ColorPicker";
import PixiCanvas from "./Components/Canvas/PixiCanvas";
import SpinningCircle from "./Components/SpinningCircle";
import Tabs from "./Components/toolbar/Tabs";
import ControlPanel from "./Components/ControlPanel";
import CurrentInputs from "./Components/IO/CurrentInputs";
import AddCSSVariables from "./Components/AddCSSVariables";
import AllIOParent from "./Components/IO/AllIOParent";
function Simulation() {
	const dispatch = useDispatch();
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize;});
	const divRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		const handleResize = () => {
			dispatch(setCanvasDim({width: 0.8*window.innerWidth, height: window.innerHeight - 2*MINIMAL_BLOCKSIZE}));
		};

		
		document.body.style.overflow = 'hidden';
		window.addEventListener('resize', handleResize);
	}, [blockSize]);

	return (
		<div ref={divRef}
			style={{
				display: 'flex',
				justifyContent: 'flex-end',
				width: '100vw',
				height: '100vh',
			}}>
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
			<BackToMenu></BackToMenu>
			<SelectedIo></SelectedIo>
			<DisplayCameraOffset></DisplayCameraOffset>
			<ColorPicker></ColorPicker>
			<SpinningCircle></SpinningCircle>
			<ControlPanel></ControlPanel>
			<CurrentInputs></CurrentInputs>
			<GlobalInput></GlobalInput>
			<GlobalOutput></GlobalOutput>

		</div>
	);
}

export default Simulation;
