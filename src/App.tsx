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
function App() {
	const [hello, setHello] = useState<any>();
	useEffect(() => {
		const factory = require ('./hello_react.js');
		//@ts-ignore
		factory().then((instance) => {
			instance._hello_react();
			setHello(instance);
			instance.ccall("hello_react", null, null, null);
			
			const printNumber = instance.cwrap('print_number', null, ['number']);
      
      		// Call the wrapped function
      		printNumber(5);

			// Check the value of global_var
			const globalVar = instance.ccall('get_global_var', 'number', [], []);
			console.log('Global variable:', globalVar);
			return instance;
  	});
	}, []);
	
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
		</>
	);
}

export default App;
