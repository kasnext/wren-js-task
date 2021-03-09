import { ISheep, IPoint, TSheepBehaviour, TSheepSex, IBox } from "./sheepTypes"

// 3rd party imports
import {produce} from 'immer';
import { pipe, flow } from "fp-ts/lib/function"
import * as A from 'fp-ts/lib/Array';
import * as O from 'fp-ts/lib/Option';

const MOVEMENT_QUANTITY = 5

//--------------------------------------------------------------------------------
// Random functions
//--------------------------------------------------------------------------------


export type TGetTrueOrFalse = () => boolean


export const getRandomTrueOrFalse: TGetTrueOrFalse = 
  flow (
    Math.random,
    Math.round,
    value => value === 0
      ? true
      : false
  )

const getRandomSex = (): TSheepSex =>
  getRandomTrueOrFalse ()
    ? TSheepSex.MALE
    : TSheepSex.FEMALE

const getNextFemaleBehviourAfterMating = (getTrueOrFalse: TGetTrueOrFalse): TSheepBehaviour =>
  getTrueOrFalse ()
    ? TSheepBehaviour.BIRTHING
    : TSheepBehaviour.RECOVERING
  


// This returns an angle that is different from the prev angle by an amount up to 90 degrees
// This prevents sudden changes in direction
const getRandomAngle = (prevAngle: number): number =>
  pipe (
    Math.random (),
    value => (value - 0.5) * Math.PI/2,
    value => prevAngle + value
  )

const getRandomValue = (size: number): number =>
  pipe (
    Math.random (),
    value => size * value,
    Math.round
  )

export const getRandomPoint = (size: number): IPoint => {
  return {x: getRandomValue (size), y: getRandomValue(size)}
}


//--------------------------------------------------------------------------------
// Sheep creation
//--------------------------------------------------------------------------------

export const createSheepWithBehaviour = 
(id: number, name: string, sex: TSheepSex, point: IPoint, behaviour: TSheepBehaviour)
: ISheep => {
  // This is the syntax to create an object from an interface:
  return { 
    // DB fields
    id: id,
    point: point,
    name: name,
    sex: sex,
    angle: 0,
    behaviour: behaviour,
    isBranded: false,
  }
}

export const createSheep = 
(id: number, name: string, sex: TSheepSex, point: IPoint)
: ISheep => 
  createSheepWithBehaviour (id, name, sex, point, TSheepBehaviour.IDLE)


export const createNewborn = 
(id: number, name: string, sex: TSheepSex, point: IPoint)
: ISheep =>
  createSheepWithBehaviour (id, name, sex, point, TSheepBehaviour.NEWBORN)


//--------------------------------------------------------------------------------
// Sheep branding
//--------------------------------------------------------------------------------

export const brandSheep = 
(sheep: ISheep)
: ISheep => 
    produce (sheep, draft => {draft.isBranded = true})  


//--------------------------------------------------------------------------------
// Sheep movement
//--------------------------------------------------------------------------------

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

const movePointInDirectionAndLimit = 
(box: IBox) =>
(quantity: number, angle: number) => 
(point: IPoint)
: IPoint =>
  pipe (
    movePointInDirection (quantity, angle) (point),
    limitPointToBox (box)
  )

export const moveSheepInDirection = 
(box: IBox) =>
(quantity: number, angle: number) => 
(sheep: ISheep)
: ISheep =>
  produce (sheep, draft => {
    draft.point = movePointInDirectionAndLimit (box) (quantity, angle) (sheep.point)
  })
  
    
      
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

export const updateSheepArrayPosition =
(box: IBox) =>
(sheepArray: ISheep[])
: ISheep[] =>
  produce (sheepArray, draft => {
    draft.map ( draftSheep => {
      draftSheep.angle = getRandomAngle(draftSheep.angle)
      draftSheep.point = movePointInDirectionAndLimit (box) (MOVEMENT_QUANTITY, draftSheep.angle) (draftSheep.point)
    })
  })

//--------------------------------------------------------------------------------
// Sheep basic behaviour
//--------------------------------------------------------------------------------

export const getSheepNextBasicBehaviour =
(getTrueOrFalse: TGetTrueOrFalse) =>
(sheep: ISheep)
: TSheepBehaviour =>
  sheep.behaviour === TSheepBehaviour.MATING 
  ? sheep.sex === TSheepSex.MALE 
    ? TSheepBehaviour.RECOVERING
    : getNextFemaleBehviourAfterMating (getTrueOrFalse)
  : sheep.behaviour === TSheepBehaviour.BIRTHING
    ? TSheepBehaviour.RECOVERING
    : sheep.behaviour === TSheepBehaviour.RECOVERING
      ? TSheepBehaviour.IDLE
      : sheep.behaviour === TSheepBehaviour.NEWBORN
        ? TSheepBehaviour.LAMB
        : sheep.behaviour === TSheepBehaviour.LAMB
          ? TSheepBehaviour.IDLE
          : sheep.behaviour

  
export const updateSheepBasicBehaviour =
(getTrueOrFalse: TGetTrueOrFalse) =>
(sheep: ISheep)
: ISheep =>
  produce (sheep, draft => {
    draft.behaviour = getSheepNextBasicBehaviour (getTrueOrFalse) (sheep)
  })

export const updateSheepArrayBasicBehaviour =
(getTrueOrFalse: TGetTrueOrFalse) =>
(sheepArray: ISheep[])
: ISheep[] =>
  produce (sheepArray, draft => {
    draft.map ( draftSheep => draftSheep.behaviour = getSheepNextBasicBehaviour (getTrueOrFalse) (draftSheep) )
  })

//--------------------------------------------------------------------------------
// Sheep mating behaviour
//--------------------------------------------------------------------------------

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
  pipe (
    sheepArray,
    A.findFirst ( sheepX =>
      sheepX.behaviour === TSheepBehaviour.IDLE 
      && sheep.behaviour === TSheepBehaviour.IDLE
      && sheepX.sex !== sheep.sex
      && !sheep.isBranded 
      && !sheepX.isBranded
      && haveSheepCollided (distance) (sheep) (sheepX)
    ),
    O.fold (
      () => false,
      () => true
    )
  )

  export const updateSheepArrayMatingBehaviour =
  (distance: number) =>
  (sheepArray: ISheep[])
  : ISheep[] =>
    produce (sheepArray, draft => {
      draft.map ( draftSheep => 
        canSheepMate (distance) (draftSheep) (sheepArray)
          ? draftSheep.behaviour = TSheepBehaviour.MATING
          : undefined 
      )
    })
  
  
export const updateSheepArrayBirthingBehaviour =
(sheepArray: ISheep[])
: ISheep[] => {
  const newSheepArray: ISheep[] = [] 
  sheepArray.map (sheep =>
    sheep.behaviour === TSheepBehaviour.BIRTHING
      ? newSheepArray.push ( createNewborn (sheepArray.length + newSheepArray.length, 'nameless_' + (sheepArray.length + newSheepArray.length), getRandomSex(), sheep.point) )
      : undefined
  )
  return sheepArray.concat (newSheepArray) 
}

//--------------------------------------------------------------------------------
// Sheep combined behaviour
//--------------------------------------------------------------------------------

export const updateSheepArrayBasicAndBirthingBehaviour =
(getTrueOrFalse: TGetTrueOrFalse)
:(sheepArray: ISheep[]) => 
ISheep[] =>
  flow (
    updateSheepArrayBasicBehaviour (getTrueOrFalse),
    updateSheepArrayBirthingBehaviour,
  )

export const updateSheepArrayAllBehaviour = 
(getTrueOrFalse: TGetTrueOrFalse) =>
(distance: number) =>
(sheepArray: ISheep[])
: ISheep[] =>
  pipe (
    updateSheepArrayBasicBehaviour (getTrueOrFalse) (sheepArray),
    updateSheepArrayMatingBehaviour (distance),
    updateSheepArrayBirthingBehaviour,
  )


  export const findSheepAndBrand = 
  (sheepSize: number) =>
  (sheepArray: ISheep[]) =>
  (event: MouseEvent, canvas: HTMLCanvasElement)
  : ISheep[] => {
    const x = event.pageX - canvas.offsetLeft - canvas.clientLeft
    const y = event.pageY - canvas.offsetTop - canvas.clientTop
  
    return pipe (
      sheepArray,
      A.findFirst (sheep => 
        Math.abs (sheep.point.x + sheepSize/2 - x) < sheepSize/2 && 
        Math.abs (sheep.point.y + sheepSize/2 - y) < sheepSize/2
      ),
      O.fold (
        () => sheepArray,
        brandSheepArray (sheepArray)
      )
    )
  }
  
  export const brandSheepArray = 
  (sheepArray: ISheep[]) =>
  (sheep: ISheep)
  : ISheep[] =>
    produce (sheepArray, draft => {
      pipe (
        draft.find (sheepX => sheepX.id === sheep.id),
        sheepX => sheepX 
          ? sheepX.isBranded = true
          : undefined
      )
    })
    
  