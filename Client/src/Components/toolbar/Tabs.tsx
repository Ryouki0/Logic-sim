import { Button } from "@mui/material";
import React from "react";
import CustomButton from "./CustomButton";
import { useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { DEFAULT_BORDER_WIDTH } from "../../Constants/defaultDimensions";
import { DEFAULT_BORDER_COLOR } from "../../Constants/colors";

export default function Tabs({setCurrentTab}: {setCurrentTab: React.Dispatch<React.SetStateAction<"general" | "settings">>}){
	const canvasWidth = useSelector((state: RootState) => {return state.misc.canvasWidth;});

	return  <div style={{
		display: 'flex',
		flexDirection: 'column',
		flexGrow: 1,
		bottom: 2*DEFAULT_BORDER_WIDTH,
		alignSelf: 'flex-end',
		justifySelf: 'flex-end',
		position: 'relative',
		marginTop: 'auto',
		width: '100%',
	}}>
        
		<div style={{
			marginTop: 'auto',
			width: '100%',
		}}>
		<div style={{height: DEFAULT_BORDER_WIDTH, backgroundColor: DEFAULT_BORDER_COLOR, padding: 0, 
			marginTop: 'auto', marginBottom: 10,}}></div>
            
            
		</div>
		<div style={{
			display: 'flex',
			textAlign: 'center'
		}}>
			<div className="clickable-div simple-button" 
				onClick={e => {setCurrentTab('general');}}
				style={{
					width: '50%',
					display: 'flex',
					marginLeft: 10,
					alignItems: 'center',
					justifyContent: 'center'
				}}>
				<span>General</span>
			</div>
			<div className="clickable-div simple-button" 
				onClick={e => {setCurrentTab('settings');}}
				style={{
					width: '50%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					marginRight: 10,
				}}>
				<span>Settings</span>
			</div>
		</div>
        
	</div>;
}