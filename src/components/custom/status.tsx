import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatusComponentTypes } from "@/types/types";

export default function Status({ status, message }: { status: StatusComponentTypes, message: string }) {
    const getStatusColor = (status: StatusComponentTypes) => {
        const colorStatusToHexMap = {
            danger: "#FF3838",
            warning: "#FFB302",
            caution: "#FCE83A",
            ok: "#56F000",
            info: "#2DCCFF",
            unavailable: "#A4ABB6"
        };

        return colorStatusToHexMap[status];
    }
    
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span style={{ background: getStatusColor(status) }} className="block rounded-full h-3 w-3"></span>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{message}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}