import { createSheep } from "./sheep"
import { pipe } from "fp-ts/lib/function"


test.skip ('SanityTest', () => expect (true).toBe (true) )

test.only ('createSheep', () => testCreateSheep )
test.only ('createArrayOfSheep', () => createArrayOfSheep )

//--------------------------------------------------------

const createFlossy = createSheep (0, 'Flossy', false, {x: 0, y: 0})
const createFred = createSheep (0, 'Fred', true, {x: 100, y: 100})



const testCreateSheep: void =
  pipe (
    createFlossy,
    sheep => expect (sheep.name).toBe ('Flossy'),
  )

const createArrayOfSheep: void =
  pipe (
    [createFlossy, createFred],
    sheepArray => expect (sheepArray.length).toBe (2),
  )

