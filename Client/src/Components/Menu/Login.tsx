import React, { useState } from 'react';
import '../../login.css';
import '../../menu.css';
import '../../index.css';
import { useDispatch } from 'react-redux';
import { setUser } from '../../state/slices/misc';

export default function Login(){
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [isLogin, setIsLogin] = useState(true);

	const dispatch = useDispatch();

	const handleSubmit = () => {
		isLogin ? login(username, password) : register(username, password);
	};

	async function login(username: string, password:string) {
		try {
		  const response = await fetch(`https://reacttest-5vuh.onrender.com`, {
				method: 'POST',
				headers: {
			  'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({ username, password }),
		  });
	  
		  const data = await response.json();
	  
		  if (response.ok) {
				console.log('Login successful:', data.message);
				dispatch(setUser(username));
		  } else {
				console.error('Login failed:', data.error);
		  }
		} catch (error) {
		  console.error('Error:', error);
		}
	}

	async function register(username:string, password:string) {
		try {
		  const response = await fetch(`https://reacttest-5vuh.onrender.com/api/register`, {
				method: 'POST',
				headers: {
			  'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password }),
		  });
	  
		  const data = await response.json();
	  
		  if (response.ok) {
				console.log('Login successful:', data.message);
		  } else {
				console.error('Login failed:', data.error);
		  }
		} catch (error) {
		  console.error('Error:', error);
		}
	  }

	return <>
		<div className="login-box" style={{alignSelf: 'flex-end', justifySelf: 'flex-end'}}>
			<h2>{isLogin ? 'Login' : 'Register'}</h2>
			<form onSubmit={handleSubmit}>
				<div className="user-box">
					<input type="text" name="" required onChange={e => setUsername(e.target.value)}/>
					<label>Username</label>
				</div>
				<div className="user-box">
					<input type="password" name="" required onChange={e => setPassword(e.target.value)}/>
					<label>Password</label>
				</div>
			</form>
			<span style={{marginTop: -30, color: 'rgb(0, 122, 255)', cursor: 'pointer', textDecoration: 'underline'}}
				onClick={e=>{setIsLogin(prev => !prev);}}>{isLogin ? 'Sign up' : 'Sign in'}</span>
			<button className='button' style={{
				margin:'0 auto'
			}} onClick={handleSubmit}>{isLogin ? 'Login' : 'Register'}</button>
		</div>
	</>;
}