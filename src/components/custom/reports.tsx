import { Test, TestReportProps } from '@/types/types';
import { ReactNode, useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton";
import { AuthContext } from '@/contexts/authContext';
import { toast } from 'sonner';
import Status from '@/components/custom/status';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import PageTitle from '@/components/custom/page-title';

function ReportSkeletonLoader() {
    return (
        <>
            <Skeleton className="w-[280px] h-[30px] rounded-md mb-5" />
            <div className="flex justify-between gap-5 mb-5">
                <Skeleton className="w-full h-[20px] rounded-md" />
                <Skeleton className="w-80 h-[20px] rounded-md" />
                <Skeleton className="w-80 h-[20px] rounded-md" />
            </div>
            <div className="flex gap-5 flex-col">
                <Skeleton className="w-full h-[130px] rounded-md" />
                <Skeleton className="w-full h-[130px] rounded-md" />
                <Skeleton className="w-full h-[130px] rounded-md" />
                <Skeleton className="w-full h-[130px] rounded-md" />
                <Skeleton className="w-full h-[130px] rounded-md" />
            </div>
        </>
    );
}

function TestReport({ name, description, status, screenshotURL }: TestReportProps) {
    return (
        <>
            <div className="flex justify-between p-3">
                <div className="w-52">
                    <p className="pb-2">{name}</p>
                    <p className="bg-secondary">
                        {description}
                    </p>
                </div>
                <div>
                    <Status status={(() => {
                        switch (status) {
                            case "Success":
                                return "ok";
                            case "Failed":
                                return "danger";
                            case "Warning":
                                return "warning"
                        }})()} 
                        message={status}
                    />
                </div>
                <div>
                    <img src={screenshotURL} alt={`${name}-report-screenshot`} />
                </div>
            </div>
        </>
    );
}

export default function Reports({ customBreadcrumb }: { customBreadcrumb?: ReactNode }) {
    const { APIProtected } = useContext(AuthContext);
    const { testId } = useParams();

    const [loading, setLoading] = useState<boolean>(true);
    const [reportData, setReportData] = useState<TestReportProps[]>([]);
    const [testData, setTestData] = useState<Test>();

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = () => {
        setLoading(true);
        APIProtected.get(`api/tests/report/${testId}`).then((response) => {
            setTestData({
                testId: response.data.test.test_id,
                scriptId: response.data.test.script_id,
                name: response.data.test.name,
                startTimestamp: response.data.test.start_timestamp,
                endTimestamp: response.data.test.end_timestamp,
                status: response.data.test.status
            });

            setReportData(() => {
                return response.data.logs.map((report: any) => (
                    {
                        name: report.selenium_selector_name,
                        description: report.healing_description,
                        status: report.status,
                        screenshotURL: report.screenshot_url
                    } as TestReportProps
                ));
            });

            setLoading(false);
        }).catch(() => {
            toast.error("Failed to fetch report data");
        });
    }

    return (
        <>  
            <PageTitle tabTitle={`QAdapt | Test ${testId}`} />
            <h2 className="text-3xl py-5 font-bold">Test Report {testId}</h2>
            
            {customBreadcrumb ? customBreadcrumb :
                <Breadcrumb className="pb-5">
                    <BreadcrumbList>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to="/tests">Tests</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Report {testId}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            }

            <div className="mt-2">
                {loading ?
                    <ReportSkeletonLoader />
                :
                <>
                    <p className="text-lg text-muted-foreground pb-5">{testData && new Date(testData.startTimestamp).toDateString()}</p>
                    <div className="flex justify-between">
                        <h4 className="font-semibold w-52">Selector</h4>
                        <h4 className="font-semibold">Status</h4>
                        <h4 className="font-semibold">Screenshot</h4>
                    </div>
                    <div className="flex justify-between">
                        {reportData.length ?
                            <p>Found</p>
                        :   
                            <div className="py-6">
                                <p className="text-center text-muted-foreground">This test has no logs</p>
                            </div>
                        }
                    </div>
                </>
                }
            </div>
        </>
    );
}