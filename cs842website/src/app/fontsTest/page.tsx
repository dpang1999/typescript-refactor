import React from 'react';

export default function Home() {
    return (
        <div>

            <p className="font-sans">This is sans font.</p>
            <p style={{fontFamily: 'font-sans'}}>This is red text. Defined using `red`</p>

            <p className="font-serif font-semibold">This is serif font with semibold</p>
            <p style={{ fontFamily: 'font-serif font-semibold' }}>This is green text. Defined using `green`</p>

            <p className="font-[Verdana, Geneva, sans-serif]">This is a Verdana, Geneva, sans-serif font family</p>
            <p style={{ fontFamily: 'Verdana, Geneva, sans-serif' }}>This is blue text. Defined using `blue`</p>

            <p className="font-[Tahoma,Arial,serif]">This is a Tahoma, Arial, sans-serif font family</p>
            <p style={{ fontFamily: 'Tahoma,Arial,serif' }}>This is a Tahoma, Arial, sane-serif font family without using Tailwind</p>
            
            <p className="font-['Times_New_Roman',Times,serif]">This is Times New Roman, Times, serif font family.</p>
            
            <p style={{ color: '#FF00FF' }}>This is magenta text.</p>
            <p style={{ color: '#00FFFF' }}>This is cyan text.</p>
            <p style={{ color: '#000000' }}>This is black text.</p>
            <p style={{ color: '#FFFFFF', backgroundColor: '#000000' }}>This is white text with a black background.</p>
        </div>
    );
}