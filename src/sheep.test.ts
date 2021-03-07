import { createSheep, ISheep, IPoint, TSheepBehaviour, TSheepSex, IBox } from "./sheepTypes"

// 3rd party imports
import {produce} from 'immer';
import { flow, pipe } from "fp-ts/lib/function"
import { brandSheep, canSheepMate, haveSheepCollided, moveSheepInDirection, updateSheepBasicBehaviour } from "./sheepFunctions";


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
// Test that the sheep remains within the boundary of the field
test.only ('testMoveFlossyUpLeft100', () => testMoveFlossyUpLeft100 () )
test.only ('testMoveFredDownRight100', () => testMoveFredDownRight100 () )
test.only ('testMoveJoeRight100', () => testMoveJoeRight100 () )
test.only ('testMoveJoeDown100', () => testMoveJoeDown100 () )


// One sheep behaviour
test.skip ('testUpdateFemaleSheepBasicBehaviour', () => testUpdateFemaleSheepBasicBehaviour () )
test.skip ('testUpdateMaleSheepBasicBehaviour', () => testUpdateMaleSheepBasicBehaviour () )


// Array of sheep
test.skip ('createArrayOfSheep', () => testCreateArrayOfSheep () )
test.skip ('testUpdateArrayOfSheep', () => testUpdateArrayOfSheep () )
test.skip ('testSheepHaveCollided1', () => testSheepHaveCollidedFalse () )
test.skip ('testSheepHaveCollided2', () => testSheepHaveCollidedTrue () )

// Array of sheep mating behaviour
test.only ('testCanSheepMateTrue', () => testCanSheepMateTrue () )
test.only ('testCanSheepMateFalse', () => testCanSheepMateFalse () )
test.only ('testCanBrandedSheepMateFalse', () => testCanBrandedSheepMateFalse () )


//--------------------------------------------------------

const FIELD_BOX: IBox = {topLeft: {x: 0, y: 0}, bottomRight: {x: 100, y: 100}}
const FIELD_TOPRIGHT: IPoint = {x: 100, y: 0}

// These are useful angles in radians
const DIRECTION_RIGHT     = 0
const DIRECTION_DOWN      = 3/4*(2*Math.PI)
const DIRECTION_DOWNRIGHT = 7/8*(2*Math.PI)
const DIRECTION_UPLEFT    = 3/8*(2*Math.PI)


const createFlossy  = (): ISheep => createSheep (0, 'Flossy', TSheepSex.FEMALE, FIELD_BOX.topLeft)
const createFred    = (): ISheep => createSheep (0, 'Fred', TSheepSex.MALE, FIELD_BOX.bottomRight)

const createJoe = (): ISheep => 
  pipe (
    createSheep (0, 'Joe', TSheepSex.MALE, FIELD_TOPRIGHT),
    sheep => produce (sheep, draft => {draft.isBranded = true})  
  )


const moveSheepOneSquare =
(sheep: ISheep)
: ISheep =>
  produce (sheep, draft => {draft.point.x = sheep.point.x + 1})      



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
  
  const testMoveJoeRight100: () => void =
  flow (
    createJoe,
    moveSheepInDirection (FIELD_BOX) (100, DIRECTION_RIGHT),
    sheep => {
      expect (sheep.point.x).toBe (FIELD_BOX.bottomRight.x)
      expect (sheep.point.y).toBe (FIELD_BOX.topLeft.y)
    }
  )
  
  const testMoveJoeDown100: () => void =
  flow (
    createJoe,
    moveSheepInDirection (FIELD_BOX) (100, DIRECTION_DOWN),
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

const testCanBrandedSheepMateFalse = (): void =>
  pipe (
    [ pipe (createFlossy (), brandSheep), createFred ()],
    sheepArray => canSheepMate (150) (sheepArray[0]) (sheepArray) ,
    result => expect (result).toBe (false),
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

  
