import React, { useEffect, useState } from "react";
import MainCanvas from "./Components/MainCanvas";
import BottomCanvas from "./Components/BottomCanvas";
import DisplayAllGates from "./Components/DisplayAllGates";
import MovableGates from "./Components/MovableGates";
import GlobalInputs from "./Components/GlobalInputs";
import GlobalOutputs from "./Components/GlobalOutputs";
import EmptyComponent from "./Components/EmptyComponent";
import Toolbar from "./Components/toolbar/Toolbar";
import CanvasTop from "./Components/CanvasTop";
import BootstrapLogic from "./Components/bootstrapLogic";
import SelectedGate from "./Components/SelectedGate";
import HoveringOverIO from "./Components/HoveringOverIO";
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
		</>
	);
}

export default App;
