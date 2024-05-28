import * as React from "react"
import { format, subDays } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function Dashboard() {
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: subDays(new Date(), 3),
        to: new Date()
    });

    return (
        <>
            <h2 className="text-3xl py-5 font-bold">Dashboard</h2>

            <div className="mb-3">
                <div className="flex justify-end">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                "w-[300px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                date.to ? (
                                    <>
                                        {format(date.from, "LLL dd, y")} -{" "}
                                        {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                                ) : (
                                    <span>Pick a date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={setDate}
                                    numberOfMonths={2}
                                />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                <div className="flex flex-row gap-3">
                    <Card className="w-full">
                        <CardHeader>
                           <CardTitle>Total Tests</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="w-full">
                        <CardHeader>
                           <CardTitle>Successfull Tests</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="w-full">
                        <CardHeader>
                           <CardTitle>Failed Tests</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="w-full">
                        <CardHeader>
                           <CardTitle>Self-Healed Scripts</CardTitle>
                        </CardHeader>   
                    </Card>
                </div>

                <div className="flex flex-row gap-3">
                    <Card className="w-[70%]">
                        <CardHeader>
                           <CardTitle>Tests Ran</CardTitle>
                        </CardHeader> 
                    </Card>

                    <Card className="w-[30%]">
                        <CardHeader>
                           <CardTitle>Recent Tests</CardTitle>
                        </CardHeader> 
                    </Card>
                </div>
            </div>
        </>
    );
}