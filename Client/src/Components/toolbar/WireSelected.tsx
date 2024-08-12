import React from "react";
import { Wire } from "../../Interfaces/Wire";
import { AMBER, ORANGE, RED_ORANGE } from "../../Constants/colors";

export default function WireSelected({wire} : {wire:Wire}){
   
	return <div style={{justifyContent: 'center', display: 'flex', flexDirection: 'column'}}>
		<div style={{width: 150, height: 10, backgroundColor:ORANGE, alignSelf: 'center', marginTop: '30%'}}>

		</div>
		<span style={{
			color: 'white', 
			fontSize: 16,
			marginTop: 10
		}}>ID: {wire.id.slice(0,6)}...</span>
		<span style={{
			color: 'white', 
			fontSize: 16,
			marginTop: 10}}>
            From: {wire.from?.id.slice(0,6)}
		</span>
		
		<span style={{
			color: 'white', 
			fontSize: 16,
			marginTop: 10}}>Parent: {wire.parent}</span>
	</div>;
}