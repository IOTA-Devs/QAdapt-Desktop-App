import { useParams } from "react-router-dom";
import { BreadcrumbList, BreadcrumbSeparator, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import Report from "../components/custom/reports";

export default function ReportPage() {
    const { collectionId, collectionName, scriptId, scriptName, testId } = useParams();

    return (
        <Report customBreadcrumb={
            <BreadcrumbList>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to="/collections">Collections</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to={`/collections/${collectionId}/${collectionName}`}>{collectionName}</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to={`/collections/${collectionId}/${collectionName}/${scriptId}/${scriptName}`}>{`${scriptName} Tests`}</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Report {testId}</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
            </BreadcrumbList>
        }/>
    );
}