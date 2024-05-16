import { AuthContext } from "@/contexts/authContext";
import { PersonalAccessToken } from "@/types/types";
import { Checkbox } from "../ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useContext, useState, useEffect } from "react";
import { Button } from "../ui/button";
import { DataTable } from "../ui/data-table";
import { cn } from "@/lib/utils"
import { addDays, format } from "date-fns";
import { Input } from "../ui/input";
import { CalendarIcon } from "lucide-react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { toast } from "sonner";
import { getFormatedDate } from "@/util/util.helper";

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
            <DialogTrigger><Plus/></DialogTrigger>
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
            header: "Status"
        }
    ];

    const fetchTokens = () => {
        APIProtected.get("api/personal_tokens").then((response) => {
            const tokens = response.data.personal_tokens.map((token: any) => {
                const createdDate = new Date(token.created_at);
                const expiresDate = token.expires_at ? new Date(token.expires_at) : null;

                return {
                    userId: token.user_id,
                    name: token.name,
                    expiresAt: expiresDate ? getFormatedDate(expiresDate) : "Never",
                    createdAt: getFormatedDate(createdDate),
                    status: expiresDate ? expiresDate < new Date() ? "Expired" : "Active" : "Active"
                } as PersonalAccessToken;
            });
            setTokensData(tokens);
        }).catch(() => {
            toast.error("Error loading tokens");
        });
    }

    const createNewToken = async (tokenData: { token_name: string, expiration_delta: number | null }) => {
        const response = APIProtected.post("api/personal_tokens/generate_personal_access_token", tokenData);

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
        
        await response;
        fetchTokens();
    }

    return (
        <div className="container py-10">
            <div className="flex justify-end items-center gap-3 pb-3">
                <Button variant="destructive">Delete</Button>
                <CreateTokenModal onTokenCreate={createNewToken}/>
            </div>
            <DataTable columns={columns} data={tokensData} noResultsMsg="This account has no personal access tokens."/>
        </div>
    );
}