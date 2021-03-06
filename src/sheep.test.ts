import { createSheep, ISheep } from "./sheep"

test.skip ('SanityTest', () => expect (true).toBe (true) )

test.only ('createSheep', () => testCreateSheep () )

const testCreateSheep: () => void = () => {
  const sheep: ISheep = createSheep (0, 'flossy', true, {x: 0, y: 0})
   
  expect (sheep.name).toBe( 'flossy')
}

