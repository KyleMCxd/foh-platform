import Image from "next/image";

export default function Logo({ className = "", showText = true }: { className?: string, showText?: boolean }) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Try to load the image logo first - requires user to upload logo.png to public/ */}
            {/* For now, we simulate the look with CSS/Icon to match the requested design */}

            <div className="relative group">
                {/* Logo Icon - Stylized Faders / Equalizer */}
                <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                    <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full h-full drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                    >
                        {/* Background Container - Dark Glass */}
                        <rect x="2" y="2" width="44" height="44" rx="12" fill="#0A0A0A" stroke="url(#logo_gradient)" strokeWidth="2" />

                        {/* Fader Tracks */}
                        <path d="M14 12V36" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                        <path d="M24 12V36" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                        <path d="M34 12V36" stroke="#333" strokeWidth="2" strokeLinecap="round" />

                        {/* Fader Caps (Glow) */}
                        {/* Fader 1 - Low/Mid */}
                        <rect x="11" y="26" width="6" height="4" rx="1" fill="#BC13FE" className="animate-pulse-slow">
                            <animate attributeName="y" values="26;24;26" dur="3s" repeatCount="indefinite" />
                        </rect>

                        {/* Fader 2 - High (Main) */}
                        <rect x="21" y="14" width="6" height="4" rx="1" fill="#00F0FF" className="drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">
                            <animate attributeName="y" values="14;12;14" dur="4s" repeatCount="indefinite" />
                        </rect>

                        {/* Fader 3 - Mid/High */}
                        <rect x="31" y="20" width="6" height="4" rx="1" fill="#BC13FE" className="animate-pulse-slow">
                            <animate attributeName="y" values="20;18;20" dur="5s" repeatCount="indefinite" />
                        </rect>

                        {/* Definitions for Gradients */}
                        <defs>
                            <linearGradient id="logo_gradient" x1="2" y1="2" x2="46" y2="46" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#00F0FF" />
                                <stop offset="100%" stopColor="#BC13FE" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>

            {showText && (
                <div className="flex flex-col justify-center leading-none select-none">
                    <h1 className="text-xl md:text-2xl font-black italic tracking-tighter text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                        style={{ fontFamily: 'system-ui, sans-serif', fontStyle: 'italic' }}>
                        FOH
                    </h1>
                    <span className="text-[10px] md:text-xs font-bold text-white tracking-[0.2em] drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                        ACADEMY
                    </span>
                </div>
            )}
        </div>
    );
}
