import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../state/store";
import { MINIMAL_BLOCKSIZE } from "../Constants/defaultDimensions";
import {Notification} from "./Notification";

const checkNotifications = (prev: {id: string, info: string}[], next: {id:string,info:string}[]) => {
    return prev.length === next.length;
}

export default function Notifications(){
    const notifications = useSelector((state: RootState) => {return state.mouseEventsSlice.notifications}, checkNotifications);

    return <div style={{
        position: 'absolute',
        top: 2*MINIMAL_BLOCKSIZE,
        left: 2*MINIMAL_BLOCKSIZE,
        height: 200,
        width: 250,
        flexDirection:'column',
        display: 'flex',
        zIndex: 3,
    }}>
        {notifications.map((notification, index) => {
            return <Notification notification={notification} idx={index} key={notification.id}></Notification>
        })}
    </div>
}