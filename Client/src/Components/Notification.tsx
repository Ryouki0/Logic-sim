import { remove } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { removeNotification } from "../state/slices/mouseEvents";

export const Notification = React.memo(function Notification({notification, idx}:{
	notification: {
		id:string, 
		info: string, 
		status: 'success' | 'error'
	}, idx:number}){

	const [opacity, setOpacity] = useState(1);
	const dispatch = useDispatch();

	useEffect(() => {
		const opacityTimeout = setTimeout(() => {
			setOpacity(0);
		}, 2000);
		const deleteTimeout = setTimeout(() => {
			dispatch(removeNotification({id: notification.id}));
		}, 3000);
		return () => {
			clearTimeout(opacityTimeout);
			clearTimeout(deleteTimeout);
		}
	}, []);

	return <div 
	style={{
				backgroundColor: 'black',
				borderColor: notification?.status === 'success' ? 'green' : 'red',
				borderStyle: 'solid',
				borderWidth: 2,
				color:'white',
				padding: 5,
				paddingLeft: 15,
				paddingRight: 15,
				margin: 5,
				width: '100%',
				borderRadius: 300,
				opacity: opacity,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: 30,
				overflow: 'hidden',
				transition: 'opacity 1s ease-out',
			}}>
				<span>{notification.info}</span>
			</div>
}, (prev: {notification: {id: string, info: string}, idx: number}, next: {notification: {id: string, info: string}, idx: number}) => {
	return prev.notification.id === next.notification.id;
})