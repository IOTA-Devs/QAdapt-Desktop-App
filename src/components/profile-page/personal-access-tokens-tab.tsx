import { AuthContext } from "@/contexts/authContext";
import { PersonalAccessToken } from "@/types/types";
import { Checkbox } from "../ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { useContext, useState, useEffect } from "react";
import { Button } from "../ui/button";
import { DataTable } from "../custom/data-table";
import { cn } from "@/lib/utils"
import { addDays, format } from "date-fns";
import { Input } from "../ui/input";
import { CalendarIcon, Plus, RotateCcw, Copy } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { toast } from "sonner";
import { getFormatedDate } from "@/util/util.helper";
import Status from "../custom/status";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function CreateTokenModal({ onTokenCreate }: { onTokenCreate: (tokenData: { token_name: string, expiration_delta: number | null }) => void}) {
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    const personalTokenSchema = z.object({
        doe: z.date().optional(),
        name: z.string().min(1, "A name is required").max(100, "The name can't be longer than 100 characters")
    });

    const form = useForm<z.infer<typeof personalTokenSchema>>({
        resolver: zodResolver(personalTokenSchema),
        defaultValues: {
            name: ""
        }
    });

    const onSubmit = (e: z.infer<typeof personalTokenSchema>) => {
        form.reset();

        const data = {
            token_name: e.name,
            expiration_delta: e.doe ? Math.floor((e.doe.getTime() - Date.now()) / 1000) : null
        };

        onTokenCreate(data);
        setModalOpen(false);
    }

    return (
        <Dialog open={modalOpen} onOpenChange={(open) => setModalOpen(open)}>
            <DialogTrigger asChild>
                <Button variant="ghost">
                    <Plus/>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Personal Access Token</DialogTitle>
                    <DialogDescription>
                        Create a personal API access token to use with our self-healing framework.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Token Name</FormLabel>
                                    <FormControl>
                                        <Input type="text" id="name" placeholder="Your token name" {...field}></Input>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        >
                        </FormField>

                        <FormField
                            control={form.control}
                            name="doe"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Token Expiration</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-[280px] justify-start text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
                                            <Select
                                                onValueChange={(value) =>
                                                    form.setValue("doe", addDays(new Date(), parseInt(value)))  
                                                }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent position="popper">
                                                        <SelectItem value="1">In 1 day</SelectItem>
                                                        <SelectItem value="3">In 3 days</SelectItem>
                                                        <SelectItem value="7">In a week</SelectItem>
                                                        <SelectItem value="30">In a month</SelectItem>
                                                        <SelectItem value="91">In 3 months</SelectItem>
                                                        <SelectItem value="182">In 6 months</SelectItem>
                                                        <SelectItem value="365">In a year</SelectItem>
                                                    </SelectContent>
                                            </Select>
                                            <div className="rounded-md border">
                                                <Calendar 
                                                    mode="single" 
                                                    selected={field.value} 
                                                    onSelect={field.onChange}
                                                    disabled={(date) => 
                                                        date < new Date()
                                                    }/>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription>ⓘ If no date is picked, the token will never expire.</FormDescription>
                                </FormItem>
                            )}>
                        </FormField>

                        <DialogFooter>
                            <Button type="submit">Confirm</Button>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default function PersonalAccessTokensTab() {
    const { APIProtected } = useContext(AuthContext);
    const [tokensData, setTokensData] = useState<PersonalAccessToken[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedRows, setSelectedRows] = useState<PersonalAccessToken[]>([]);
    const [deletTokensModalOpen, setDeleteTokensModalOpen] = useState<boolean>(false);
    const [createdToken, setCreeatedToken] = useState<string>("");
    const [copyTokenModalOpen, setCopyTokenModalOpen] = useState<boolean>(false);

    useEffect(() => {
        fetchTokens();
    }, []);

    const columns: ColumnDef<PersonalAccessToken>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: "Name"
        },
        {
            accessorKey: "createdAt",
            header: "Created At"
        },
        {
            accessorKey: "expiresAt",
            header: "Expires At"
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status");

                return (
                    <Status status={status === "Active" ? "ok" : "danger"} message={status as string}/>
                );
            }
        }
    ];

    const fetchTokens = () => {
        setLoading(true);
        APIProtected.get("api/personal_tokens").then((response) => {
            const tokens = response.data.personal_tokens.map((token: any) => {
                const createdDate = new Date(token.created_at);
                const expiresDate = token.expires_at ? new Date(token.expires_at) : null;

                return {
                    name: token.name,
                    expiresAt: expiresDate ? getFormatedDate(expiresDate) : "Never",
                    createdAt: getFormatedDate(createdDate),
                    status: expiresDate ? expiresDate < new Date() ? "Expired" : "Active" : "Active",
                    tokenId: token.token_id
                } as PersonalAccessToken;
            });
            setTokensData(tokens);
        }).catch(() => {
            toast.error("Error loading tokens");
        }).finally(() => {
            setLoading(false);
        });
    }

    const deleteTokens = async () => {
        if (!selectedRows.length) toast.info("No tokens selected.")
        
        const response = APIProtected.delete("api/personal_tokens/delete_pat", {
            data: {
                token_ids: selectedRows.map((row) => row.tokenId)
            }
        });

        toast.promise(response, {
            loading: "Deleting tokens...",
            success: "Tokens deleted successfully.",
            error: "Error while deleting tokens"
        });

        await response;
        fetchTokens();
    }

    const createNewToken = async (tokenData: { token_name: string, expiration_delta: number | null }) => {
        const response = APIProtected.post("api/personal_tokens/generate_pat", tokenData);

        toast.promise(response, {
            loading: "Generating Personal Access Token",
            success: "Token created successfully",
            error: (err) => {
                if (err.response) {
                    if (!err.response.data.detail) return "Error generating token. Try again";

                    return err.response.data.detail.message;
                }

                return "Error generating token. Try again";
            }
        });
        
        const responseToken = await response;
        setCreeatedToken(responseToken.data.token);
        setCopyTokenModalOpen(true);
        fetchTokens();
    }

    const copyTokenToClipboard = () => {
        if (!createdToken.length) return;

        navigator.clipboard.writeText(createdToken);
        toast.success("Token copied to clipboard");
    }

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center pb-3">
                <p className="text-muted-foreground">{`${tokensData.length} of 5 Total`}</p>
                <div className="flex justify-end items-center gap-3">
                    <AlertDialog open={deletTokensModalOpen} onOpenChange={(open) => setDeleteTokensModalOpen(open)}>
                        <Button variant="destructive" onClick={() => !selectedRows.length ? toast.info("No selected tokens") : setDeleteTokensModalOpen(true)}>Delete</Button>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to delete these tokens?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will delete and revoke access to the selected personal access tokens.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={deleteTokens}>Yes</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <CreateTokenModal onTokenCreate={createNewToken}/>
                    <Button variant="ghost" onClick={fetchTokens} disabled={loading}>
                        <RotateCcw></RotateCcw>
                    </Button>

                    <Dialog open={copyTokenModalOpen} onOpenChange={(open) => setCopyTokenModalOpen(open)}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Your Personal Token is ready!</DialogTitle>
                                <DialogDescription>
                                    Your personal API Access toekn has been generated. Make sure to copy it and store it in a safe place.
                                    Once this modal is close your token cannot be copied again.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex gap-2">
                                <Input value={createdToken} readOnly={true}></Input>
                                <Button onClick={copyTokenToClipboard} variant="secondary"><Copy /></Button>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="default" onClick={() => setCreeatedToken("")}>Confirm</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <DataTable 
                columns={columns} 
                data={tokensData} 
                noResultsMsg="This account has no personal access tokens." 
                loading={loading}
                onSelectRows={(rows) => setSelectedRows(rows)}    
            />
        </div>
    );
}