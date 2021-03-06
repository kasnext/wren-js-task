import { createSheep, ISheep } from "./sheep"

// 3rd party imports
import produce from 'immer';
import { flow } from "fp-ts/lib/function"


// Sanity test
test.skip ('SanityTest', () => expect (true).toBe (true) )

// One sheep
test.skip ('createSheep', () => testCreateSheep () )
test.skip ('testMoveOneSheepOneSquare', () => testMoveOneSheepOneSquare () )
test.skip ('testMoveOneSheepRight', () => testMoveOneSheepRight () )
test.skip ('testMoveOneSheepDown', () => testMoveOneSheepDown () )
test.only ('testMoveOneSheepDownRight', () => testMoveOneSheepDownRight () )
test.only ('testMoveOneSheepDownRight100', () => testMoveOneSheepDownRight100 () )

// Array of sheep
test.skip ('createArrayOfSheep', () => testCreateArrayOfSheep () )
test.skip ('testUpdateArrayOfSheep', () => testUpdateArrayOfSheep () )


//--------------------------------------------------------

const createFlossy = () => createSheep (0, 'Flossy', false, {x: 0, y: 0})
const createFred = () => createSheep (0, 'Fred', true, {x: 100, y: 100})

const createArrayOfSheep = () =>
  [createFlossy (), createFred ()]

const moveSheepOneSquare =
(sheep: ISheep) =>
  produce (sheep, draft => {draft.point.x = sheep.point.x + 1})      

// The supplied angle is in radians (between 0 and 2 PI measured anti-clockwise)
// The returned position will be an integer
// The direction should match the HTML canvas, so x increase to the right and y increases towards the bottom 
const moveSheepInDirection = (quantity: number, angle: number) => (sheep: ISheep) =>
  produce (sheep, draft => {
    draft.point.x = sheep.point.x + Math.round (quantity * Math.cos (angle)) 
    draft.point.y = sheep.point.y - Math.round (quantity * Math.sin (angle)) 
  })      
  
    

const moveOneSheepInArrayOneSquare =
(sheep: ISheep[]) => 
  sheep.map ( sheepX => moveSheepOneSquare (sheepX))


//--------------------------------------------------------

const testCreateSheep = 
  flow (
    createFlossy,
    sheep => expect (sheep.name).toBe ('Flossy'),
  )

const testMoveOneSheepOneSquare = 
  flow (
    createFlossy,
    moveSheepOneSquare,
    sheep => expect (sheep.point.x).toBe (1)
  )

  
  const testMoveOneSheepRight = 
  flow (
    createFlossy,
    moveSheepInDirection (1, 0),
    sheep => {
      expect (sheep.point.x).toBe (1)
      expect (sheep.point.y).toBe (0)
    }
  )

  const testMoveOneSheepDown = 
  flow (
    createFlossy,
    moveSheepInDirection (1, 3/4*(2*Math.PI) ),
    sheep => {
      expect (sheep.point.x).toBe (0)
      expect (sheep.point.y).toBe (1)
    }
  )

  const testMoveOneSheepDownRight = 
  flow (
    createFlossy,
    moveSheepInDirection (1, 7/8*(2*Math.PI) ),
    sheep => {
      expect (sheep.point.x).toBe (1)
      expect (sheep.point.y).toBe (1)
    }
  )

  const testMoveOneSheepDownRight100 = 
  flow (
    createFlossy,
    moveSheepInDirection (100, 7/8*(2*Math.PI) ),
    sheep => {
      expect (sheep.point.x).toBe (Math.round(100*(1/Math.SQRT2)))
      expect (sheep.point.y).toBe (Math.round(100*(1/Math.SQRT2)))
    }
  )


//--------------------------------------------------------

const testCreateArrayOfSheep = 
  flow (
    createArrayOfSheep,
    sheepArray => expect (sheepArray.length).toBe (2),
  )


const testUpdateArrayOfSheep = 
  flow (
    createArrayOfSheep,
    moveOneSheepInArrayOneSquare,
    sheepArray => {
      expect (sheepArray.length).toBe (2),
      expect (sheepArray[0].point.x).toBe (1)
    }
  )


