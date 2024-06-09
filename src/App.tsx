import React, { useEffect, useState } from "react";
import "./App.css";
import MainCanvas from "./Components/MainCanvas";
import DisplayAllGates from "./Components/DisplayAllGates";
import CurrentInput from "./Components/GlobalInputs";
import MovableGates from "./Components/MovableGates";
import BottomCanvas from "./Components/BottomCanvas";
import EmptyComponent from "./Components/EmptyComponent";
import GlobalOutputs from "./Components/GlobalOutputs";
import SelectedComponent from "./Components/toolbar/SelectedComponent";
import Toolbar from "./Components/toolbar/Toolbar";
function App() {
	const [hello, setHello] = useState<any>();
	useEffect(() => {
		var factory = require ('./hello_react.js');
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
	}, [])
	
	const benchmark = () => {
		
	}
	return (
		<>
			{console.log("rendering whole App...")}
			<Toolbar></Toolbar>
			<CurrentInput></CurrentInput>
			<GlobalOutputs></GlobalOutputs>
			<MainCanvas></MainCanvas>
			<BottomCanvas></BottomCanvas>
			<DisplayAllGates></DisplayAllGates>
			<MovableGates></MovableGates>
			<EmptyComponent></EmptyComponent>
			
		</>
	);
}

export default App;
