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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CollectionCardProps, CollectionDataModalProps } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/contexts/authContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

function CollectionCard({ collectionId, name, description, lastUpdated, scripts, tests }: CollectionCardProps) {
    const [editCollectionModal, setEditCollectionModal] = useState<boolean>(false);

    const [defaultVals, setDefaultVals] = useState<{ name: string, description: string }>({
        name,
        description
    });

    const deleteCollection = () => {

    }

    return (
        <Card className="min-w-[calc(25%-0.75rem)] hover:shadow-lg hover:scale-[1.03] transition-all ease-in-out duration-200">
            <CollectionDataModal
                defaultName={defaultVals.name} 
                defaultDescription={defaultVals.description} 
                collectionId={collectionId}
                open={editCollectionModal}
                onOpenChange={(value: boolean) => setEditCollectionModal(value)}
                onSubmitCompleted={(name, description) => {
                    setDefaultVals({
                        name,
                        description
                    });
                }}
                />
            <Link to={`/collections/${collectionId}?title=${defaultVals.name}`}>
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
                        <DropdownMenuTrigger><MoreHorizontal/></DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()

                                setEditCollectionModal(true);
                            }}>
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();

                                deleteCollection();
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

    const [dateCursor, setDateCursor] = useState<Date>();
    const [collections, setCollections] = useState<CollectionCardProps[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [createCollectionModal, setCreateCollectionModal] = useState<boolean>(false);

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = (reFetch: boolean = true) => {
        setLoading(true);
        let query = "api/collections";

        if (dateCursor) {
            query += `?date_cursor=${dateCursor}`;
        }
        APIProtected.get(query).then((response) => {
            console.log(response.data);
            const collectionsData: CollectionCardProps[] = response.data.collections.map((collection: any) => {
                return {
                    collectionId: collection.collection_id,
                    name: collection.name,
                    description: collection.description,
                    lastUpdated: new Date(collection.last_updated),
                    scripts: collection.scripts,
                    tests: collection.tests
                } as CollectionCardProps;
            });
            
            if (reFetch) {
                setCollections(collectionsData);
            } else {
                setCollections((old) => ([...old, ...collectionsData]));
            }

            if (response.data.collections.length >= response.data.limit) {
                setDateCursor(new Date(response.data.collections[response.data.collections.length - 1].last_updated));
            }
        }).catch((err) => {
            console.error(err);
            toast.error("Failed to fetch collections. Try reloading the page");
        }).finally(() => {
            setLoading(false);
        });
    }
    return(
        <>
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

            <div className="pb-3">
                <Button variant="default" onClick={() => setCreateCollectionModal(true)}><Plus className="mr-2"/>Create</Button>
                <CollectionDataModal 
                    open={createCollectionModal}
                    defaultName="" 
                    defaultDescription=""
                    onOpenChange={(value: boolean) => setCreateCollectionModal(value)}
                    onSubmitCompleted={() => fetchCollections()}
                />
            </div>

            <div className="flex flex-row flex-wrap justify-start gap-3">
                {!loading && !collections.length &&
                    <div className="w-full h-40">
                        <p className="text-muted-foreground">No Collections</p>
                    </div>
                }
                {loading && !collections.length ? 
                <>
                    <Skeleton className="w-[calc(25%-0.75rem)] h-[270px] rounded-md" />
                    <Skeleton className="w-[calc(25%-0.75rem)] h-[270px] rounded-md" />
                    <Skeleton className="w-[calc(25%-0.75rem)] h-[270px] rounded-md" />
                    <Skeleton className="w-[calc(25%-0.75rem)] h-[270px] rounded-md" />
                    <Skeleton className="w-[calc(25%-0.75rem)] h-[270px] rounded-md" />
                    <Skeleton className="w-[calc(25%-0.75rem)] h-[270px] rounded-md" />
                    <Skeleton className="w-[calc(25%-0.75rem)] h-[270px] rounded-md" />
                    <Skeleton className="w-[calc(25%-0.75rem)] h-[270px] rounded-md" />
                </>
                :
                <>
                    {collections.map((collection) => (
                        <CollectionCard key={collection.collectionId} {...collection}></CollectionCard>
                    ))}
                </>
                }
            </div>
        </>
    );
}
