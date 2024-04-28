import React, { useEffect, useRef } from "react";
import "./App.css";
import { AndGate } from "./Components/AndGate";
import MainCanvas from "./Components/MainCanvas";
function App() {
  return (
    <>
    {console.log("rendering whole App...")},
      <MainCanvas></MainCanvas>
      <AndGate></AndGate>
    </>
  );
}

export default App;
