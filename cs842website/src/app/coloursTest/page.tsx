import React from 'react';

export default function Home() {
    return (
        <div>
            {/* Red is  FF0000 */}
            <p className="text-[#FF0000]">This is red text. Defined using #FF0000</p>
            <p style={{color: 'red'}}>This is red text. Defined using `red`</p>

            {/* Green is 008000 */}
            <p className="text-[#008000]">This is green text. Defined using #008000</p>
            <p style={{ color: 'green' }}>This is green text. Defined using `green`</p>

            {/* Blue is  0000FF */}
            <p className="text-[#0000FF]">This is blue text. Defined using #0000FF</p>
            <p style={{ color: 'blue' }}>This is blue text. Defined using `blue`</p>

            {/* Yellow is  FFFF00 */}
            <p className="text-[#FFFF00]">This is yellow text. Defined using #FFFF00</p>
            <p style={{ color: 'yellow' }}>This is yellow text. Defined using `yellow`</p>
            
            <p className="text-[#383838]">This is very dark gray text. Defined using #383838.</p>
            
            <p style={{ color: '#FF00FF' }}>This is magenta text.</p>
            <p style={{ color: '#00FFFF' }}>This is cyan text.</p>
            <p style={{ color: '#000000' }}>This is black text.</p>
            <p style={{ color: '#FFFFFF', backgroundColor: '#000000' }}>This is white text with a black background.</p>
        </div>
    );
}