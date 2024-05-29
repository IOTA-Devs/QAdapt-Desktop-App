import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatusComponentTypes } from "@/types/types";

export default function Status({ status, message }: { status: StatusComponentTypes, message: string }) {
    const getStatusColor = (status: StatusComponentTypes, opacity: number) => {
        const colorStatusRGB = {
            danger: [255, 56, 56],
            warning: [2545, 179, 2],
            caution: [252, 232, 58],
            ok: [86, 240, 0],
            info: [45, 204, 255],
            unavailable: [164, 171, 182]
        };

        const color = colorStatusRGB[status];
        return `rgb(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
    }
    
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="inline-block">
                        <div style={{ backgroundColor: getStatusColor(status, 0.4), border: `1px solid ${getStatusColor(status, 1)}` }} className="flex items-center justify-center rounded-md px-3">
                            <p className="font-semibold">{message}</p>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{message}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}