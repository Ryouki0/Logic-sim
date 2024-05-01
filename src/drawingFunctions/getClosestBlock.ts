import { MINIMAL_BLOCKSIZE } from "../Constants/defaultDimensions";
export const getClosestBlock = (x:number, y:number) => {
    const distanceX = x % MINIMAL_BLOCKSIZE;
    const distanceY = y % MINIMAL_BLOCKSIZE;

    //console.log(`distanceX: ${distanceX} distanceY: ${distanceY}`);

    if(distanceX >= (MINIMAL_BLOCKSIZE / 2)){
      x += MINIMAL_BLOCKSIZE - distanceX;
    }
    else if(distanceX < (MINIMAL_BLOCKSIZE/2)){
      x -= distanceX;
    }
    if(distanceY >= (MINIMAL_BLOCKSIZE/2)){
      y += MINIMAL_BLOCKSIZE - distanceY;
    }
    else if(distanceY < (MINIMAL_BLOCKSIZE/2)){
      y -= distanceY;
    }
    return {roundedX: x, roundedY: y};
  }