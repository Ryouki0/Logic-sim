import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { getEntities, getState, saveEntities, saveState } from '../../localDB';
import { changeState } from '../../state/slices/entities';
import { changeMisc, Misc, MiscBase } from '../../state/slices/misc';
import { addNotification } from '../../state/slices/mouseEvents';
import {v4 as uuidv4} from 'uuid';
export default function SaveButton(){
    const entities = useSelector((state: RootState) => {return state.entities});
    const misc = useSelector((state: RootState) => {return state.misc});
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();

    const loadState = async() =>{
        setIsLoading(true);
        const newState = await getState();
        const newMisc = newState.misc as MiscBase;
        const newEntities = newState.entities;
        dispatch(changeState(newEntities));
        dispatch(changeMisc({misc: newMisc}));
        setIsLoading(false);
        dispatch(addNotification({id: uuidv4(), info: 'Successfully loaded state!', status: 'success'}));
    }

    const handleSaveState = async() => {
        saveState({entities: entities, misc:misc});
        dispatch(addNotification({id: uuidv4(), info: 'Saved state!', status: 'success'}));
    }

    return <div style={{display: 'flex'}}>
                <button className='clickable-div simple-button'
                style={{
                    width: '50%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 5,
                    fontSize: 17,
                    margin: 10,
                }}  onClick={handleSaveState}>
                Save
            </button>
            <button className='clickable-div simple-button' style={{
                marginLeft: 5,
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: 17,
                margin: 10,
                width: '50%',
                marginRight: 10,
            }} onClick={e=>{loadState()}}>Load</button>
        </div>
}