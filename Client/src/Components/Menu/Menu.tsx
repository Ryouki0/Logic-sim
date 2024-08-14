import React from 'react';
import MenuButton from './MenuButton';
import '../../menu.css';
import { useNavigate } from 'react-router-dom';
import '../../login.css';
export default function Menu(){
	const navigate = useNavigate();

	const newProject = () => {
		navigate('/Simulation');
	};

	return <div className='container'>
		<div className="login-box" style={{alignSelf: 'flex-end', justifySelf: 'flex-end'}}>
			<h2>Login</h2>
			<form>
				<div className="user-box">
					<input type="text" name="" required />
					<label>Username</label>
				</div>
				<div className="user-box">
					<input type="password" name="" required />
					<label>Password</label>
				</div>
			</form>
		</div>
		<div className='menu-container' style={{
			alignItems: 'center',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			justifyItems: 'center',
			alignContent: 'center',
			height: '100vh'
		}}>
			<MenuButton buttonText='New Project' fn={newProject}></MenuButton>
			<MenuButton buttonText='Sandbox'></MenuButton>
		</div>
	</div>; 

}