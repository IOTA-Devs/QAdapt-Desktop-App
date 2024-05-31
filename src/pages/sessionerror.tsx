import { WifiOff } from "lucide-react";
import logo from "../assets/images/QAdapt_Logo.png"
import { Button } from "@/components/ui/button";
import { useContext, useEffect } from "react";
import { AuthContext } from "@/contexts/authContext";
import { useNavigate } from "react-router-dom";

export default function SessionError() {
    const { loggedIn } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (loggedIn === null) {
            return;
        }

        if (loggedIn === false) {
            window.location.href = "/login";
            return;
        }

        navigate("/home");
    });

    return (
        <div className="h-[100vh]">
            <div className="w-full h-[10vh] flex justify-center items-center bg-secondary">
                <img className="h-[40px]" src={logo} alt="qadapt-logo" />
            </div>
            <div className="h-[90vh] flex flex-col justify-center items-center gap-8">
                <WifiOff className="h-56 w-56" />
                <p className="text-muted-foreground text-xl text-center">Oh no! An error ocuured while trying to connect to the server. Please check your internet connection and reload the page.</p>
                <Button onClick={() => window.location.href = "/"}>Reload Page</Button>
            </div>
        </div>
    );
}