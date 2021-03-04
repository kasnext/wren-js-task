import * as React from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
 
export const Root = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
     
      useEffect(() => {
          const canvas = canvasRef.current;
          if (canvas !== null) {
          const context = canvas.getContext('2d');
          if (context !== null) {
            context.fillStyle = 'green';
            context.fillRect(20, 10, 200, 100);
          }
        }
      })
       
       return (
           <canvas
               ref={canvasRef} 
               style={{ width: '100px', height: '100px' }}
           />
       );
    }
