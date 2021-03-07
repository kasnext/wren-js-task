import { createSheep, ISheep, IPoint, TSheepBehaviour, TSheepSex, IBox } from "./sheepTypes"

// 3rd party imports
import {produce} from 'immer';
import { flow, pipe } from "fp-ts/lib/function"
import { isUndefined } from "util";


export const brandSheep = 
(sheep: ISheep)
: ISheep => 
    produce (sheep, draft => {draft.isBranded = true})  


// The supplied angle is in radians (between 0 and 2 PI measured anti-clockwise)
// The returned position will be an integer
// The direction should match the HTML canvas, so x increase to the right and y increases towards the bottom 
export const movePointInDirection = 
(quantity: number, angle: number) => 
(oldPoint: IPoint)
: IPoint => {
  return {
    x: oldPoint.x + Math.round (quantity * Math.cos (angle)),
    y: oldPoint.y - Math.round (quantity * Math.sin (angle)) 
  }
}
      
const limitNumberToRange = 
(start: number, end: number, value: number)
: number => 
    Math.min ( Math.max (value, start), end)

// Limit a given point to the dimensions of the supplied box
const limitPointToBox = 
(box: IBox) =>
(oldPoint: IPoint)
: IPoint => {
  return {
    x: limitNumberToRange (box.topLeft.x, box.bottomRight.x, oldPoint.x),
    y: limitNumberToRange (box.topLeft.y, box.bottomRight.y, oldPoint.y)
  }      
}      

export const moveSheepInDirection = 
(box: IBox) =>
(quantity: number, angle: number) => 
(sheep: ISheep)
: ISheep =>
  produce (sheep, draft => 
    {draft.point = pipe (
      movePointInDirection (quantity, angle) (sheep.point),
      limitPointToBox (box)
    )}
  )
  
    
// The sheep have collided if the distance between them is less than or equal to the supplied distance
export const haveSheepCollided = 
(distance: number) =>
(sheep1: ISheep) => 
(sheep2: ISheep)
: boolean => 
  pipe (
    Math.pow (sheep1.point.x - sheep2.point.x, 2) + Math.pow (sheep1.point.y - sheep2.point.y, 2),
    Math.sqrt,
    dist => dist <= distance
  )

// This searches through the array looking for a sheep that meets the following criteria
// 1/ Of the opposite sex
// 2/ Within the supplied distance
// 3/ In the IDLE state
// Note that this does not "pair up" the sheep, so multiple male sheep could be mating with the same female, and vice versa
export const canSheepMate =
(distance: number) =>
(sheep: ISheep) =>
(sheepArray: ISheep[])
: boolean =>
  !isUndefined (
    sheepArray.find ( sheepX =>
      sheepX.behaviour === TSheepBehaviour.IDLE 
      && sheep.behaviour === TSheepBehaviour.IDLE
      && sheepX.sex !== sheep.sex
      && !sheep.isBranded 
      && !sheepX.isBranded
      && haveSheepCollided (distance) (sheep) (sheepX)
    ) 
  )


export const getSheepNextBasicBehaviour =
(sheep: ISheep)
: TSheepBehaviour =>
  sheep.behaviour === TSheepBehaviour.MATING 
  ? sheep.sex === TSheepSex.MALE 
    ? TSheepBehaviour.RECOVERING1
    : TSheepBehaviour.PREGNANT
  : sheep.behaviour === TSheepBehaviour.PREGNANT
    ? TSheepBehaviour.BIRTHING
    : sheep.behaviour === TSheepBehaviour.BIRTHING
      ? TSheepBehaviour.RECOVERING1
      : sheep.behaviour === TSheepBehaviour.RECOVERING1
        ? TSheepBehaviour.RECOVERING2
        : sheep.behaviour === TSheepBehaviour.RECOVERING2
          ? TSheepBehaviour.IDLE
          : sheep.behaviour

  
export const updateSheepBasicBehaviour =
(sheep: ISheep)
: ISheep =>
  produce (sheep, draft => {
    draft.behaviour = getSheepNextBasicBehaviour (sheep)
  })


