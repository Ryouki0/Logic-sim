import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../state/store';
import { RgbColor, rgbStringToHsva, Sketch } from '@uiw/react-color';
import { textStlye } from '../../../Constants/commonStyles';
import { DEFAULT_BACKGROUND_COLOR } from '../../../Constants/colors';
import Dropdown from './Dropdown';
import { setShowColorPicker } from '../../../state/slices/mouseEvents';
import { applyColor } from '../../../state/slices/entities';

export default function ColorPicker() {
    const showColorPicker = useSelector((state: RootState) => {return state.mouseEventsSlice.showColorPicker});
    const [currentColorRGB, setCurrentColorRGB] = useState<RgbColor>();
    const colorPickerOption = useSelector((state: RootState) => {return state.mouseEventsSlice.colorPickerOption});
    const dispatch = useDispatch();
    const handleCancel = (e: React.MouseEvent) => {
        dispatch(setShowColorPicker({show: false, id: null}));
    }
    const handleApply = (e: React.MouseEvent) => {
        if(!showColorPicker.id) return;
        dispatch(applyColor({id: showColorPicker.id, color: rgbToString(currentColorRGB!), applyTo: colorPickerOption!}));
        dispatch(setShowColorPicker({show: false, id: null}));
    }

    const rgbToString = (color: RgbColor) => `rgb(${color.r}, ${color.g}, ${color.b})`;

    return <>
    { showColorPicker.show && <div style={{
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 'rgb(40, 40, 40, 0.5)',
        position: 'absolute',
        zIndex: 999
    }}>
        <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: 'inline-flex',
        flexDirection: 'column',
        }}>
            <div data-color-mode='dark'>
            <Sketch
            color={'black'}
            onChange={e => {setCurrentColorRGB(e.rgb)}}>
                
            </Sketch>
            </div>
            <div style={{display: 'inline-flex'}}>
                <div className='clickable-div ColorPickerButton' 
                style={{backgroundColor: DEFAULT_BACKGROUND_COLOR, marginRight: 5, 
                    borderStyle: 'solid', borderWidth: 1, borderColor: 'white'
                    }}
                onClick={handleCancel}>
                    <span style={{color: 'white', alignSelf: 'center'}}>Cancel</span>
                </div>
                <div className='clickable-div ColorPickerButton' 
                style={{backgroundColor: DEFAULT_BACKGROUND_COLOR, 
                    borderStyle: 'solid', borderWidth: 1, borderColor: 'white'
                    }}
                onClick={handleApply}>
                    <span style={{color: 'white', alignSelf: 'center'}}>Apply</span>
                </div>
            </div>
            <Dropdown></Dropdown>
    </div> 
    
    </div>
    }

 </>
}