import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

import { ISheep, TSheepBehaviour, TSheepSex } from "./sheepTypes"
import { createSheep, getRandomPoint } from "./sheepFunctions"

//const FIELD_BOX: IBox = {topLeft: {x: 0, y: 0}, bottomRight: {x: 100, y: 100}}


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
  img.onload = () => 
    canvas.drawImage(img, sheep.point.x, sheep.point.y, imgSize, imgSize)
}

export const Root = (): JSX.Element => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const [sheepArray, setSheepArray] = useState <ISheep[]> ([])
     
      useEffect(() => {
          const canvas = canvasRef.current;
          if (canvas !== null) {
          const context = canvas.getContext('2d');
          if (context !== null) {
            sheepArray.map (displaySheep (context))
          }
        }
      }, [sheepArray])
       
       return <div className="total"
         style={{ width: '700', height: '700', display: "flex", flexDirection: "row"}}
       > 
        <div className="buttonsArea"
             style={{ width: '200px', height: '200px'}}
        >
          <form className="create-sheep">
            <label id="sheepNameLabel" htmlFor="sheepName" className="sr-only">Name:</label>
            <input 
              id="sheepName"
              type='text' 
              className = 'form-control'
              name='sheepNameText'
              placeholder="Name" required autoFocus
            />
            <label id="sheepSexLabel" htmlFor="sheepSex" className="sr-only">Sex</label>
            <select className="form-control">
              <option>Male</option>
              <option>Female</option>
            </select>

            <button 
              className="btn btn-lg btn-primary btn-block"
              onClick   = {() => setSheepArray (
                sheepArray.concat (createSheep (0, 'Flossy', TSheepSex.FEMALE, getRandomPoint()))
              )}
            >
              {'Create Sheep'}
            </button>          
          </form>
        </div>
        <div className="field">
          <canvas className="canvas" ref={canvasRef}/>
        </div>
      </div>
    }

