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

    const [isOpen, setIsOpen] = useState(false);

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
                <canvas ref={canvasRef} width="200" height="300" className="border border-gray-300 bg-white cursor-crosshair rounded-xl"></canvas>
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