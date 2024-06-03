import { DataTable } from "@/components/custom/data-table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { AuthContext } from "@/contexts/authContext";
import { PersistedStateType, Script } from "@/types/types";
import { ColumnDef } from "@tanstack/react-table";
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Copy, FileCode2, MoreHorizontal, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
    Dialog,
    DialogHeader,
    DialogContent,
    DialogTitle,
    DialogFooter,
    DialogClose,
    DialogDescription
} from "@/components/ui/dialog";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import PageTitle from "@/components/custom/page-title";
import { PersistenceContext } from "@/contexts/persistenceContext";

function ScriptModal({ collectionId, onSubmit, defaultName, scriptId, open, onOpenChange }: { collectionId: string, onSubmit: (name: string) => void, open: boolean, onOpenChange: (value: boolean) => void, defaultName?: string, scriptId?: number }) {
    const { APIProtected } = useContext(AuthContext);
    
    const [scriptName, setScriptName] = useState<string>(defaultName ? defaultName : "");
    
    const createScript = async () => {
        onOpenChange(false);

        const response = APIProtected.post("api/scripts/create_script", {
            name: scriptName,
            collection_id: collectionId
        });
        
        toast.promise(response, {
            success: "Script created successfully",
            error: "Failed to create script. Please try again",
            loading: "Creating script"
        });
        await response;

        onSubmit(scriptName);
    }
    
    const editScript = async () => {
        onOpenChange(false);

        const response = APIProtected.put("api/scripts/update_script", {
            name: scriptName,
            script_id: scriptId
        });

        toast.promise(response, {
            success: "Script updated successfully",
            error: "Failed to update script. Please try again",
            loading: "Updating script"
        });

        await response;
        onSubmit(scriptName);
    }

    return (
        <Dialog open={open} onOpenChange={(value: boolean) => onOpenChange(value)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{scriptId ? "Edit Script" : "Create a Script"}</DialogTitle>
                    <DialogDescription>
                        {scriptId ? "Edit your script's name" : "This will create a place where all your test reports for a specific testing script can be stored."}
                    </DialogDescription>
                </DialogHeader>

                <Label htmlFor="script-id">Script Name</Label>
                <Input type="text" id="script-name" value={scriptName} onChange={(e) => {
                    if (e.target.value.length > 32) return;

                    setScriptName(e.target.value);
                }} />

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button variant="default" onClick={scriptId ? editScript : createScript} disabled={scriptName.length < 1 || scriptName === defaultName}>
                        {scriptId ? "Save" : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function Scripts() {
    const { APIProtected } = useContext(AuthContext);
    const { clearState, collectionScripts, saveCollectionScripts, clearCollectionScripts } = useContext(PersistenceContext);

    const { collectionId, collectionName } = useParams();
    const [currentQueryParameters] = useSearchParams();
    const [loading, setLoading] = useState<boolean>(false);
    const [scripts, setScripts] = useState<Script[]>([]);
    const [cursor, setCursor] = useState<number>();
    const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);

    const searchTimeout = useRef<NodeJS.Timeout | null>();
    const limit = useRef<number>(100);

    const navigate = useNavigate();

    useEffect(() => {
        const savedScripts = collectionScripts.get(parseInt(collectionId!));

        if (savedScripts && savedScripts.length) {
            setScripts(savedScripts);
            return;
        }

        fetchScripts(true);
    }, []);

    const fetchScripts = async (clear: boolean = false, cursor?: number) => {
        setLoading(true);
        let url = `api/scripts?limit=${limit.current}&collection_id=${collectionId}`;

        if (cursor && !clear) {
            url += `&cursor=${cursor}`;
        }
        
        await APIProtected.get(url).then((response) => {
            const fetchedScripts: Script[] = response.data.scripts.map((script: any) => {
                return {
                    scriptId: script.script_id,
                    name: script.name,
                    tests: script.tests
                } as Script;
            });

            if (fetchedScripts.length) {
                setCursor(fetchedScripts[fetchedScripts.length - 1].scriptId);
            }

            if (scripts.length > 1 && !clear) {
                setScripts((prev) => {
                    const newScripts =  [...prev, ...fetchedScripts];
                    saveCollectionScripts(parseInt(collectionId!), newScripts);

                    return newScripts;
                });
                return;
            }

            setScripts(fetchedScripts);
            saveCollectionScripts(parseInt(collectionId!), fetchedScripts);

        }).catch((err) => {
            console.error(err);
            toast.error("Error fetching scripts. Please try again later");
        }).finally(() => {
            setLoading(false);
        });
    }

    const fetchScriptsByName = (query: string) => {
        if (query.length < 1) {
            fetchScripts();
            return;
        };

        if (query.length > 32) return;

        setLoading(true);

        APIProtected.get(`api/scripts/search?search_query=${query}&collection_id=${collectionId}`).then((response) => {
            const fetchedScripts: Script[] = response.data.results.map((script: any) => {
                return {
                    scriptId: script.script_id,
                    name: script.name,
                    tests: script.tests
                } as Script;
            });

            setScripts(fetchedScripts);
        }).catch((err) => {
            console.error(err);
            toast.error("Failed scripts search. Try reloading the page");
        }).finally(() => {
            setLoading(false);
        });
    }

    const deleteScript = (scriptId: number) => {
        APIProtected.delete(`api/scripts/delete_script/${scriptId}`).then(() => {
            const filteredScripts = scripts.filter((script) => script.scriptId !== scriptId);
            setScripts(filteredScripts);

            // Clear the global state for collection to force a refetch
            clearState(PersistedStateType.COLLECTIONS);
            saveCollectionScripts(parseInt(collectionId!), filteredScripts);

            toast.success("Script deleted");
        }).catch((err) => {
            console.error(err);
            toast.error("Failed to delete the script. Please try again")
        });
    }

    const columns: ColumnDef<Script>[] = [
        {
            accessorKey: "name",
            header: "Script Name",
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2 items-center">
                        <FileCode2 className="size-4"/>
                        {row.original.name}
                    </div>
                );
            }
        },
        {
            accessorKey: "tests",
            header: "Tests run",
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
                const [editModalOpen, setEditModalOpen] = useState<boolean>(false);

                return (
                    <div onClick={(e) => e.stopPropagation()}>
                        <AlertDialog open={deleteModalOpen} onOpenChange={(value: boolean) => setDeleteModalOpen(value)}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure you want to delete this collection?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone and will delete all test reports within.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteScript(row.original.scriptId)}>Yes</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <ScriptModal 
                            open={editModalOpen}
                            onOpenChange={(value: boolean) => setEditModalOpen(value)}
                            defaultName={row.original.name}
                            onSubmit={(scriptName) => {
                                const updatedIndex = scripts.findIndex((script) => script.scriptId === row.original.scriptId);
                                if (updatedIndex === -1) return;

                                const updatedScripts = scripts.map((script, index) => 
                                    index === updatedIndex 
                                    ? { ...script, name: scriptName } 
                                    : script
                                );

                                setScripts(updatedScripts);
                                saveCollectionScripts(parseInt(collectionId!), updatedScripts);
                            }}
                            scriptId={row.original.scriptId}
                            collectionId={collectionId!}
                        />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    toast.info("Script ID copied to clipboard")
                                    navigator.clipboard.writeText(row.original.scriptId.toString());
                                }}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy ID
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {e.stopPropagation(); setEditModalOpen(true)}}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {e.stopPropagation(); setDeleteModalOpen(true)}}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            },
        }
    ];

    return(
        <>  
            <PageTitle tabTitle={`QAdapt | ${currentQueryParameters.get("title")!}`}/>
            <h2 className="text-3xl py-5 font-bold">Scripts in "{collectionName}"</h2>

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
                        <BreadcrumbPage>{collectionName}</BreadcrumbPage>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                </BreadcrumbList>
            </Breadcrumb>

            <div className="pb-2 flex justify-start items-center gap-3">
                <div>
                    <Label htmlFor="collection-name">Search</Label>
                    <Input type="text" id="collection-name" placeholder="Script Name" onChange={(e) => {
                        const value = e.target.value;
                        
                        if (value.length > 32) return;
                        
                        if (searchTimeout.current) clearTimeout(searchTimeout.current);
                        searchTimeout.current = setTimeout(() => fetchScriptsByName(value), 200);
                    }}></Input>
                </div>

                <div className="mt-6">
                    <Button variant="ghost" disabled={loading} onClick={() => fetchScripts(true)}><RotateCcw /></Button>
                </div>
                
                <div className="ml-auto mt-6">
                    <Button onClick={() => setCreateModalOpen(true)}><Plus className="mr-2"/>Create</Button>
                    <ScriptModal 
                        open={createModalOpen}
                        onOpenChange={(value: boolean) => setCreateModalOpen(value)}
                        collectionId={collectionId!} 
                        onSubmit={() => {
                            clearCollectionScripts(parseInt(collectionId!));
                            fetchScripts(true);
                        }} />
                </div>
            </div>
            
            <DataTable 
                columns={columns}
                data={scripts}
                loading={loading}
                fetchData={async (countPerPage: number) => {
                    switch (countPerPage) {
                        case 10:
                        case 25:
                            limit.current = 250;
                            break;
                        case 50:
                            limit.current = 300;
                            break;
                        case 100:
                            limit.current = 500;
                            break;    
                    }

                    await fetchScripts(false, cursor);
                }}
                onRowClick={(row) => navigate(`/collections/${collectionId}/${collectionName}/${row.scriptId}/${row.name}`)}
                noResultsMsg="This Collection has no scripts"
            />
        </>
    );
}