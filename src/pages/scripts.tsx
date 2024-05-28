import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

export default function Scripts() {
    const { collectionId } = useParams();
    const [currentQueryParameters, setSearchParams] = useSearchParams();
    const [title, setTitle] = useState<string>("");
    const navigate = useNavigate();

    useEffect(() => {
        const collectionTitle = currentQueryParameters.get("title");

        if (!collectionTitle) return navigate("/collections");
        setTitle(collectionTitle);
    }, []);

    return(
        <>  
            <h2 className="text-3xl py-5 font-bold">Scripts in "{title}"</h2>

            <Breadcrumb className="mb-5">
                <BreadcrumbList>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/collections">Collections</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{title}</BreadcrumbPage>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                </BreadcrumbList>
            </Breadcrumb>
        </>
    );
}