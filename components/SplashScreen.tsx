import React, { useEffect, useState } from 'react';
import { SPLASH_IMAGE } from '../constants';

interface SplashScreenProps {
    onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
    const [fading, setFading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFading(true);
            setTimeout(onFinish, 500); // Match CSS animation duration
        }, 2500); // Display time

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden ${fading ? 'animate-fade-out' : ''}`}>
            <div className="absolute inset-0 opacity-60 bg-center bg-cover" style={{ backgroundImage: `url(${SPLASH_IMAGE})` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
            
            <div className="relative z-10 flex flex-col items-center">
                <h1 className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(236,72,153,0.8)] mb-2">
                    ANILEARN
                </h1>
                <div className="w-32 h-1 bg-pink-500 rounded-full mb-4 animate-pulse" />
                <p className="text-pink-200 font-mono text-sm tracking-[0.2em] uppercase">System Initializing...</p>
            </div>

            <div className="absolute bottom-12 right-12">
                 <div className="flex gap-1">
                     <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}/>
                     <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}/>
                     <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}/>
                 </div>
            </div>
        </div>
    );
};