export interface IPoint {
  readonly x: number, 
  readonly y: number
}
export interface IBox {
  readonly topLeft: IPoint,
  readonly bottomRight: IPoint
}


export enum TSheepBehaviour {
  IDLE, 
  MATING, 
  PREGNANT, 
  BIRTHING, 
  RECOVERING1, 
  RECOVERING2, 
  NEWBORN, 
  LAMB, 
}

export enum TSheepSex {
  MALE, 
  FEMALE, 
}

export interface ISheep {
  readonly id: number,
  readonly name: string // The answer is generated
  readonly sex: TSheepSex
  readonly point: IPoint,
  readonly behaviour: TSheepBehaviour,
  readonly isBranded: boolean,
}


export const createSheep = 
(id: number, name: string, sex: TSheepSex, point: IPoint)
: ISheep => {
  // This is the syntax to create an object from an interface:
  return { 
    // DB fields
    id: id,
    point: point,
    name: name,
    sex: sex,
    behaviour: TSheepBehaviour.IDLE,
    isBranded: false,
  }
}
