import React, { useEffect, useRef } from "react";
import "./App.css";
import MainCanvas from "./Components/MainCanvas";
import DisplayAllGates from "./Components/DisplayAllGates";
import CurrentInput from "./Components/CurrentInputs";
import MovableGates from "./Components/MovableGates";
function App() {

	return (
		<>
			{console.log("rendering whole App...")}
			<CurrentInput></CurrentInput>
			<MainCanvas></MainCanvas>
			<DisplayAllGates></DisplayAllGates>
			<MovableGates></MovableGates>
		</>
	);
}

export default App;
