export interface TPoint {
  readonly x: number, 
  readonly y: number
}

export enum TSheepBehaviour {
  IDLE, 
  MATING, 
  PREGNANT, 
  BIRTHING, 
  RECOVERING1, 
  RECOVERING2, 
  NEWBORN1, 
  NEWBORN2, 
}

export interface ISheep {
  readonly id: number,
  readonly name: string // The answer is generated
  readonly isMale: boolean
  readonly point: TPoint,
  readonly behaviour: TSheepBehaviour,
  readonly isBranded: boolean,
}


export const createSheep = 
(id: number, name: string, isMale: boolean, point: TPoint)
: ISheep => {
  // This is the syntax to create an object from an interface:
  return { 
    // DB fields
    id: id,
    point: point,
    name: name,
    isMale: isMale,
    behaviour: TSheepBehaviour.IDLE,
    isBranded: false,
  }
}
