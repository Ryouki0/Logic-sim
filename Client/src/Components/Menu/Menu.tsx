import React, { useState } from 'react';
import MenuButton from './MenuButton';
import '../../menu.css';
import { useNavigate } from 'react-router-dom';
import Login from './Login';
import '../../login.css';
import useAuth from '../../hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { changeMisc, MiscBase, setIsInitialLoad, setUser } from '../../state/slices/misc';
import { changeState } from '../../state/slices/entities';
import { entities } from '@Shared/interfaces';
import { textStlye } from '../../Constants/commonStyles';
import Spinner from '../Spinner';

export default function Menu(){
	const navigate = useNavigate();
	useAuth();
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<{isError: boolean, info: string}>({isError: false, info: ''});
	const user = useSelector((state: RootState) => {return state.misc.user;});
	const Simulation = () => {
		navigate('/Simulation');
	};
	const backendUrl = process.env.REACT_APP_BACKEND_URL;
	console.log(`backend url: ${backendUrl}`);
	const handleLogout = () => {
		setLoading(true);
		fetch(`${backendUrl}/api/logout`, {
			method: 'GET',
			credentials: 'include'
		}).then(res => {
			if(!res.ok){
				console.error(`error logging out: ${res.status}`);
				setError({isError: true, info: res.statusText});
				setLoading(false);
				return;
			}

			return res.json();
		}).then(data => {
			console.log(`succesfully logget out: ${data}`);
			setLoading(false);
			dispatch(setUser(null));
		});
	};

	const loadCPU = () => {
		setLoading(true);
		fetch(`${backendUrl}/api/cpu`, {
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
				const miscWithoutUser = JSON.parse(data.misc);
				setLoading(false);
				dispatch(changeState({wires, gates, currentComponent, bluePrints, binaryIO} as entities));
				navigate('/Simulation');
				dispatch(changeMisc({misc: miscWithoutUser as MiscBase}));
				dispatch(setIsInitialLoad(true));
 		})
			.catch(err => {
				setLoading(false);
				console.error(`An error occurred: ${err.message}`);
				setError({isError: true, info: `${err.message}`});
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
			{user && <div style={{
				position: 'absolute',
				right: 20,
				top:20,
			}}>
				<span style={{...textStlye, fontSize: 22}}>Logged in as {user}</span>
			</div>}
			{error?.isError && <div style={{position: 'absolute', backgroundColor: 'red', padding: 15, top: 20, opacity: 0.9}}>
				<span style={{fontSize: 22, color: 'white'}}>{error.info}</span>
			</div>}
			{loading && <div style={{
				position: 'absolute',
				top: 0,
				display: 'inline-flex',
			}}>
				<span style={{...textStlye, fontSize: 22, marginRight: 10, alignSelf: 'center'}}>Loading {'(might take up to 1 minute)'}</span>
				<Spinner style={{width: 30, height: 30, alignSelf: 'center'}}></Spinner>
			</div>}
			<MenuButton buttonText='Simulation' fn={Simulation}></MenuButton>
			<MenuButton buttonText='Load CPU' fn={loadCPU}></MenuButton>
			{user && <MenuButton buttonText='Logout' fn={handleLogout}></MenuButton>}
		</div>
			
			
	</div>;

}