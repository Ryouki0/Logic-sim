import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { saveState } from '../../localDB';
import useRedrawCanvas from '../../hooks/useRedrawCanvas';
import { addNotification } from '../../state/slices/mouseEvents';
import { v4 as uuidv4 } from 'uuid';

export default function AutoSave(){
    const entities = useSelector((state: RootState) => {return state.entities});
    const misc = useSelector((state: RootState) => {return state.misc});

    const entittiesRef = useRef(entities);
    const miscRef = useRef(misc);
    const dispatch = useDispatch();
    useEffect(() => {
        entittiesRef.current = entities;
        miscRef.current = misc;
    }, [entities, misc]);

    useEffect(() => {
        const interval = setInterval(() => {
            saveState({entities: entittiesRef.current, misc:miscRef.current});
            dispatch(addNotification({id: uuidv4(), info: 'Auto saved state!', status: 'success'}));
        }, 120000);

        return () => {
            clearInterval(interval);
        }
    }, [])
    return null;
}