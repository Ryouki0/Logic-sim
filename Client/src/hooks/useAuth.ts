import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../state/slices/misc';
export default function useAuth() {
  
	const dispatch = useDispatch();

	useEffect(() => {
		fetch('https://reacttest-5vuh.onrender.com/api/checkAuth', {
			method: 'GET',
			headers: {
				'Content-type': 'application/json'
			},
			credentials: 'include'
		})
			.then(res => {
				if (!res.ok) {
					return res.json().then(error => {
						console.log(`Error checking authentication: ${error.message}`);
						return Promise.reject(error);
					});
				}
  
				return res.json(); 
			})
			.then(data => {
				console.log('user: ', data.user);
				dispatch(setUser(data.user));
			})
			.catch(error => {
				console.error('An error occurred:', error);
			});
	}, []); 
  
    
}