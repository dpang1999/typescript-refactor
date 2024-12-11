import React from 'react';
import Image from 'next/image';
import Card from '@/components/card';


export default function Home() {
    return (
        <div>
            <div className="flex gap-8">
                <Card>
                    <p>This is a default Card with default text</p>
                </Card>
                <div className="rounded-lg border bg-[#191d20] p-12 text-card-foreground shadow-sm">
                    <p className="text-[#FF0000] font-serif">This is red serif text. Defined using #FF0000 and serif</p>
                </div>
                <div className="rounded-md border bg-slate-800 p-1">
                    <Image src="https://i.redd.it/sspw8xquhxsy.jpg" width={500} height={500} alt="Martha Stewart Cow"/>
                </div>
                <div className="rounded-sm border border-[#A16207] bg-gradient-to-r from-red-500 to-blue-500 p-8">
                    <p className="font-[Verdana, Geneva, sans-serif] text-black"> This is black text with a font-family of Verdana, Geneva, sans-serif</p>
                </div>
            </div>
            <div className="text-[#FFFF00] bg-slate-500 border"> {/* This is not considered a card without rounded or padding */}
                <span className="font-[Tahoma,Arial,serif] text-blue-700">Lorem ipsum dolor sit amet, </span>
                <span className="font-[Verdana, Geneva, sans-serif] text-red-500">consectetur adipiscing elit</span>, 
                <span className="font-['Times_New_Roman',Times,serif] text-[#008000]">sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</span> 
                <span className="font-serif text-[#0000FF]">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. </span>
                <span className="font-bold text-[#FF00FF]">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. </span>
                <span className="font-['Times_New_Roman',Times,serif] text-yellow">Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum </span>
            </div>
        </div>
    )
}