import React, { useEffect, useState } from "react";
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
function App() {
	
	useEffect(() => {
		document.body.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = 'auto';
		};
	}, [])

	return (
		<>
			{console.log("rendering whole App...")}
			<MainCanvas></MainCanvas>
			<BottomCanvas></BottomCanvas>
			<CanvasTop></CanvasTop>
			<DisplayAllGates></DisplayAllGates>
			<MovableGates></MovableGates>
			<GlobalInputs></GlobalInputs>
			<GlobalOutputs></GlobalOutputs>
			<EmptyComponent></EmptyComponent>
			<Toolbar></Toolbar>
			<BootstrapLogic></BootstrapLogic>
			<SelectedGate></SelectedGate>
			<HoveringOverIO></HoveringOverIO>
			<DrawWireFromIo></DrawWireFromIo>
		</>
	);
}

export default App;
