import React, { useEffect, useState } from 'react';
import './GhostPreloader.css';

export default function GhostPreloader({ onComplete }) {
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('Establishing connection...');
    const [isFadingOut, setIsFadingOut] = useState(false);

    const stages = [
        { progress: 15, text: 'Mapping cyber network...' },
        { progress: 35, text: 'Encrypting data channels...' },
        { progress: 55, text: 'Summoning cyber spirits...' },
        { progress: 75, text: 'Loading threat matrix...' },
        { progress: 95, text: 'Revealing the ghost...' },
        { progress: 100, text: 'System Operational' }
    ];

    useEffect(() => {
        let currentStageIdx = 0;
        
        const interval = setInterval(() => {
            if (currentStageIdx < stages.length) {
                const stage = stages[currentStageIdx];
                setProgress(stage.progress);
                setStatusText(stage.text);
                currentStageIdx++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    setIsFadingOut(true);
                    setTimeout(() => {
                        if (onComplete) onComplete();
                    }, 1000); // match transition duration
                }, 800);
            }
        }, 600);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className={`preloader-overlay ${isFadingOut ? 'fade-out' : ''}`} id="preloader">
            <div className="preloader-content-wrapper">
                <div className="ghost-loader-container">
                    <svg className="ghost-svg-loader" height="120" viewBox="0 0 512 512" width="120" xmlns="http://www.w3.org/2000/svg">
                        {/* Ghost body - glowing white/cyan */}
                        <path 
                            className="ghost-body-path" 
                            d="m508.374 432.802s-46.6-39.038-79.495-275.781c-8.833-87.68-82.856-156.139-172.879-156.139-90.015 0-164.046 68.458-172.879 156.138-32.895 236.743-79.495 275.782-79.495 275.782-15.107 25.181 20.733 28.178 38.699 27.94 35.254-.478 35.254 40.294 70.516 40.294 35.254 0 35.254-35.261 70.508-35.261s37.396 45.343 72.65 45.343 37.389-45.343 72.651-45.343c35.254 0 35.254 35.261 70.508 35.261s35.27-40.772 70.524-40.294c17.959.238 53.798-2.76 38.692-27.94z" 
                        />
                        {/* Left eye - cyan glow */}
                        <circle className="ghost-eye-path left" cx="208" cy="225" r="24" />
                        {/* Right eye - cyan glow */}
                        <circle className="ghost-eye-path right" cx="297" cy="225" r="24" />
                    </svg>
                </div>
                
                <div className="atmospheric-quote">
                    <h1 className="quote-heading">
                        VEIL OF DUST<br />
                        TRAIL OF ASH<br />
                        HEART OF ICE
                    </h1>
                    <span className="quote-author">Whispers through memory</span>
                </div>

                <div className="progress-container">
                    <div className="status-label-text">{statusText}</div>
                    <div className="progress-bar-track">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="progress-percentage">{progress}%</div>
                </div>
            </div>
        </div>
    );
}
