import { StatusComponentTypes, TestReportProps } from '@/types/types';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton";
import { AuthContext } from '@/contexts/authContext';
import { toast } from 'sonner';
import Status from '@/components/custom/status';

function ReportSkeletonLoader() {
    return (
        <>
            <Skeleton className="w-[350px] h-[40px] rounded-md my-5" />
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

export default function Reports() {
    const { APIProtected } = useContext(AuthContext);
    const { testId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(true);
    const [reportData, setReportData] = useState<TestReportProps[]>([]);

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = () => {
        setLoading(true);
        APIProtected.get(`api/tests/report/${testId}`).then((response) => {
            console.log(response.data);

            setLoading(false);
        }).catch(() => {
            toast.error("Failed to fetch report data");
        });
    }

    return (
        <>
            {loading ?
                <ReportSkeletonLoader />
            :
            <>
                <h2 className="text-3xl py-5 font-bold">Test Report {testId}</h2>
                <div className="flex justify-between">
                    <h4 className="font-semibold w-52">Log</h4>
                    <h4 className="font-semibold">Status</h4>
                    <h4 className="font-semibold">Screenshot</h4>
                </div>
                <div className="flex justify-between">
                    {reportData.length ?
                        <p>Found</p>
                    :   
                        <div className="py-6">
                            <p className="text-center text-muted-foreground">This test has no reports</p>
                        </div>
                    }
                </div>
            </>
            }
        </>
    );
}