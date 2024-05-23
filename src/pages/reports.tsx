import { TestReportProps } from '@/types/types';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton";

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
            <div className="flex justify-between">
                <p></p>
            </div>
        </>
    );
}

export default function Reports() {
    const { testId } = useParams();
    const [loading, setLoading] = useState<boolean>(true);

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

                </div>
            </>
            }
        </>
    );
}