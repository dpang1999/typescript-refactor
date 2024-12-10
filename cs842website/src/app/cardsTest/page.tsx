import React from 'react';
import Image from 'next/image';
import Card from '@/components/card';


export default function Home() {
    return (
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
    )
}