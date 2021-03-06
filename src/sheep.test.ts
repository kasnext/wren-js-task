import { createSheep, ISheep } from "./sheep"

// 3rd party imports
import produce from 'immer';
import { pipe } from "fp-ts/lib/function"


test.skip ('SanityTest', () => expect (true).toBe (true) )

test.skip ('createSheep', () => testCreateSheep )
test.skip ('createArrayOfSheep', () => testCreateArrayOfSheep )
test.only ('testUpdateArrayOfSheep', () => testUpdateArrayOfSheep )

//--------------------------------------------------------

const createFlossy = createSheep (0, 'Flossy', false, {x: 0, y: 0})
const createFred = createSheep (0, 'Fred', true, {x: 100, y: 100})

const createArrayOfSheep: ISheep[] =
  [createFlossy, createFred]

const updateSheepPos: (sheep: ISheep) => ISheep =
(sheep: ISheep) =>
  produce (sheep, draft => {draft.point.x = sheep.point.x + 1})      

const updateArrayOfSheep: (sheep: ISheep[]) => ISheep[] =
(sheep: ISheep[]) => 
  sheep.map ( sheepX => updateSheepPos (sheepX))



const testCreateSheep: void =
  pipe (
    createFlossy,
    sheep => expect (sheep.name).toBe ('Flossy'),
  )

const testCreateArrayOfSheep: void =
  pipe (
    createArrayOfSheep,
    sheepArray => expect (sheepArray.length).toBe (2),
  )

const testUpdateArrayOfSheep: void =
  pipe (
    createArrayOfSheep,
    updateArrayOfSheep,
    sheepArray => {
      expect (sheepArray.length).toBe (2),
      expect (sheepArray[0].point.x).toBe (1)
    }
  )

