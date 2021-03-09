import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

import { IBox, ISheep, TSheepBehaviour, TSheepSex } from "./sheepTypes"
import { createSheep, getRandomPoint, updateSheepArrayAllBehaviour, updateSheepArrayPosition } from "./sheepFunctions"
import { pipe } from 'fp-ts/lib/function';
import * as A from 'fp-ts/lib/Array';
import * as O from 'fp-ts/lib/Option';
import produce from 'immer';

const FIELD_BOX_SIZE: number = 300
const SHEEP_SIZE: number = 30
const SHEEP_BOX_SIZE: number = FIELD_BOX_SIZE - SHEEP_SIZE

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
    canvas.fillText(sheep.name + ' - ' + sheep.behaviour.toString(), sheep.point.x, sheep.point.y)
    canvas.drawImage(img, sheep.point.x, sheep.point.y, imgSize, imgSize)
  }
}


export const Root = (): JSX.Element => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const inputNameRef = useRef<HTMLInputElement>(null)

    const [sheepArray, setSheepArray] = useState <ISheep[]> ([])

    const [inputSex, setInputSex] = useState <TSheepSex>(TSheepSex.MALE)
    const [inputName, setInputName] = useState <string>('')
    const [seconds, setSeconds] = useState(0)

    const findSheepAndBrand = (event: MouseEvent, canvas: HTMLCanvasElement): void => {
      const x = event.pageX - canvas.offsetLeft - canvas.clientLeft
      const y = event.pageY - canvas.offsetTop - canvas.clientTop

      pipe (
        sheepArray,
        A.findFirst (sheep => 
          Math.abs (sheep.point.x + SHEEP_SIZE/2 - x) < SHEEP_SIZE/2 && 
          Math.abs (sheep.point.y + SHEEP_SIZE/2 - y) < SHEEP_SIZE/2
        ),
        O.fold (
          () => undefined,
          brandSheep
        )
      )
    }

    const brandSheep = (sheep: ISheep): void =>
//      alert ('x: ' + sheep.point.x + ' y: ' + sheep.point.y)
      pipe ( 
        produce (sheepArray, draft => {
          pipe (
            draft.find (sheepX => sheepX.id === sheep.id),
            sheepX => sheepX 
              ? sheepX.isBranded = true
              : undefined
          )
        }),
        setSheepArray 
      )


      useEffect(() => {
          const canvas = canvasRef.current;
          if (canvas !== null) {
          const context = canvas.getContext('2d');
          if (context !== null) {
            context.clearRect (FIELD_BOX.topLeft.x, FIELD_BOX.topLeft.y, FIELD_BOX.bottomRight.x, FIELD_BOX.bottomRight.y) 
            sheepArray.map (displaySheep (context))
            canvas.onclick = (event: MouseEvent) => findSheepAndBrand (event, canvas)
          }
        }
      }, [sheepArray])
       
      // Todo - Only use 1 timer effect, and use a counter instead
      // 1 every 20 cycles, update the behaviour and movement
      // 19 out of every 20 cycles, update movement only
      useEffect(() => {
        const interval = setInterval(() => {
          setSeconds(seconds + 1)
          pipe (
            
            seconds % 20 === 0 
              ? updateSheepArrayAllBehaviour (SHEEP_SIZE * 2) (sheepArray)
              : updateSheepArrayPosition (SHEEP_BOX) (sheepArray),
            setSheepArray
          )
        }, 50)
        return () => clearInterval (interval)
      }, [sheepArray])


        const handleSexChange = (event: React.ChangeEvent<HTMLSelectElement>): void =>
          setInputSex(
            pipe (
              sexOptions,
              A.findFirst (option => option.label === event.target.value),
              O.fold (
                () => TSheepSex.MALE,
                option => option.type
              )
            )
          )
        
        const doCreateSheep = (): ISheep => {
          const sheep: ISheep = createSheep (sheepArray.length, inputName, inputSex, getRandomPoint (SHEEP_BOX_SIZE))
          setInputName ('')
          inputNameRef
            ? inputNameRef.current
              ? inputNameRef.current.focus()
            : undefined
          : undefined
          return sheep
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
              value={inputName}
              onChange={event => setInputName(event.target.value)}
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
                inputName !== ''
                  ? setSheepArray (
                      sheepArray.concat (doCreateSheep ())
                    )
                  : undefined
                }
                disabled={inputName===''} 
            >
              {'Create Sheep'}
            </button>          
          </div>
        </div>
        <div className="field">
          <canvas className="canvas" ref={canvasRef} 
            width={FIELD_BOX.bottomRight.x - FIELD_BOX.topLeft.x}
            height={FIELD_BOX.bottomRight.y - FIELD_BOX.topLeft.y}
          />
        </div>
      </div>
    }

