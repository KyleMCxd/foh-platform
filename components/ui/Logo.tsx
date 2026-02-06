import Image from "next/image";

export default function Logo({ className = "", showText = true }: { className?: string, showText?: boolean }) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Try to load the image logo first - requires user to upload logo.png to public/ */}
            {/* For now, we simulate the look with CSS/Icon to match the requested design */}

            <div className="relative group">
                {/* Icon Container with Blue Gradient Border/Glow */}
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-b from-[#00F0FF] to-[#0080FF] p-[2px] shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                    <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center relative overflow-hidden">
                        {/* Sliders Graphic Simulation */}
                        <div className="flex gap-1.5 items-center justify-center h-full">
                            {/* Slider 1 */}
                            <div className="h-4/6 w-1 bg-[#00F0FF] rounded-full relative">
                                <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_5px_#00F0FF]"></div>
                            </div>
                            {/* Slider 2 (Arrow) */}
                            <div className="h-[90%] w-1 bg-gradient-to-t from-[#00F0FF]/20 to-[#00F0FF] rounded-full relative">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#00F0FF]"></div>
                            </div>
                            {/* Slider 3 */}
                            <div className="h-4/6 w-1 bg-[#00F0FF] rounded-full relative">
                                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_5px_#00F0FF]"></div>
                            </div>
                        </div>
                    </div>
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
