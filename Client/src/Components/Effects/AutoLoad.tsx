import React, { useEffect } from 'react';
import { getState } from '../../localDB';
import { set } from 'lodash';
import { changeState } from '../../state/slices/entities';
import { changeMisc, setIsInitialLoad } from '../../state/slices/misc';
import { addNotification } from '../../state/slices/mouseEvents';
import {v4 as uuidv4} from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state/store';
export default function AutoLoad(){
    const dispatch = useDispatch();
    const isInitialLoad = useSelector((state: RootState) => {return state.misc.isInitialLoad});

    useEffect(() => {
        const loadState = async () => {
            const savedState = await getState();
            if(savedState.entities && savedState.misc && !isInitialLoad){
                dispatch(changeState(savedState.entities));
                dispatch(changeMisc({misc: savedState.misc}));
                console.log(`new misc block size: ${savedState.misc.blockSize}`);
                dispatch(setIsInitialLoad(true));
                dispatch(addNotification({id: uuidv4(), info: 'Auto loaded state!', status: 'success'}));
            }
        }
        loadState();
        return () => {}
    }, [])
    return null;
}