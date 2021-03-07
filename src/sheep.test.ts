import { createSheep, ISheep, IPoint, TSheepBehaviour, TSheepSex, IBox } from "./sheep"

// 3rd party imports
import {produce} from 'immer';
import { flow, pipe } from "fp-ts/lib/function"
import { isUndefined } from "util";


// Sanity test
test.skip ('SanityTest', () => expect (true).toBe (true) )

// One sheep
test.skip ('createSheep', () => testCreateSheep () )

// One sheep moving
test.only ('testMoveFlossyOneSquare', () => testMoveFlossyOneSquare () )
test.only ('testMoveFlossyRight', () => testMoveFlossyRight () )
test.only ('testMoveFlossyDown', () => testMoveFlossyDown () )
test.only ('testMoveFlossyDownRight', () => testMoveFlossyDownRight () )
test.only ('testMoveFlossyDownRight100', () => testMoveFlossyDownRight100 () )
// Test that it remains within the boundary of the field
test.only ('testMoveFlossyUpLeft100', () => testMoveFlossyUpLeft100 () )
test.only ('testMoveFredDownRight100', () => testMoveFredDownRight100 () )

// One sheep behaviour
test.skip ('testUpdateFemaleSheepBasicBehaviour', () => testUpdateFemaleSheepBasicBehaviour () )
test.skip ('testUpdateMaleSheepBasicBehaviour', () => testUpdateMaleSheepBasicBehaviour () )


// Array of sheep
test.skip ('createArrayOfSheep', () => testCreateArrayOfSheep () )
test.skip ('testUpdateArrayOfSheep', () => testUpdateArrayOfSheep () )
test.skip ('testSheepHaveCollided1', () => testSheepHaveCollidedFalse () )
test.skip ('testSheepHaveCollided2', () => testSheepHaveCollidedTrue () )

// Array of sheep mating behaviour
test.skip ('testCanSheepMateTrue', () => testCanSheepMateTrue () )
test.skip ('testCanSheepMateFalse', () => testCanSheepMateFalse () )


//--------------------------------------------------------

const FIELD_BOX = {topLeft: {x: 0, y:0}, bottomRight: {x: 100, y:100}}

// These are useful angles in radians
const DIRECTION_RIGHT     = 0
const DIRECTION_DOWN      = 3/4*(2*Math.PI)
const DIRECTION_DOWNRIGHT = 7/8*(2*Math.PI)
const DIRECTION_UPLEFT    = 3/8*(2*Math.PI)


const createFlossy  = (): ISheep => createSheep (0, 'Flossy', TSheepSex.FEMALE, FIELD_BOX.topLeft)
const createFred    = (): ISheep => createSheep (0, 'Fred', TSheepSex.MALE, FIELD_BOX.bottomRight)


const moveSheepOneSquare =
(sheep: ISheep)
: ISheep =>
  produce (sheep, draft => {draft.point.x = sheep.point.x + 1})      


// The supplied angle is in radians (between 0 and 2 PI measured anti-clockwise)
// The returned position will be an integer
// The direction should match the HTML canvas, so x increase to the right and y increases towards the bottom 
const movePointInDirection = 
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

const moveSheepInDirection = 
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
const haveSheepCollided = 
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
const canSheepMate =
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


const getSheepNextBasicBehaviour =
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

  
const updateSheepBasicBehaviour =
(sheep: ISheep)
: ISheep =>
  produce (sheep, draft => {
    draft.behaviour = getSheepNextBasicBehaviour (sheep)
  })


//--------------------------------------------------------

const createArrayOfSheep1 = (): ISheep[] =>
  [createFlossy (), createFred ()]

const moveOneSheepInArrayOneSquare =
(sheep: ISheep[])
: ISheep[] => 
  sheep.map ( sheepX => moveSheepOneSquare (sheepX))

//--------------------------------------------------------

const testCreateSheep: () => void =
  flow (
    createFlossy,
    sheep => expect (sheep.name).toBe ('Flossy'),
  )

const testMoveFlossyOneSquare: () => void = 
  flow (
    createFlossy,
    moveSheepOneSquare,
    sheep => expect (sheep.point.x).toBe (1)
  )

  
const testMoveFlossyRight: () => void =
  flow (
    createFlossy,
    moveSheepInDirection (FIELD_BOX) (1, DIRECTION_RIGHT),
    sheep => {
      expect (sheep.point.x).toBe (1)
      expect (sheep.point.y).toBe (0)
    }
  )

const testMoveFlossyDown: () => void =
  flow (
    createFlossy,
    moveSheepInDirection (FIELD_BOX) (1, DIRECTION_DOWN),
    sheep => {
      expect (sheep.point.x).toBe (0)
      expect (sheep.point.y).toBe (1)
    }
  )


const testMoveFlossyDownRight: () => void =
  flow (
    createFlossy,
    moveSheepInDirection (FIELD_BOX) (1, DIRECTION_DOWNRIGHT ),
    sheep => {
      expect (sheep.point.x).toBe (1)
      expect (sheep.point.y).toBe (1)
    }
  )


const testMoveFlossyDownRight100: () => void =
  flow (
    createFlossy,
    moveSheepInDirection (FIELD_BOX) (100, DIRECTION_DOWNRIGHT ),
    sheep => {
      expect (sheep.point.x).toBe (Math.round(100*(1/Math.SQRT2)))
      expect (sheep.point.y).toBe (Math.round(100*(1/Math.SQRT2)))
    }
  )

const testMoveFlossyUpLeft100: () => void =
  flow (
    createFlossy,
    moveSheepInDirection (FIELD_BOX) (100, DIRECTION_UPLEFT),
    sheep => {
      expect (sheep.point.x).toBe (FIELD_BOX.topLeft.x)
      expect (sheep.point.y).toBe (FIELD_BOX.topLeft.y)
    }
  )

  const testMoveFredDownRight100: () => void =
  flow (
    createFred,
    moveSheepInDirection (FIELD_BOX) (100, DIRECTION_DOWNRIGHT),
    sheep => {
      expect (sheep.point.x).toBe (FIELD_BOX.bottomRight.x)
      expect (sheep.point.y).toBe (FIELD_BOX.bottomRight.y)
    }
  )

  


//--------------------------------------------------------

const testCreateArrayOfSheep: () => void =
  flow (
    createArrayOfSheep1,
    sheepArray => expect (sheepArray.length).toBe (2),
  )


const testUpdateArrayOfSheep: () => void =
  flow (
    createArrayOfSheep1,
    moveOneSheepInArrayOneSquare,
    sheepArray => {
      expect (sheepArray.length).toBe (2),
      expect (sheepArray[0].point.x).toBe (1)
    }
  )

const testSheepHaveCollidedFalse = (): void => 
  pipe (
    haveSheepCollided (140) (createFlossy ()) (createFred ()) ,
    result => expect (result).toBe (false),
  )

const testSheepHaveCollidedTrue = (): void =>
  pipe (
    haveSheepCollided (150) (createFlossy ()) (createFred ()) ,
    result => expect (result).toBe (true),
  )

const testCanSheepMateFalse: () => void =
  flow (
    createArrayOfSheep1,
    sheepArray => canSheepMate (140) (sheepArray[0]) (sheepArray) ,
    result => expect (result).toBe (false),
  )

const testCanSheepMateTrue: () => void =
  flow (
    createArrayOfSheep1,
    sheepArray => canSheepMate (150) (sheepArray[0]) (sheepArray) ,
    result => expect (result).toBe (true),
  )

  

const compareSheepBehaviour = 
(behaviour: TSheepBehaviour) => 
(sheep: ISheep)
: ISheep => 
  {
    expect (sheep.behaviour).toBe (behaviour)
    return sheep
  }

  const testUpdateFemaleSheepBasicBehaviour = (): void => 
  pipe (
    createFlossy (),
    compareSheepBehaviour (TSheepBehaviour.IDLE),
    updateSheepBasicBehaviour,
    compareSheepBehaviour (TSheepBehaviour.IDLE),
    sheep => produce (sheep, draft => {draft.behaviour = TSheepBehaviour.MATING} ),
    compareSheepBehaviour (TSheepBehaviour.MATING),
    updateSheepBasicBehaviour,
    compareSheepBehaviour (TSheepBehaviour.PREGNANT),
    updateSheepBasicBehaviour,
    compareSheepBehaviour (TSheepBehaviour.BIRTHING),
    updateSheepBasicBehaviour,
    compareSheepBehaviour (TSheepBehaviour.RECOVERING1),
    updateSheepBasicBehaviour,
    compareSheepBehaviour (TSheepBehaviour.RECOVERING2),
    updateSheepBasicBehaviour,
    compareSheepBehaviour (TSheepBehaviour.IDLE),
    sheep => expect (sheep.behaviour).toBe (TSheepBehaviour.IDLE) 
  )

const testUpdateMaleSheepBasicBehaviour = (): void => 
pipe (
  createFred (),
  compareSheepBehaviour (TSheepBehaviour.IDLE),
  updateSheepBasicBehaviour,
  compareSheepBehaviour (TSheepBehaviour.IDLE),
  sheep => produce (sheep, draft => {draft.behaviour = TSheepBehaviour.MATING} ),
  compareSheepBehaviour (TSheepBehaviour.MATING),
  updateSheepBasicBehaviour,
  compareSheepBehaviour (TSheepBehaviour.RECOVERING1),
  updateSheepBasicBehaviour,
  compareSheepBehaviour (TSheepBehaviour.RECOVERING2),
  updateSheepBasicBehaviour,
  compareSheepBehaviour (TSheepBehaviour.IDLE),
  sheep => expect (sheep.behaviour).toBe (TSheepBehaviour.IDLE) 
)

  
