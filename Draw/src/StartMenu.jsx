import { useState } from 'react'
import './App.css'

function StartingMenu() {

  return (
    <>
      <h1>Draw First</h1>
      <h2>a group drawing game</h2>
      <div className="menu">
        <div className="menu-option">
            <button>Create Lobby</button>
        </div>
        <div className="menu-option">
            <input type="text" placeholder="Lobby ID" />
            <button>Join Lobby</button>
        </div>
      </div>
      
    </>
  )
}

export default StartingMenu