import { useEffect, useState } from "react"

export default function Loader() {
    const [visible, setVisible] = useState<boolean>(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(true);
        }, 200);

        return () => clearTimeout(timer);
    }, []);
    
    return (visible ? <div className="loader"></div> : null);
}