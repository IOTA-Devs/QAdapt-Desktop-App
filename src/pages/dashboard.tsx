import { format, subMonths } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
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
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { convertDateToYYYYMMDD, getRelativeTime } from "@/util/util.helper";
import { DashboardData, StatusComponentTypes, Test } from "@/types/types";
import AnimatedNumberCounter from "@/components/custom/animated-number-counter";
import { PersistenceContext } from "@/contexts/persistenceContext";
import { ColumnDef } from "@tanstack/react-table";
import Status from "@/components/custom/status";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/custom/data-table";
import { Bar, BarChart, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

export default function Dashboard() {
    const { saveDashboardData, dashboardData } = useContext(PersistenceContext);
    const { APIProtected } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [dashboard, setDashboard] = useState<DashboardData>({
        generalData: {
            totalTests: 0,
            successfulTests: 0,
            failedTests: 0,
            selfHealedScripts: 0
        },
        recentTests: [],
        testsGraphData: {
            labels: [],
            data: []
        },
        dateRange: {
            from: subMonths(new Date(), 3),
            to: new Date()
        }
    });
    const [loading, setLoading] = useState<boolean>(false);

    const [date, setDate] = useState<DateRange | undefined>({
        from: subMonths(new Date(), 3),
        to: new Date()
    });
    const [prevDate, setPrevDate] = useState<DateRange | undefined>();

    useEffect(() => {
        if (prevDate && (prevDate.from !== date?.from || prevDate.to !== date?.to)) {
            fetchDashboardData();
            return;
        }

        if (dashboardData) {
            setDashboard(dashboardData);

            setDate(dashboardData.dateRange);
            return;
        }
        fetchDashboardData();
    }, [date]);
    
    const fetchDashboardData = async () => {
        if (!date || !date.from || !date.to) return;

        setLoading(true);
        try {
            const [generalData, graphData, recentTests] = await Promise.all([
                APIProtected.get(`api/dashboard/general`),
                APIProtected.get(`api/dashboard/tests_table_data?start_date=${convertDateToYYYYMMDD(date.from)}&end_date=${convertDateToYYYYMMDD(date.to)}`),
                APIProtected.get(`api/tests?recent=true&limit=10`)
            ]);
    
            const testsRes: Test[] = recentTests.data.tests.map((test: any) => {
                return {
                    testId: test.test_id,
                    scriptId: test.script_id,
                    name: test.name,
                    startTimestamp: test.start_timestamp,
                    endTimestamp: test.end_timestamp,
                    status: test.status
                } as Test;
            });
    
            const data = {
                generalData: {
                    totalTests: generalData.data.dashboard_data.total_tests,
                    successfulTests: generalData.data.dashboard_data.successful_tests,
                    failedTests: generalData.data.dashboard_data.failed_tests,
                    selfHealedScripts: generalData.data.dashboard_data.self_healed_scripts
                },
                testsGraphData: {
                    labels: graphData.data.tests_graph_data.labels,
                    data: graphData.data.tests_graph_data.data
                },
                recentTests: testsRes || [],
                dateRange: {
                    from: date.from,
                    to: date.to
                }
            };
            
            setPrevDate(date);
            saveDashboardData(data);
            setDashboard(data);
        } catch (err) {
            toast.error("Error loading dashboard");
        } finally {
            setLoading(false);
        }
    }

    const columns: ColumnDef<Test>[] = [
        {
            accessorKey: "name",
            header: "Test"
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const statusMap: { [key: string]: StatusComponentTypes } = {
                    Success: "ok",
                    Failed: "danger",
                    Pending: "warning",
                    Warning: "caution"
                };

                return <Status status={statusMap[row.getValue("status") as keyof typeof statusMap]} message={row.getValue("status")}></Status>
            }
        },
        {
            accessorKey: "endTimestamp",
            header: "Finished",
            cell: ({ row }) => {
                const endDate = new Date(row.getValue("endTimestamp"));

                if (endDate.toString() === "Invalid Date") {
                    return <p>Ongoing...</p>
                }

                return (
                    <div className="flex justify-start cursor-default">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <p>{getRelativeTime(endDate)}</p>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{endDate.toLocaleString()}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                );
            }
        },
        {
            accessorKey: "startTimestamp",
            header: "Time",
            cell: ({ row }) => {
                const startTime = new Date(row.getValue("startTimestamp"));
                const endTime = new Date(row.getValue("endTimestamp"));
                
                if (endTime.toString() === "Invalid Date") {
                    return <p>Ongoing...</p>
                }

                const execTime = endTime.getTime() - startTime.getTime();

                return <p>{Math.floor(execTime / 1000).toFixed(1)}s</p>
            }
        }
    ];

    return (
        <div className="overflow-hidden">
            <h2 className="text-3xl py-5 font-bold">Dashboard</h2>

            <div className="flex flex-col gap-6">
                <div className="flex flex-row gap-3">
                    <Card className="w-full">
                        <CardHeader>
                           <CardTitle>Total Tests</CardTitle>
                        </CardHeader>
                        <CardContent className="text-4xl font-bold">
                            <AnimatedNumberCounter start={Math.floor(dashboard.generalData!.totalTests * 0.95)} end={dashboard.generalData!.totalTests} durationInMs={1000} />
                        </CardContent>
                    </Card>
                    <Card className="w-full">
                        <CardHeader>
                           <CardTitle>Successfull Tests</CardTitle>
                        </CardHeader>
                        <CardContent className="text-4xl font-bold">
                            <AnimatedNumberCounter start={Math.floor(dashboard.generalData!.successfulTests * 0.95)} end={dashboard.generalData!.successfulTests} durationInMs={1000} />
                        </CardContent>
                    </Card>
                    <Card className="w-full">
                        <CardHeader>
                           <CardTitle>Failed Tests</CardTitle>
                        </CardHeader>
                        <CardContent className="text-4xl font-bold">
                            <AnimatedNumberCounter start={Math.floor(dashboard.generalData!.failedTests * 0.95)} end={dashboard.generalData!.failedTests} durationInMs={1000} />
                        </CardContent>
                    </Card>
                    <Card className="w-full">
                        <CardHeader>
                           <CardTitle>Self-Healed Scripts</CardTitle>
                        </CardHeader>
                        <CardContent className="text-4xl font-bold">
                            <AnimatedNumberCounter start={Math.floor(dashboard.generalData!.selfHealedScripts * 0.95)} end={dashboard.generalData!.selfHealedScripts} durationInMs={1000} />
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-row gap-3 h-[750px]">
                    <Card className="w-[65%]">
                        <CardHeader>
                           <CardTitle>Tests Ran</CardTitle>
                           <CardDescription>
                            This Graph represents how many tests where run in the specified period of time.
                           </CardDescription>
                        </CardHeader>
                        <CardContent className="w-full h-full pt-2">
                            <div className="mb-3">
                                <div className="flex justify-start">
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
                                                <CalendarIcon 
                                                className="mr-2 h-4 w-4" />
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
                                                    disabled={(date) =>
                                                        date > new Date()
                                                    }
                                                />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            {!loading && dashboard.testsGraphData ?
                                <ResponsiveContainer width="100%" height="80%">
                                    <BarChart data={
                                        dashboard.testsGraphData.labels.map((label, index) => (
                                            {
                                                name: label,
                                                tests: dashboard.testsGraphData.data[index], 
                                            }
                                        ))
                                    }>
                                        <XAxis dataKey="name" minTickGap={50} />
                                        <YAxis />
                                        <ChartTooltip cursor={{fill: 'transparent'}} wrapperClassName="rounded-md text-black" />
                                        <Bar dataKey="tests" fill="#11C3DE" />
                                    </BarChart>
                                </ResponsiveContainer>
                                : 
                                <div className="flex justify-center items-center h-[80%] w-full">
                                    <Loader2 className="mr-2 h-10 w-10 animate-spin" />
                                </div>
                            }
                        </CardContent>
                    </Card>

                    <Card className="w-[35%] overflow-y-auto">
                        <CardHeader>
                           <CardTitle>Most Recent Test Runs</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <DataTable
                            columns={columns}
                            data={dashboard.recentTests}
                            loading={loading}
                            noResultsMsg="No test have been run"
                            onRowClick={(row) => navigate(`/tests/reports/${row.testId}`)}
                        />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}