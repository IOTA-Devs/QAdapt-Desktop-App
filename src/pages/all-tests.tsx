import { AuthContext } from "@/contexts/authContext";
import { StatusComponentTypes, Test } from "@/types/types";
import { useContext, useEffect, useState } from "react";
import { DataTable } from "@/components/custom/data-table";
import { ColumnDef } from "@tanstack/react-table";
import Status from "@/components/custom/status";
import { toast } from "sonner";
import { getRelativeTime } from "@/util/util.helper";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Reports() {
    const { APIProtected } = useContext(AuthContext);
    const [cursor, setCursor] = useState<number>();

    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = (cursor?: number, limit?: number) => {
        setLoading(true);

        let url = 'api/tests';

        if (cursor) {
            url += `?cursor=${cursor}`;
        }

        if (limit) {
            if (cursor) url += `&limit=${limit}`;
            else  url += `?limit=${limit}`
        }

        APIProtected.get(url).then((response) => {
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

            if (testsRes.length) {
                setCursor(testsRes[testsRes.length - 1].testId);
            }

            if (tests.length > 1) {
                setTests((prev) => [...prev, ...testsRes]);
            } else {
                setTests(testsRes);
            }
        }).catch((err) => {
            console.log(err);
            toast.error("Error loading tests");
        }).finally(() => {
            setLoading(false);
        });
    }

    const getNextPage = (countPerPage: number) => {
        let limit = 100;
        switch (countPerPage) {
            case 10:
                limit = 100;
                break;
            case 25:
                limit = 250;
                break;
            case 50:
                limit = 300;
                break;
            case 100:
                limit = 500;
                break;    
        }

        fetchTests(cursor, limit);
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
        <>
            <h2 className="text-3xl py-5 font-bold">Recent Test Reports</h2>
            <DataTable
                columns={columns}
                data={tests}
                loading={loading}
                noResultsMsg="No test have been run"
                fetchData={getNextPage}
            />
        </>
    );
}