import React, { useState, useRef, useEffect } from "react";
import HanziLookupLib from '@/lib/hanziLookupJS/hanzilookup.min';
import { Icon } from "@/components/atoms/Icon/Icon";

export interface HanziLookupProps extends React.HTMLAttributes<HTMLDivElement> {
    /** What background color to use */
    handleSelect: (character: string) => void;
}

type Point = [number, number];
type Stroke = Point[];
type StrokeGroup = Stroke[];

export const HanziLookup = ({
    handleSelect,
    className = '',
    ...props
}: HanziLookupProps) => {
    const isReady = useRef(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const strokeRef = useRef<StrokeGroup>([]);
    const strokeTempRef = useRef<Stroke>([]);
    const [matches, setMatches] = useState<Array<{ character: string, score: number }>>([]);

    const isMobile = () => {
        if (typeof window !== 'undefined') {
            return window.innerWidth <= 768; // Adjust the breakpoint as needed
        }
        return false;
    }

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        strokeRef.current = [];
        strokeTempRef.current = [];
        setMatches([]);
    };

    useEffect(() => {
        const transit = (ok: boolean) => {
            isReady.current = ok;
        };

        HanziLookupLib.init('mmah', transit);
        HanziLookupLib.init('orig', transit);

        if (isMobile()) {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            let isDrawing = false;

            const startDrawing = (event: TouchEvent) => {
                isDrawing = true;
                draw(event);
            };

            const endDrawing = () => {
                isDrawing = false;
                ctx.beginPath();
                if (isReady.current) {
                    lookup();
                }
                strokeRef.current.push(strokeTempRef.current);
                strokeTempRef.current = [];
            };

            const draw = (event: TouchEvent) => {
                if (!isDrawing) return;

                const touch = event.touches[0];
                const rect = canvas.getBoundingClientRect();
                const offsetX = touch.clientX - rect.left;
                const offsetY = touch.clientY - rect.top;

                ctx.lineWidth = 5;
                ctx.lineCap = "round";
                ctx.strokeStyle = "black";

                ctx.lineTo(offsetX, offsetY);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(offsetX, offsetY);

                const point = [offsetX, offsetY] as Point;
                strokeTempRef.current.push(point);
            };

            canvas.addEventListener("touchstart", startDrawing);
            canvas.addEventListener("touchend", endDrawing);
            canvas.addEventListener("touchmove", draw);
            canvas.addEventListener("touchcancel", endDrawing);

            return () => {
                canvas.removeEventListener("touchstart", startDrawing);
                canvas.removeEventListener("touchend", endDrawing);
                canvas.removeEventListener("touchmove", draw);
                canvas.removeEventListener("touchcancel", endDrawing);
            };
        }
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let isDrawing = false;

        const startDrawing = (event: MouseEvent) => {
            isDrawing = true;
            draw(event);
        };

        const endDrawing = () => {
            isDrawing = false;
            ctx.beginPath();
            if (isReady.current) {
                lookup();
            }
            strokeRef.current.push(strokeTempRef.current);
            strokeTempRef.current = [];
        };

        const draw = (event: MouseEvent) => {
            if (!isDrawing) return;

            ctx.lineWidth = 5;
            ctx.lineCap = "round";
            ctx.strokeStyle = "black";

            ctx.lineTo(event.offsetX, event.offsetY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(event.offsetX, event.offsetY);

            const point = [event.offsetX, event.offsetY] as Point;
            strokeTempRef.current.push(point);
        };

        canvas.addEventListener("mousedown", startDrawing);
        canvas.addEventListener("mouseup", endDrawing);
        canvas.addEventListener("mousemove", draw);
        canvas.addEventListener("mouseleave", endDrawing);

        function lookup() {
            // Decompose character from drawing board
            const analyzedChar = new HanziLookupLib.AnalyzedCharacter(strokeRef.current);
            const matcherMMAH = new HanziLookupLib.Matcher("mmah");
            matcherMMAH.match(analyzedChar, 8, function (matches: Array<{ character: string, score: number }>) {
                setMatches(matches);
            });
        }

        return () => {
            canvas.removeEventListener("mousedown", startDrawing);
            canvas.removeEventListener("mouseup", endDrawing);
            canvas.removeEventListener("mousemove", draw);
        };
    }, []);

    return (
        <div className="flex">
            <div className="flex flex-col relative">
                <canvas ref={canvasRef} width="150" height="300" className="border border-gray-300 bg-white cursor-crosshair rounded-xl touch-none"></canvas>
                <div className="flex justify-end mt-1 absolute right-2 bottom-2">
                    <Icon name="delete" className="cursor-pointer w-7 border border-gray-300 bg-white rounded-sm" onClick={clearCanvas}/>
                </div>
            </div>
            <div className="block border border-gray-300 bg-white w-24 h-48 ml-2 overflow-y-auto rounded-xl">
                <div className="grid grid-cols-3 overflow-y-auto">
                {matches.map((match, index) => (
                    <span key={index} className="flex border border-gray-300 bg-white w-8 h-8 items-center justify-center hover:bg-gray-200 cursor-pointer" onClick={() => handleSelect(match.character)}>
                        {match.character}
                    </span>
                ))}
                </div>
            </div>
        </div>
    );
}