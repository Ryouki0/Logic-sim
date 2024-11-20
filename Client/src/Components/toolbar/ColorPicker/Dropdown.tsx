import React, { useState } from 'react';
import { DEFAULT_BACKGROUND_COLOR } from '../../../Constants/colors';
import { useDispatch, useSelector } from 'react-redux';
import { setColorPickerOption } from '../../../state/slices/mouseEvents';
import { RootState } from '../../../state/store';

export default function Dropdown() {
    const colorPickerOption = useSelector((state: RootState) => {return state.mouseEventsSlice.colorPickerOption});
    const dispatch = useDispatch();
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const option = e.target.value === 'Wire' ? 'Wire' : 'WireTree';
        dispatch(setColorPickerOption(option))
    };

    return (
    <select className='clickable-div ColorPickerButton' 
        style={{width: '100%', backgroundColor: DEFAULT_BACKGROUND_COLOR, color: 'white', textAlign: 'center'}} 
        value={colorPickerOption ?? ''} onChange={e => {handleChange(e)}}>
        <option value="Wire" >Apply to Wire</option>
        <option value="WireTree">Apply to Wire Tree</option>
    </select>
  );
}