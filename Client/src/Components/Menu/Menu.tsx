import React from 'react';
import MenuButton from './MenuButton';
import '../../menu.css';
import { useNavigate } from 'react-router-dom';
import Login from './Login';
import '../../login.css';
import useAuth from '../../hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { setUser } from '../../state/slices/misc';
import { changeState } from '../../state/slices/entities';
import { entities } from '@Shared/interfaces';

export default function Menu(){
	const navigate = useNavigate();
	useAuth();
	const dispatch = useDispatch();
	const user = useSelector((state: RootState) => {return state.misc.user;});
	const Simulation = () => {
		navigate('/Simulation');
	};

	const handleLogout = () => {
		fetch(`http://localhost:3002/api/logout`, {
			method: 'GET',
			credentials: 'include'
		}).then(res => {
			if(!res.ok){
				console.error(`error logging out: ${res.status}`);
				return;
			}

			return res.json();
		}).then(data => {
			console.log(`succesfully logget out: ${data}`);
			dispatch(setUser(null));
		});
	};

	const loadCPU = () => {
		fetch(`http://localhost:3002/api/cpu`, {
			method: 'GET',
			credentials: 'include'
		})
			.then(res => {
				if (!res.ok) {
					throw new Error(`Error loading CPU: ${res.status} ${res.statusText}`);
				}
				return res.json();
			})
			.then(data => {
				console.log(`Successfully loaded CPU`);
				const wires = JSON.parse(data.wires);
				const gates = JSON.parse(data.gates);
				const currentComponent = JSON.parse(data.currentComponent);
				const bluePrints = JSON.parse(data.bluePrints);
				const binaryIO = JSON.parse(data.binaryIO);
				dispatch(changeState({wires, gates, currentComponent, bluePrints, binaryIO} as entities));
 		})
			.catch(err => {
				console.error(`An error occurred: ${err.message}`);
			});
	};

	return <div className='container'>
		{!user && <Login></Login>}
		<div className='menu-container' style={{
			alignItems: 'center',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			justifyItems: 'center',
			alignContent: 'center',
			height: '100vh'
		}}>
			<MenuButton buttonText='Simulation' fn={Simulation}></MenuButton>
			<MenuButton buttonText='Load CPU' fn={loadCPU}></MenuButton>
			{user && <MenuButton buttonText='Logout' fn={handleLogout}></MenuButton>}
		</div>
			
			
	</div>;

}