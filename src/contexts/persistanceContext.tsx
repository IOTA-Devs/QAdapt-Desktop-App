import { Collection, Test } from "@/types/types";
import { createContext, useRef, useState, ReactNode } from "react";

interface PersistanceContextType {
    collections: Collection[]
    saveCollections: (collections: Collection[]) => void,
}

const PersistanceContext = createContext<PersistanceContextType>({
    collections: [],
    saveCollections: () => {},
});

export default function PersistanceProvider({ children }: { children: ReactNode }) {
    const [collections, setCollections] = useState<Collection[]>([]);

    const collectionsTimeout = useRef<NodeJS.Timeout | null>();

    const saveCollections = (collections: Collection[]) => {
        if (collectionsTimeout.current) clearTimeout(collectionsTimeout.current);

        setCollections(collections);

        collectionsTimeout.current = setTimeout(() => {
            setCollections([]);
            collectionsTimeout.current = null;
        }, 20 *  60000); // Clear after 20 minutes
    }
    
    return (
        <PersistanceContext.Provider value={{
            collections,
            saveCollections,
        }}>
            {children}
        </PersistanceContext.Provider>
    )
}

export { PersistanceContext };