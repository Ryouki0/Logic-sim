

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Simulation from './Simulation';
import Menu from './Components/Menu/Menu';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import { store } from './state/store';
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);


root.render(
	<Provider store={store}>
		<Router>
			<Routes>
				<Route path='/' element={<Menu></Menu>}/>
				<Route path='/Simulation' element={<Simulation></Simulation>}></Route>
			</Routes>
		</Router>
	</Provider>
  
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
