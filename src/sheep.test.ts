import { createSheep } from "./sheep"
import { pipe } from "fp-ts/lib/function"


test.skip ('SanityTest', () => expect (true).toBe (true) )

test.only ('createSheep', () => testCreateSheep )

const testCreateSheep: void =
  pipe (
    createSheep (0, 'flossy', true, {x: 0, y: 0}),
    sheep => expect (sheep.name).toBe ('flossy'),
  )

