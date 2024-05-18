import React, { useEffect, useRef } from "react";
import "./App.css";
import MainCanvas from "./Components/MainCanvas";
import DisplayAllGates from "./Components/DisplayAllGates";
import CurrentInput from "./Components/CurrentInputs";
import MovableGates from "./Components/MovableGates";
import BottomCanvas from "./Components/BottomCanvas";
import EmptyComponent from "./Components/EmptyComponent";
function App() {
	
	return (
		<>
			{console.log("rendering whole App...")}
			<CurrentInput></CurrentInput>
			<MainCanvas></MainCanvas>
			<BottomCanvas></BottomCanvas>
			<DisplayAllGates></DisplayAllGates>
			<MovableGates></MovableGates>
			<EmptyComponent></EmptyComponent>
		</>
	);
}

export default App;
