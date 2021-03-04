import * as React from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';

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
        <button 
          className = "createSheepButton"
//          onClick   = {() => props.props.sendPlayState (props.eventId)} 
        >
          {'Create Sheep'}
        </button>          <h1>Buttons Area</h1>
        </div>
        <div className="field">
          <canvas ref={canvasRef}/>
        </div>
      </div>
    }

    