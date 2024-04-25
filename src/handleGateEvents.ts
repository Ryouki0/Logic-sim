import { Dispatch, UnknownAction } from "redux";
import { setObjectClicked } from "./state/mouseEventsSlice";

const handleMouseDown = (
    e: React.MouseEvent, 
    eleRef:React.MutableRefObject<any>, 
    dispatch:Dispatch<UnknownAction>,
    dx: number,
    dy: number,
    setOffset: React.Dispatch<React.SetStateAction<{
        dx: number;
        dy: number;
    }>>) => {
    
    const className = (e.target as HTMLDivElement).classList;
    console.log("className: ", className);
    if(!(className.contains("Gate-container"))){
        return;
    }

    dispatch(setObjectClicked("Gate"));
    
    
    
    const startPos = {
        x: e.clientX - dx,
        y: e.clientY - dy,
    };

    const handleMouseMove = (e: MouseEvent) => {
        const ele = eleRef.current;
        if (!ele) {
            return;
        }

        // How far the mouse has been moved
        const dx = e.clientX - startPos.x;
        const dy = e.clientY - startPos.y;

        // Set the position of element
        ele.style.transform = `translate(${dx}px, ${dy}px)`;

        // Reassign the position of mouse
        setOffset({dx, dy});
    };

    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        dispatch(setObjectClicked(null));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
};

export default handleMouseDown;