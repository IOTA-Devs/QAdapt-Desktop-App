import { format, subDays, subMonths } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/contexts/authContext";
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
import { convertDateToYYYYMMDD } from "@/util/util.helper";
import { DashboardGeneralData, Test } from "@/types/types";
import AnimatedNumberCounter from "@/components/custom/animated-number-counter";

export default function Dashboard() {
    const { APIProtected } = useContext(AuthContext);
    const [generalData, setGeneralData] = useState<DashboardGeneralData>({
        totalTests: 0,
        successfulTests: 0,
        failedTests: 0,
        selfHealedScripts: 0
    });

    const [date, setDate] = useState<DateRange | undefined>({
        from: subMonths(new Date(), 3),
        to: new Date()
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        if (!date || !date.from || !date.to) return;

        // Fetch general data
        APIProtected.get("api/dashboard/general").then((response) => {
            setGeneralData({
                totalTests: response.data.dashboard_data.total_tests,
                successfulTests: response.data.dashboard_data.successful_tests,
                failedTests: response.data.dashboard_data.failed_tests,
                selfHealedScripts: response.data.dashboard_data.self_healed_scripts
            });
        });

        // Fetch the most recent tests
        APIProtected.get(`api/dashboard/tests_table_data?start_date=${convertDateToYYYYMMDD(date.from)}&end_date=${convertDateToYYYYMMDD(date.to)}`).then((response) => {
            console.log(response.data);
        });

        // Fetch table data for recent tests
        await APIProtected.get(`api/tests?recent=true&limit=10`).then((response) => {
            const testsRes: Test[] = response.data.tests.map((test: any) => {
                return {
                    testId: test.test_id,
                    scriptId: test.script_id,
                    name: test.name,
                    startTimestamp: test.start_timestamp,
                    endTimestamp: test.end_timestamp,
                    status: test.status
                } as Test;
            });

            console.log(testsRes);
        });
    }

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
                        <CardContent className="text-4xl font-bold">
                            <AnimatedNumberCounter start={Math.floor(generalData.totalTests * 0.95)} end={generalData.totalTests} durationInMs={1000} />
                        </CardContent>
                    </Card>
                    <Card className="w-full">
                        <CardHeader>
                           <CardTitle>Successfull Tests</CardTitle>
                        </CardHeader>
                        <CardContent className="text-4xl font-bold">
                            <AnimatedNumberCounter start={Math.floor(generalData.successfulTests * 0.95)} end={generalData.successfulTests} durationInMs={1000} />
                        </CardContent>
                    </Card>
                    <Card className="w-full">
                        <CardHeader>
                           <CardTitle>Failed Tests</CardTitle>
                        </CardHeader>
                        <CardContent className="text-4xl font-bold">
                            <AnimatedNumberCounter start={Math.floor(generalData.failedTests * 0.95)} end={generalData.failedTests} durationInMs={1000} />
                        </CardContent>
                    </Card>
                    <Card className="w-full">
                        <CardHeader>
                           <CardTitle>Self-Healed Scripts</CardTitle>
                        </CardHeader>
                        <CardContent className="text-4xl font-bold">
                            <AnimatedNumberCounter start={Math.floor(generalData.selfHealedScripts * 0.95)} end={generalData.selfHealedScripts} durationInMs={1000} />
                        </CardContent>
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