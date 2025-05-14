import React, { useState } from 'react';

export default function Counter(props) {
    const [count, setCount] = useState(props.initialValue || 0);
    
    return (
        <div className="counter-component">
            <h2>{props.title || 'Counter'}</h2>
            <div className="counter-display">
                <strong>Count: {count}</strong>
            </div>
            <div className="counter-controls">
                <button 
                    onClick={() => setCount(count - 1)}
                    className="btn btn-outline-danger me-2">
                    Decrement
                </button>
                <button 
                    onClick={() => setCount(count + 1)}
                    className="btn btn-outline-success">
                    Increment
                </button>
            </div>
        </div>
    );
}