import { useParams } from "react-router-dom";
import { BreadcrumbList, BreadcrumbSeparator, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import Tests from "../components/custom/tests";

export default function ScriptTests() {
    const { collectionId, collectionName, scriptId, scriptName } = useParams();

    return (
        <>
            <Tests 
                customBreadcrumb={
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
                            <BreadcrumbPage>{`${scriptName} Tests`}</BreadcrumbPage>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                    </BreadcrumbList>
                }
                onRowRedirect={(row) => (`/collections/${collectionId}/${collectionName}/${scriptId}/${scriptName}/${row.testId}`)} 
                scriptId={parseInt(scriptId!)} 
                customTitle={`${scriptName} Tests`}/>
        </>
    );
}