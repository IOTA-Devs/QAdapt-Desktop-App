import { 
    Breadcrumb, 
    BreadcrumbItem, 
    BreadcrumbList, 
    BreadcrumbPage, 
    BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
    Dialog,
    DialogHeader,
    DialogContent,
    DialogTitle,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Collection, CollectionCardProps, CollectionDataModalProps } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "@/contexts/authContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { MoreHorizontal, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PersistenceContext } from "@/contexts/persistenceContext";
import { Label } from "@/components/ui/label";
import PageTitle from "@/components/custom/page-title";

function CollectionDataModal(
    { 
        collectionId, 
        defaultName, 
        defaultDescription, 
        open, 
        onOpenChange, 
        onSubmitCompleted 
    }: CollectionDataModalProps) {
    const { APIProtected } = useContext(AuthContext);
    const [defaultValues, setDefaultValues] = useState<{ description: string, name: string }>({
        name: defaultName,
        description: defaultDescription
    });
    
    const collectionFormSchema = z.object({
        name: z.string().min(1, "Name is required").max(32, "Name must not be longer than 32 characters"),
        description: z.string().min(1, "A description is required").max(256, "Description can't be longer than 256 charracters")
    });

    const form = useForm<z.infer<typeof collectionFormSchema>>({
        resolver: zodResolver(collectionFormSchema),
        defaultValues: {
            name: defaultName,
            description: defaultDescription
        }
    });

    const onSubmit = async (e: z.infer<typeof collectionFormSchema>) => {
        onOpenChange(false);

        // Check if it is an update or a create
        let response;
        if (collectionId) {
            response = APIProtected.put(`api/collections/update_collection/${collectionId}`, {
                name: e.name,
                description: e.description
            });
        } else {
            response = APIProtected.post("api/collections/create_collection", {
                name: e.name,
                description: e.description
            });
        }

        toast.promise(response, {
            loading: !collectionId ? "Creating collection" : "Updating Collection",
            error: `Failed to ${collectionId ? "update" : "create"} the collection. Try again`,
            success: `Collection ${collectionId ? "Updated" : "Created"}`
        });

        await response;
        setDefaultValues({
            name: e.name,
            description: e.description
        });
        if (onSubmitCompleted) {
            onSubmitCompleted(e.name, e.description);
        }
    }

    const checkDisabled = () => {
        for (let key of Object.keys(defaultValues)) {
            const currFormVal = form.getValues(key as keyof typeof defaultValues);
            const defaultVal = defaultValues[key as keyof typeof defaultValues];

            if (currFormVal !== defaultVal) {
                return false;
            }
        }

        return true;
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{collectionId ? `Edit Collection "${defaultName}"` : "Create Collection"}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="name">Name</FormLabel>
                                    <FormControl>
                                        <Input type="text" id="name" placeholder="Collection Name" {...field}></Input>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField 
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="description">Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            id="description"
                                            placeholder="Collection description. What type of tests will it contain?"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Close</Button>
                            </DialogClose>
                            <Button 
                                disabled={checkDisabled()}
                                type="submit">{collectionId ? "Save Changes" : "Create"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function CollectionCard({ collectionId, name, description, lastUpdated, scripts, tests, onDelete, onEdited }: CollectionCardProps) {
    const { APIProtected } = useContext(AuthContext);
    const [editModal, setEditModal] = useState<boolean>(false);
    const [deleteModal, setDeleteModal] = useState<boolean>(false);

    const [defaultVals, setDefaultVals] = useState<{ name: string, description: string }>({
        name,
        description
    });

    const deleteCollection = async () => {
        const response = APIProtected.delete(`api/collections/delete_collection/${collectionId}`);

        toast.promise(response, {
            success: "Collection deleted",
            loading: "Deleting Collection",
            error: "Couldn't delete collection. Please try again"
        });

        await response;
        onDelete(collectionId);
    }

    return (
        <Card className="w-[300px] hover:scale-[1.03] collection-card z-10">
            <AlertDialog open={deleteModal} onOpenChange={(value: boolean) => setDeleteModal(value)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this collection?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone and will delete all scripts and test reports within said collection.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteCollection}>Yes</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <CollectionDataModal
                defaultName={defaultVals.name} 
                defaultDescription={defaultVals.description} 
                collectionId={collectionId}
                open={editModal}
                onOpenChange={(value: boolean) => setEditModal(value)}
                onSubmitCompleted={(name, description) => {
                    setDefaultVals({
                        name,
                        description
                    });
                    onEdited(name, description, collectionId);
                }}
                />
            <Link to={`/collections/${collectionId}/${defaultVals.name}`}>
                <CardHeader>
                    <CardTitle>{defaultVals.name}</CardTitle>
                    <CardDescription>{defaultVals.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <div>
                        <h6 className="font-semibold">Scripts: </h6>
                        <p className="text-muted-foreground">{scripts}</p>   
                    </div>

                    <div>
                        <h6 className="font-semibold">Tests: </h6>
                        <p className="text-muted-foreground">{tests}</p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Badge variant="default">{lastUpdated.toDateString()}</Badge>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()

                                setEditModal(true);
                            }}>
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();

                                setDeleteModal(true);
                            }}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardFooter>
            </Link>
        </Card>
    );
}

export default function Collections() {
    const { APIProtected } = useContext(AuthContext);
    const { collections: savedCollections, saveCollections } = useContext(PersistenceContext);

    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    const [dateCursor, setDateCursor] = useState<Date | null>();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [createCollectionModal, setCreateCollectionModal] = useState<boolean>(false);

    useEffect(() => {
        if (savedCollections.length) {
            setCollections(savedCollections);
            return;
        }

        fetchCollections();
    }, []);

    const fetchCollections = (reFetch: boolean = true) => {
        setLoading(true);
        let query = "api/collections";

        if (dateCursor) {
            query += `?cursor=${dateCursor.getTime()}`;
        }
        APIProtected.get(query).then((response) => {
            const collectionsData: Collection[] = response.data.collections.map((collection: any) => {
                return {
                    collectionId: collection.collection_id,
                    name: collection.name,
                    description: collection.description,
                    lastUpdated: new Date(collection.last_updated),
                    scripts: collection.scripts,
                    tests: collection.tests
                } as Collection;
            });
            
            if (reFetch) {
                setCollections(collectionsData);
                saveCollections(collectionsData);
            } else {
                setCollections((old) => {
                    const newData = [...old, ...collectionsData];
                    saveCollections(newData);
                    return newData;
                });
            }

            if (response.data.collections.length >= response.data.limit) {
                setDateCursor(new Date(response.data.collections[response.data.collections.length - 1].last_updated));
            } else {
                setDateCursor(null);
            }
        }).catch((err) => {
            console.error(err);
            toast.error("Failed to fetch collections. Try reloading the page");
        }).finally(() => {
            setLoading(false);
        });
    }

    const fetchCollectionsByName = (query: string) => {
        if (query.length < 1) {
            fetchCollections();
            return;
        };

        if (query.length > 32) return;
        
        setLoading(true);
        APIProtected.get(`api/collections/search?search_query=${query}`).then((response) => {
            const collectionsData: Collection[] = response.data.results.map((collection: any) => {
                return {
                    collectionId: collection.collection_id,
                    name: collection.name,
                    description: collection.description,
                    lastUpdated: new Date(collection.last_updated),
                    scripts: collection.scripts,
                    tests: collection.tests
                } as Collection;
            });
            
            setCollections(collectionsData);
        }).catch((err) => {
            console.error(err);
            toast.error("Failed to fetch collections. Try reloading the page");
        }).finally(() => {
            setLoading(false);
        });

        searchTimeout.current = null;
    }
    return (
        <>
            <PageTitle tabTitle="QAdapt | Collections" />
            <h2 className="text-3xl py-5 font-bold">Colletions</h2>

            <Breadcrumb className="mb-5">
                <BreadcrumbList>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Collections</BreadcrumbPage>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between gap-5">
                <CollectionDataModal 
                    open={createCollectionModal}
                    defaultName="" 
                    defaultDescription=""
                    onOpenChange={(value: boolean) => setCreateCollectionModal(value)}
                    onSubmitCompleted={() => fetchCollections()}
                />
                <div className="flex gap-2 items-center">
                    <div>
                        <Label htmlFor="collection-name">Search</Label>
                        <Input type="text" id="collection-name" placeholder="Collection Name" onChange={(e) => {
                            const value = e.target.value;
                            
                            if (value.length > 32) return;
                            
                            if (searchTimeout.current) clearTimeout(searchTimeout.current);
                            searchTimeout.current = setTimeout(() => fetchCollectionsByName(value), 200);
                        }}></Input>
                    </div>
                    <Button className="ml-2 mt-6" variant="ghost" onClick={() => fetchCollections()} disabled={loading}><RotateCcw /></Button>
                </div>
                <Button className="mt-6" variant="default" onClick={() => setCreateCollectionModal(true)}><Plus className="mr-2"/>Create</Button>
            </div>

            <div className="flex flex-row flex-wrap justify-start gap-3 py-3">
                {!loading && !collections.length &&
                    <div className="w-full h-40">
                        <p className="text-muted-foreground">No Collections</p>
                    </div>
                }
                {loading && !collections.length ? 
                <>
                    <Skeleton className="w-[300px] h-[270px] rounded-md" />
                    <Skeleton className="w-[300px] h-[270px] rounded-md" />
                    <Skeleton className="w-[300px] h-[270px] rounded-md" />
                    <Skeleton className="w-[300px] h-[270px] rounded-md" />
                    <Skeleton className="w-[300px] h-[270px] rounded-md" />
                    <Skeleton className="w-[300px] h-[270px] rounded-md" />
                    <Skeleton className="w-[300px] h-[270px] rounded-md" />
                    <Skeleton className="w-[300px] h-[270px] rounded-md" />
                </>
                :
                <>
                    {collections.map((collection) => (
                        <CollectionCard key={collection.collectionId} {...collection} onDelete={(id: number) => {
                            const filteredCollections = collections.filter((collection) => collection.collectionId !== id);

                            setCollections(filteredCollections);
                            saveCollections(filteredCollections);
                        }}
                        onEdited={(newName, newDescription, collectionId) => {
                            const editedCollectionIndex = collections.findIndex((collection) => collection.collectionId === collectionId);
                            if (editedCollectionIndex === -1) return;

                            const updatedCollections = collections.map((collection) => 
                                collection.collectionId === editedCollectionIndex ?
                                {
                                    ...collection,
                                    name: newName,
                                    description: newDescription
                                } :
                                collection
                            );

                            setCollections(updatedCollections)
                            saveCollections(updatedCollections);
                        }}></CollectionCard>
                    ))}
                    {dateCursor &&
                        <div className="w-full flex justify-center">
                            <Button variant="default" onClick={() => fetchCollections(false)}>Load More</Button>
                        </div>
                    }
                </>
                }
            </div>
        </>
    );
}
