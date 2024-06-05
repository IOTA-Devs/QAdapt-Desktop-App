import { formatNumbers } from "@/util/util.helper";
import { useEffect, useRef, useState } from "react";

export default function AnimatedNumberCounter({ start, end, durationInMs }: { start: number, end: number, durationInMs: number }) {
    const [currentNum, setCurrentNum] = useState<number>(start);

    const startTimestamp = useRef<number | null>();
    const requestId = useRef<number | null>();

    useEffect(() => {
        setCurrentNum(start);
        startTimestamp.current = null;

        const increment = (timestamp: number) => {
            if (!startTimestamp.current) {
                startTimestamp.current = timestamp;
            }

            const progress = timestamp - startTimestamp.current;
            const newNum = Math.floor(progress * (end - start) / durationInMs);

            if (start + newNum >= end) {
                setCurrentNum(end);
                return;
            }

            setCurrentNum(start + newNum);
            requestId.current = window.requestAnimationFrame(increment);
        }

        requestId.current = window.requestAnimationFrame(increment);

        return () => {
            if (requestId.current) {
                window.cancelAnimationFrame(requestId.current);
            }
        }
    }, [start, end, durationInMs]);

    return (
        <>
            <p>{formatNumbers(currentNum)}</p>
        </>
    );
}