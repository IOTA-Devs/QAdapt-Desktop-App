import { Collection, DashboardData, PersistedStateType, Script } from "@/types/types";
import { createContext, useRef, useState, ReactNode, useEffect } from "react";

interface PersistenceContextType {
    collections: Collection[]
    collectionScripts: Map<number, Script[]>
    dashboardData: DashboardData | null | undefined
    saveCollections: (collections: Collection[]) => void,
    saveCollectionScripts: (collectionId: number, scripts: Script[]) => void,
    deleteCollectionScripts: (collectionId: number) => void,
    clearState: (stateType: PersistedStateType) => void,
    saveDashboardData: (data: DashboardData) => void,
    clearDashboardData: () => void
}

const PersistenceContext = createContext<PersistenceContextType>({
    collections: [],
    collectionScripts: new Map(),
    dashboardData: null,
    saveCollections: () => {},
    saveCollectionScripts: () => {},
    deleteCollectionScripts: () => {},
    clearState: () => {},
    saveDashboardData: () => {},
    clearDashboardData: () => {}
});

export default function PersistenceProvider({ children }: { children: ReactNode }) {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [collectionScripts, setCollectionScripts] = useState<Map<number, Script[]>>(new Map());
    const [dashboardData, setDashboardData] = useState<DashboardData | null>();

    const persistedStates = useRef<Map<PersistedStateType, number>>(new Map<PersistedStateType, number>());

    useEffect(() => {
        const checkStatusInterval = setInterval(() => {
            const now = Date.now();

            for (let [key, value] of persistedStates.current) {
                if (value < now) {
                    clearState(key);
                    persistedStates.current.delete(key);
                }
            }
        }, 60_000);

        return () => clearInterval(checkStatusInterval);
    }, []);

    const saveCollections = (collections: Collection[]) => {
        setCollections(collections);

        persistedStates.current.set(PersistedStateType.COLLECTIONS, Date.now() + 30 * 60000); // Clear after 30 minutes
    }

    const saveCollectionScripts = (collectionId: number, scripts: Script[]) => {
        setCollectionScripts((prev) => prev.set(collectionId, scripts));

        persistedStates.current.set(PersistedStateType.SCRIPTS, Date.now() + 10 * 60000); // Clear after 10 minutes
    }

    const deleteCollectionScripts = (collectionId: number) => {
        const newCollectionScripts = new Map(collectionScripts);
        collectionScripts.delete(collectionId);
        
        setCollectionScripts(newCollectionScripts)
    }

    const saveDashboardData = (data: DashboardData) => {
        setDashboardData(data);

        persistedStates.current.set(PersistedStateType.DASHBOARD, Date.now() + 30 * 60000); // Clear after 30 minutes
    }

    const clearDashboardData = () => {
        setDashboardData(null);

        persistedStates.current.delete(PersistedStateType.DASHBOARD);
    }

    const clearState = (stateType: PersistedStateType) => {
        switch(stateType) {
            case PersistedStateType.COLLECTIONS:
                setCollections([]);
                break;
            case PersistedStateType.SCRIPTS:
                setCollectionScripts(new Map());
                break;
            default:
                return;
        }

        persistedStates.current.delete(PersistedStateType.COLLECTIONS);
    }   
    
    return (
        <PersistenceContext.Provider value={{
            collections,
            collectionScripts,
            dashboardData,
            saveCollections,
            saveCollectionScripts,
            deleteCollectionScripts,
            saveDashboardData,
            clearDashboardData,
            clearState
        }}>
            {children}
        </PersistenceContext.Provider>
    )
}

export { PersistenceContext };