import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import './App.css'

function ChooseCategory({setCategory}) {

    const navigate = useNavigate();

    const handleCategory = (event) => {
        const { name } = event.target;
        setCategory(name);
        navigate('/game');
    };

    return (
        <div>
            <h1 className='title'>Choose a Category</h1>
            <button name="Animals" onClick={handleCategory}>Animals</button>
            <button name="Food" onClick={handleCategory}>Food</button>
            <button name="Places" onClick={handleCategory}>Places</button>
            <button name="Objects" onClick={handleCategory}>Objects</button>
        </div>
    )
}

export default ChooseCategory;