import React, { useEffect, useRef, useState } from "react";
import MainCanvas from "./Components/Canvas/MainCanvas";
import BottomCanvas from "./Components/Canvas/BottomCanvas";
import DisplayAllGates from "./Components/DisplayAllGates";
import MovableGates from "./Components/MovableGates";
import GlobalInputs from "./Components/Canvas/CanvasLeftSide";
import GlobalOutputs from "./Components/Canvas/CanvasRightSide";
import EmptyComponent from "./Components/Effects/ConnectLogic";
import CanvasTop from "./Components/Canvas/CanvasTop";
import BootstrapLogic from "./Components/Effects/BootstrapLogic";
import SelectedGate from "./Components/SelectedGate";
import HoveringOverIO from "./Components/Effects/HoveringOverIO";
import DrawWireFromIo from "./Components/Effects/DrawWireFromIo";
import BackToMenu from "./Components/toolbar/BackToMenu";
import Zoom from "./Components/Effects/Zoom";
import GlobalInput from "./Components/IO/GlobalInput";
import SelectedIo from "./Components/IO/SelectedIo";
import GlobalOutput from "./Components/IO/GlobalOutput";
import '../node_modules/react-circular-progressbar/dist/styles.css';
import DisplayCameraOffset from "./Components/Canvas/DisplayCameraOffset";
import ColorPicker from "./Components/toolbar/ColorPicker/ColorPicker";
import SpinningCircle from "./Components/SpinningCircle";
import ControlPanel from "./Components/ControlPanel";
import CurrentInputs from "./Components/IO/CurrentInputs";
import Notifications from "./Components/Notifications";
import AutoSave from "./Components/Effects/AutoSave";
import AutoLoad from "./Components/Effects/AutoLoad";
import ResizeCanvas from "./Components/Effects/ResizeCanvas";
function Simulation() {
	const divRef = useRef<HTMLDivElement | null>(null);
	
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
			<Notifications></Notifications>
			<AutoSave></AutoSave>
			<AutoLoad></AutoLoad>
			<ResizeCanvas></ResizeCanvas>
		</div>
	);
}

export default Simulation;
