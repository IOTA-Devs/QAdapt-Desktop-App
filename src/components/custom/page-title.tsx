import { useEffect } from "react";


export default function PageTitle({ tabTitle }: { tabTitle: string }) {
    useEffect(() => {
        const defaultPageTitle = document.title;

        document.title = tabTitle;

        return () => {
            document.title = defaultPageTitle;
        };
    }, []);

    return null;
}