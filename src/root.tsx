import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

import { IBox, IPoint, ISheep, TSheepBehaviour, TSheepSex } from "./sheepTypes"
import { createSheep, findSheepAndBrand, getRandomTrueOrFalse, updateSheepArrayAllBehaviour, updateSheepArrayPosition } from "./sheepFunctions"
import { pipe } from 'fp-ts/lib/function';
import * as A from 'fp-ts/lib/Array';
import * as O from 'fp-ts/lib/Option';

const FIELD_BOX_SIZE: number = 300
const SHEEP_SIZE: number = 30
const SHEEP_BOX_SIZE: number = FIELD_BOX_SIZE - SHEEP_SIZE
const SHEEP_BOX_CENTRE: IPoint = {x: SHEEP_BOX_SIZE/2, y: SHEEP_BOX_SIZE/2}

// This represents the coordinates for the field
const FIELD_BOX: IBox = {topLeft: {x: 0, y: 0}, bottomRight: {x: FIELD_BOX_SIZE, y: FIELD_BOX_SIZE}}
// The represents the area in which the sheep can move
// It is smaller than the field because the sheep has an area
const SHEEP_BOX: IBox = {topLeft: {x: 0, y: 0}, bottomRight: {x: FIELD_BOX_SIZE - SHEEP_SIZE, y: FIELD_BOX_SIZE - SHEEP_SIZE}}

const sexOptions = [
  {
    label: "Male",
    type: TSheepSex.MALE,
  },
  {
    label: "Female",
    type: TSheepSex.FEMALE,
  },
]

const getSheepImageName =
(sheep: ISheep)
: string =>
  sheep.isBranded
    ? 'branded'
    : sheep.sex === TSheepSex.MALE
      ? 'male'
      : 'female'

const getSheepImageSize =
(sheep: ISheep)
: number =>
  sheep.behaviour === TSheepBehaviour.NEWBORN
    ? 10
    : sheep.behaviour === TSheepBehaviour.LAMB
      ? 20
      : 40

 

const displaySheep = 
(canvas: CanvasRenderingContext2D) => 
(sheep: ISheep) => {
  const img = new Image();        
  const imgSize = getSheepImageSize (sheep)
  img.src = '../media/' + getSheepImageName (sheep) + '.png'
  img.onload = () => {
    canvas.fillText(sheep.name, sheep.point.x, sheep.point.y)
    canvas.drawImage(img, sheep.point.x, sheep.point.y, imgSize, imgSize)
  }
}


export const Root = (): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inputNameRef = useRef<HTMLInputElement>(null)

  const [sheepArrayState, setSheepArrayState] = useState <ISheep[]> ([])

  const [inputSexState, setInputSexState] = useState <TSheepSex>(TSheepSex.MALE)
  const [inputNameState, setInputNameState] = useState <string>('')
  const [secondsState, setSecondsState] = useState(0)
  const [pauseState, setPauseState] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas !== null) {
      const context = canvas.getContext('2d')
      if (context !== null) {
        context.clearRect (FIELD_BOX.topLeft.x, FIELD_BOX.topLeft.y, FIELD_BOX.bottomRight.x, FIELD_BOX.bottomRight.y) 
        sheepArrayState.map (displaySheep (context))
        canvas.onclick = (event: MouseEvent) => pipe (
          findSheepAndBrand (SHEEP_SIZE) (sheepArrayState) (event, canvas),
          setSheepArrayState
        )          
      }
    }
  }, [sheepArrayState, pauseState])
       
  // 1 every 10 cycles, update the behaviour only
  // 9 out of every 10 cycles, update movement only
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsState(secondsState + 1)
      !pauseState
      ? pipe (
        secondsState % 10 === 0 
          ? updateSheepArrayAllBehaviour (getRandomTrueOrFalse) (SHEEP_SIZE * 2) (sheepArrayState)
          : updateSheepArrayPosition (SHEEP_BOX) (sheepArrayState),
        setSheepArrayState
      )
      : undefined
    }, 50)
    return () => clearInterval (interval)
  }, [sheepArrayState, pauseState])


  const handleSexChange = (event: React.ChangeEvent<HTMLSelectElement>): void =>
    setInputSexState(
      pipe (
        sexOptions,
        A.findFirst (option => option.label === event.target.value),
        O.fold (
          () => TSheepSex.MALE,
          option => option.type
        )
      )
    )
  
  const doCreateSheep = (): void => {
    pipe (
      createSheep (sheepArrayState.length, inputNameState, inputSexState, SHEEP_BOX_CENTRE),
      sheep => sheepArrayState.concat (sheep), // have to be explicit here with the params as concat is overloaded
      setSheepArrayState
    )
    setInputNameState ('')
    inputNameRef
      ? inputNameRef.current
        ? inputNameRef.current.focus()
      : undefined
    : undefined
  }          

  return <div className="total"
      style={{ width: '700', height: '700', display: "flex", flexDirection: "row"}}
    > 
    <div className="buttonsArea"
          style={{ width: '200px', height: '200px'}}
    >
      <div className="create-sheep">
        <label id="sheepNameLabel" htmlFor="sheepName" className="sr-only">Name:</label>
        <input 
          id="sheepName"
          type='text' 
          ref={inputNameRef}
          className='form-control'
          name='sheepNameText'
          placeholder="Name" required autoFocus
          value={inputNameState}
          onChange={event => setInputNameState(event.target.value)}
        />
        <label id="sheepSexLabel" htmlFor="sheepSex" className="sr-only">Sex</label>
        <select className="form-control" onChange={handleSexChange}>
          {sexOptions.map(option => 
            <option value={option.label}>{option.label}</option>
          )}
        </select>

        <button  
          className="btn btn-lg btn-primary btn-block"
          onClick   = {() => 
            inputNameState !== ''
              ? doCreateSheep ()
              : undefined
          }
          disabled={inputNameState === ''} 
        >
          {'Create Sheep'}
        </button>          
        <button  
          className="btn btn-lg btn-primary btn-block"
          onClick   = {() => setPauseState (!pauseState)}
        >
          {pauseState ? 'Play' : 'Pause'}
        </button>          
        <button  
          className="btn btn-lg btn-primary btn-block"
          onClick   = {() => setSheepArrayState ([])}
          disabled = {sheepArrayState.length === 0}
        >
          {'Reset'}
        </button>          
      </div>
    </div>
    <div className="field">
      <label id="brandLabel" className="brandLabel" htmlFor="fieldCanvas">Click on a sheep to brand it</label>
      <canvas id="fieldCanvas" className="canvas" ref={canvasRef} 
        width={FIELD_BOX.bottomRight.x - FIELD_BOX.topLeft.x}
        height={FIELD_BOX.bottomRight.y - FIELD_BOX.topLeft.y}
      />
    </div>
  </div>
}

