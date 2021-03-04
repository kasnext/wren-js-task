import * as React from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';

const displaySheep = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const canvas = canvasRef.current;
  if (canvas !== null) {
    const context = canvas.getContext('2d');
    if (context !== null) {
      const img = new Image();        
      img.src = '../media/sheep.gif';        
      img.onload = () => 
        context.drawImage(img, 0, 0)
    }
  }
}

export const Root = (): JSX.Element => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
     
      useEffect(() => {
          const canvas = canvasRef.current;
          if (canvas !== null) {
          const context = canvas.getContext('2d');
          if (context !== null) {
            context.fillStyle = 'green';
            context.fillRect(20, 10, 300, 300);
          }
        }
      })
       
       return <div className="total"
         style={{ width: '400px', height: '400px', display: "flex", flexDirection: "row"}}
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
              onClick   = {() => displaySheep (canvasRef)} 
            >
              {'Create Sheep'}
            </button>          
            {/* <img src="../media/sheep.gif" height="50%" width="50%" alt="Sheep.gif" />             */}
          </form>
        </div>
        <div className="field">
          <canvas ref={canvasRef}/>
        </div>
      </div>
    }

