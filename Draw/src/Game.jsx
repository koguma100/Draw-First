import { useState, useEffect, useRef, use } from 'react';
import { useWebSocket } from './WebSocketProvider.jsx';
import './App.css';
import './Game.css';

function Game({category}) {
    // Establish WebSocket connection when component mounts
    const { ws, connectWebSocket, disconnectWebSocket, connected } = useWebSocket();
    const wsRef = useRef(null);
    const canvasRef = useRef(null);

    const isDrawingRef = useRef(false);
    const color = useRef('black');

    useEffect(() => {
        connectWebSocket();
        wsRef.current = ws;
        return () => {
            disconnectWebSocket();
        };
    }, []);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
    
        // Set up drawing parameters
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'black';
    
        const startDrawing = (event) => {
            isDrawingRef.current = true;
            const rect = canvas.getBoundingClientRect(); // Get canvas position relative to the viewport
            const x = event.clientX - rect.left; // Adjust for canvas offset
            const y = event.clientY - rect.top;  // Adjust for canvas offset
            ctx.beginPath();  // Start a new path when we start drawing
            ctx.moveTo(x, y);  // Move the context to the starting point

            if (connected) {
                wsRef.current.send(
                  JSON.stringify({
                    type: 'startDrawing',
                    x, y,
                    color,
                  })
                );
              }
        };
    
        const stopDrawing = () => {
          isDrawingRef.current = false;
          ctx.openPath();
        };
    
        const draw = (event) => {
            if (isDrawingRef.current == false) return;
        
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left; // Adjust for canvas offset
            const y = event.clientY - rect.top;  // Adjust for canvas offset
            ctx.strokeStyle = color.current;
            ctx.lineTo(x, y);
            ctx.stroke();

            // Send drawing data (coordinates) to WebSocket
            if (connected) {
                wsRef.current.send(
                JSON.stringify({
                    type: 'drawing',
                    x, y,
                    color,
                })
                );
            }
        };
        
        // Set the canvas size dynamically
        const resizeCanvas = () => {
            const canvasWidth = canvas.clientWidth;
            const canvasHeight = canvas.clientHeight;
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
        };
    
        resizeCanvas();  // Call on mount

        window.addEventListener('resize', resizeCanvas); // Listen to window resize
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mousemove', draw);
    
        return () => {
          window.removeEventListener('resize', resizeCanvas);
          canvas.removeEventListener('mousedown', startDrawing);
          canvas.removeEventListener('mouseup', stopDrawing);
          canvas.removeEventListener('mousemove', draw);
        };
      }, [color.current]);

    return (
        <div className="game-screen">
            <h1 className="title">Make Some Guesses!</h1>
                <div className="canvas-log-wrapper">
                    <div className="drawing-features">
                        <canvas ref={canvasRef}></canvas>
                        <div className="colors">
                            <div className="color" style={{backgroundColor: 'black'}} onClick={() => color.current='black'}></div>
                            <div className="color" style={{backgroundColor: 'brown'}} onClick={() => color.current='brown'}></div>
                            <div className="color" style={{backgroundColor: 'purple'}} onClick={() => color.current='purple'}></div>
                            <div className="color" style={{backgroundColor: 'blue'}} onClick={() => color.current='blue'}></div>
                            <div className="color" style={{backgroundColor: 'green'}} onClick={() => color.current='green'}></div>
                            <div className="color" style={{backgroundColor: 'yellow'}} onClick={() => color.current='yellow'}></div>
                            <div className="color" style={{backgroundColor: 'orange'}} onClick={() => color.current='orange'}></div>
                            <div className="color" style={{backgroundColor: 'red'}} onClick={() => color.current='red'}></div>
                            <div className="color" style={{backgroundColor: 'pink'}} onClick={() => color.current='pink'}></div>
                            <div className="color" style={{backgroundColor: 'white'}} onClick={() => color.current='white'}></div>
                        </div>
                    </div>
                <div className="guess-log">
                    <input type="text" placeholder="Enter your guess here"></input>
                    <button>Submit</button>
                    <div className="guesses"></div>
                </div>
            </div>
            
            
        </div>
    )
}

export default Game;