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
  BIRTHING, 
  RECOVERING, 
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
  readonly angle: number,
  readonly behaviour: TSheepBehaviour,
  readonly isBranded: boolean,
}


