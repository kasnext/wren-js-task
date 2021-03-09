import { ISheep, IPoint, TSheepBehaviour, TSheepSex, IBox } from "./sheepTypes"

// 3rd party imports
import {produce} from 'immer';
import { flow, pipe } from "fp-ts/lib/function"
import { createSheep, brandSheep, canSheepMate, haveSheepCollided, moveSheepInDirection, updateSheepArrayBasicBehaviour, updateSheepBasicBehaviour, updateSheepArrayBasicAndBirthingBehaviour, TGetTrueOrFalse } from "./sheepFunctions";


// Sanity test
test.only ('SanityTest', () => expect (true).toBe (true) )

// One sheep
test.only ('createSheep', () => testCreateSheep () )

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
test.only ('testUpdateFemaleSheepBasicBehaviourThatReproduces', () => testUpdateFemaleSheepBasicBehaviourThatReproduces () )
test.only ('testUpdateFemaleSheepBasicBehaviourThatDoesNotReproduce', () => testUpdateFemaleSheepBasicBehaviourThatDoesNotReproduce () )
test.only ('testUpdateMaleSheepBasicBehaviour1', () => testUpdateMaleSheepBasicBehaviour (getTrue) )
test.only ('testUpdateMaleSheepBasicBehaviour2', () => testUpdateMaleSheepBasicBehaviour (getFalse) )


// Array of sheep
test.only ('createArrayOfSheep', () => testCreateArrayOfSheep () )
test.only ('testUpdateArrayOfSheep', () => testUpdateArrayOfSheep () )
test.only ('testSheepHaveCollided1', () => testSheepHaveCollidedFalse () )
test.only ('testSheepHaveCollided2', () => testSheepHaveCollidedTrue () )

// Array of sheep mating behaviour
test.only ('testCanSheepMateTrue', () => testCanSheepMateTrue () )
test.only ('testCanSheepMateFalse', () => testCanSheepMateFalse () )
test.only ('testCanBrandedSheepMateFalse', () => testCanBrandedSheepMateFalse () )

// Array of sheep birthing behaviour
test.only ('testFemaleSheepBasicBehaviour', () => testFemaleSheepBasicBehaviour () )
test.only ('testFemaleSheepBirthingBehaviour', () => testFemaleSheepBirthingBehaviour () )


//--------------------------------------------------------

const TEST_FIELD_BOX: IBox = {topLeft: {x: 0, y: 0}, bottomRight: {x: 100, y: 100}}
const TEST_FIELD_TOPRIGHT: IPoint = {x: 100, y: 0}

// These are useful angles in radians
const DIRECTION_RIGHT     = 0
const DIRECTION_DOWN      = 3/4*(2*Math.PI)
const DIRECTION_DOWNRIGHT = 7/8*(2*Math.PI)
const DIRECTION_UPLEFT    = 3/8*(2*Math.PI)


const createFlossy  = (): ISheep => createSheep (0, 'Flossy', TSheepSex.FEMALE, TEST_FIELD_BOX.topLeft)
const createFred    = (): ISheep => createSheep (0, 'Fred', TSheepSex.MALE, TEST_FIELD_BOX.bottomRight)

const createJoe = (): ISheep => 
  pipe (
    createSheep (0, 'Joe', TSheepSex.MALE, TEST_FIELD_TOPRIGHT),
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
    moveSheepInDirection (TEST_FIELD_BOX) (1, DIRECTION_RIGHT),
    sheep => {
      expect (sheep.point.x).toBe (1)
      expect (sheep.point.y).toBe (0)
    }
  )

const testMoveFlossyDown: () => void =
  flow (
    createFlossy,
    moveSheepInDirection (TEST_FIELD_BOX) (1, DIRECTION_DOWN),
    sheep => {
      expect (sheep.point.x).toBe (0)
      expect (sheep.point.y).toBe (1)
    }
  )


const testMoveFlossyDownRight: () => void =
  flow (
    createFlossy,
    moveSheepInDirection (TEST_FIELD_BOX) (1, DIRECTION_DOWNRIGHT ),
    sheep => {
      expect (sheep.point.x).toBe (1)
      expect (sheep.point.y).toBe (1)
    }
  )


const testMoveFlossyDownRight100: () => void =
  flow (
    createFlossy,
    moveSheepInDirection (TEST_FIELD_BOX) (100, DIRECTION_DOWNRIGHT ),
    sheep => {
      expect (sheep.point.x).toBe (Math.round(100*(1/Math.SQRT2)))
      expect (sheep.point.y).toBe (Math.round(100*(1/Math.SQRT2)))
    }
  )

const testMoveFlossyUpLeft100: () => void =
  flow (
    createFlossy,
    moveSheepInDirection (TEST_FIELD_BOX) (100, DIRECTION_UPLEFT),
    sheep => {
      expect (sheep.point.x).toBe (TEST_FIELD_BOX.topLeft.x)
      expect (sheep.point.y).toBe (TEST_FIELD_BOX.topLeft.y)
    }
  )

  
  const testMoveFredDownRight100: () => void =
  flow (
    createFred,
    moveSheepInDirection (TEST_FIELD_BOX) (100, DIRECTION_DOWNRIGHT),
    sheep => {
      expect (sheep.point.x).toBe (TEST_FIELD_BOX.bottomRight.x)
      expect (sheep.point.y).toBe (TEST_FIELD_BOX.bottomRight.y)
    }
  )
  
  const testMoveJoeRight100: () => void =
  flow (
    createJoe,
    moveSheepInDirection (TEST_FIELD_BOX) (100, DIRECTION_RIGHT),
    sheep => {
      expect (sheep.point.x).toBe (TEST_FIELD_BOX.bottomRight.x)
      expect (sheep.point.y).toBe (TEST_FIELD_BOX.topLeft.y)
    }
  )
  
  const testMoveJoeDown100: () => void =
  flow (
    createJoe,
    moveSheepInDirection (TEST_FIELD_BOX) (100, DIRECTION_DOWN),
    sheep => {
      expect (sheep.point.x).toBe (TEST_FIELD_BOX.bottomRight.x)
      expect (sheep.point.y).toBe (TEST_FIELD_BOX.bottomRight.y)
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

const compareSheepInArrayBehaviourByIndex = 
(behaviour: TSheepBehaviour) =>
(index: number) =>
(sheepArray: ISheep[])
: ISheep[] => {
  compareSheepBehaviour (behaviour) (sheepArray[index])
  return sheepArray
}

const pipeableArrayLengthCheck = 
(expectedLength: number) =>
(sheepArray: ISheep[])
: ISheep[] => {
  expect (sheepArray.length).toBe (expectedLength)
  return sheepArray
}


const compareSheepBehaviour = 
(behaviour: TSheepBehaviour) => 
(sheep: ISheep)
: ISheep => 
  {
    expect (sheep.behaviour).toBe (behaviour)
    return sheep
  }

// We need the getTrue and getFalse to test the randomness of the reproduction
const getTrue: TGetTrueOrFalse = 
  () => true 

const getFalse: TGetTrueOrFalse = 
  () => false


const testUpdateFemaleSheepBasicBehaviourThatReproduces = (): void => 
  pipe (
    createFlossy (),
    compareSheepBehaviour (TSheepBehaviour.IDLE),
    updateSheepBasicBehaviour (getTrue),
    compareSheepBehaviour (TSheepBehaviour.IDLE),
    sheep => produce (sheep, draft => {draft.behaviour = TSheepBehaviour.MATING} ),
    compareSheepBehaviour (TSheepBehaviour.MATING),
    updateSheepBasicBehaviour (getTrue),
    compareSheepBehaviour (TSheepBehaviour.BIRTHING),
    updateSheepBasicBehaviour (getTrue),
    compareSheepBehaviour (TSheepBehaviour.RECOVERING),
    updateSheepBasicBehaviour (getTrue),
    compareSheepBehaviour (TSheepBehaviour.IDLE),
    () => undefined
  )

const testUpdateFemaleSheepBasicBehaviourThatDoesNotReproduce = (): void => 
  pipe (
    createFlossy (),
    compareSheepBehaviour (TSheepBehaviour.IDLE),
    updateSheepBasicBehaviour (getFalse),
    compareSheepBehaviour (TSheepBehaviour.IDLE),
    sheep => produce (sheep, draft => {draft.behaviour = TSheepBehaviour.MATING} ),
    compareSheepBehaviour (TSheepBehaviour.MATING),
    updateSheepBasicBehaviour (getFalse),
    compareSheepBehaviour (TSheepBehaviour.RECOVERING),
    updateSheepBasicBehaviour (getFalse),
    compareSheepBehaviour (TSheepBehaviour.IDLE),
    () => undefined
  )

  
const testUpdateMaleSheepBasicBehaviour = (getTrueOrFalse: TGetTrueOrFalse): void => 
  pipe (
    createFred (),
    compareSheepBehaviour (TSheepBehaviour.IDLE),
    updateSheepBasicBehaviour (getTrueOrFalse),
    compareSheepBehaviour (TSheepBehaviour.IDLE),
    sheep => produce (sheep, draft => {draft.behaviour = TSheepBehaviour.MATING} ),
    compareSheepBehaviour (TSheepBehaviour.MATING),
    updateSheepBasicBehaviour (getTrueOrFalse),
    compareSheepBehaviour (TSheepBehaviour.RECOVERING),
    updateSheepBasicBehaviour (getTrueOrFalse),
    compareSheepBehaviour (TSheepBehaviour.IDLE),
    () => undefined
  )
  
  
  const testFemaleSheepBasicBehaviour = (): void =>
  pipe (
    createArrayOfSheep1 (),
    compareSheepInArrayBehaviourByIndex (TSheepBehaviour.IDLE) (0),
    pipeableArrayLengthCheck (2),
    sheepArray => produce (sheepArray, draft => {draft[0].behaviour = TSheepBehaviour.MATING} ),
    compareSheepInArrayBehaviourByIndex (TSheepBehaviour.MATING) (0),
    updateSheepArrayBasicBehaviour (getTrue),
    compareSheepInArrayBehaviourByIndex (TSheepBehaviour.BIRTHING) (0),
    updateSheepArrayBasicBehaviour (getTrue),
    compareSheepInArrayBehaviourByIndex (TSheepBehaviour.RECOVERING) (0),
    pipeableArrayLengthCheck (2),
    () => undefined
  )

 

  
  const testFemaleSheepBirthingBehaviour = (): void =>
  pipe (
    createArrayOfSheep1 (),
    compareSheepInArrayBehaviourByIndex (TSheepBehaviour.IDLE) (0),
    pipeableArrayLengthCheck (2),
    sheepArray => produce (sheepArray, draft => {draft[0].behaviour = TSheepBehaviour.MATING} ),
    compareSheepInArrayBehaviourByIndex (TSheepBehaviour.MATING) (0),
    updateSheepArrayBasicAndBirthingBehaviour (getTrue),
    pipeableArrayLengthCheck (3),
    compareSheepInArrayBehaviourByIndex (TSheepBehaviour.BIRTHING) (0),
    compareSheepInArrayBehaviourByIndex (TSheepBehaviour.NEWBORN) (2),
    updateSheepArrayBasicAndBirthingBehaviour (getTrue),
    pipeableArrayLengthCheck (3),
    compareSheepInArrayBehaviourByIndex (TSheepBehaviour.RECOVERING) (0),
    compareSheepInArrayBehaviourByIndex (TSheepBehaviour.LAMB) (2),
    updateSheepArrayBasicAndBirthingBehaviour (getTrue),
    pipeableArrayLengthCheck (3),
    compareSheepInArrayBehaviourByIndex (TSheepBehaviour.IDLE) (0),
    compareSheepInArrayBehaviourByIndex (TSheepBehaviour.IDLE) (2),
    () => undefined
  )



  
