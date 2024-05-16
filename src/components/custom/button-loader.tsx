import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { ButtonProps } from "../ui/button";

interface ButtonLoaderProps extends ButtonProps {
    loading: boolean;
    loadingElement?: React.ReactNode;
}

export default function ButtonLoader({ loading, loadingElement, ...buttonProps }: ButtonLoaderProps) {
    return (
        <Button {...buttonProps}>
            {loading ?
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {loadingElement ? loadingElement : "Please wait..."}
                </>
                : 
                <>
                    {buttonProps.children}
                </>
            }
        </Button>
    );
}