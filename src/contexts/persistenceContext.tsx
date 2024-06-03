import { Collection, PersistedStateType, Script } from "@/types/types";
import { createContext, useRef, useState, ReactNode, useEffect } from "react";

interface PersistenceContextType {
    collections: Collection[]
    collectionScripts: Map<number, Script[]>
    saveCollections: (collections: Collection[]) => void,
    saveCollectionScripts: (collectionId: number, scripts: Script[]) => void,
    clearCollectionScripts: (collectionId: number) => void,
    clearState: (stateType: PersistedStateType) => void,
}

const PersistenceContext = createContext<PersistenceContextType>({
    collections: [],
    collectionScripts: new Map(),
    saveCollections: () => {},
    saveCollectionScripts: () => {},
    clearCollectionScripts: () => {},
    clearState: () => {}
});

export default function PersistenceProvider({ children }: { children: ReactNode }) {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [collectionScripts, setCollectionScripts] = useState<Map<number, Script[]>>(new Map());

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

    const clearCollectionScripts = (collectionId: number) => {
        const newCollectionScripts = new  Map(collectionScripts);
        collectionScripts.delete(collectionId);
        
        setCollectionScripts(newCollectionScripts)
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
            saveCollections,
            saveCollectionScripts,
            clearCollectionScripts,
            clearState
        }}>
            {children}
        </PersistenceContext.Provider>
    )
}

export { PersistenceContext };