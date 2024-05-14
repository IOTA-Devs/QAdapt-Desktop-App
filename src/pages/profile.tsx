import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthContext } from "@/contexts/authContext";
import { useContext, useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Undo } from "lucide-react";
import { PersonalAccessToken } from "@/types/types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

function PersonalAccessTokensTab() {
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

    // const fetchTokens = () => {}

    const data: PersonalAccessToken[] = [];

    return (
        <div className="container py-10">
            <div className="flex justify-end items-center gap-3 pb-3">
                <Button variant="destructive">Delete</Button>
                <Button variant="secondary"><Plus /></Button>
            </div>
            <DataTable columns={columns} data={data} noResultsMsg="This account has no personal access tokens."/>
        </div>
    );
}

function ChangePasswordTab() {
    const changePasswordSchema = z.object({
        currentPassword: z.string().min(1, { message: "Current password is required." }),
        newPassword: z.string().min(8, { message: "Password must be at least 8 characters long." }),
        confirmNewPassword: z.string().min(8, { message: "Password must be at least 8 characters long." }),
    });

    const form = useForm<z.infer<typeof changePasswordSchema>>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        },
    });

    const onSubmit = (data: z.infer<typeof changePasswordSchema>) => {
        console.log(data);

        toast.success("Password changed successfully.");
    }

    return (
        <div className="flex justify-center">
            <Form {...form}>
                <form className="flex flex-col gap-1 space-y-8 w-[30vw]" onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="currentPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your password" {...field} />
                                    </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your new password" {...field} />
                                    </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="confirmNewPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Confirm your new password" {...field} />
                                    </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" >Submit</Button>
                </form>
            </Form>
        </div>
    );
}

function GeneralTab() {
    const { userData } = useContext(AuthContext);

    return (
        <>
            <div className="flex items-center gap-5 p-6">
                <Avatar className="size-40 text-3xl">
                    <AvatarImage alt="profile-picture"/>
                    <AvatarFallback>{userData && userData.username?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="text-2xl font-semibold">{userData?.username}</h3>
                    <p className="text-muted-foreground">{userData?.email}</p>
                </div>
            </div>

            <div className="pt-5">
                <ChangeProfileData/>
            </div>

            <div className="pt-10">
                <h2 className="text-3xl font-bold">Account Removal</h2>
                <p className="text-muted-foreground pt-1">This will delete your account and all data associated with it. This action cannot be undone.</p>
                <Button className="mt-1" variant="destructive">Delete Account</Button>
            </div>
        </>
    );
}

function ChangeProfileData() {
    const { userData, APIProtected, updateUserData } = useContext(AuthContext);
    const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true);
    const [defaultValues, setDefaultValues] = useState<z.infer<typeof usernameSchema>>({
        username: userData?.username || "",
        name: userData?.fullName || "",
    });

    useEffect(() => {
        // Change default values is userData is updated
        form.setValue("username", userData?.username || "");
        form.setValue("name", userData?.fullName || "");

        setDefaultValues({
            username: userData?.username || "",
            name: userData?.fullName || "",
        });
    }, [userData]);

    useEffect(() => {
        checkValues();
    }, [defaultValues]);

    const usernameSchema = z.object({
        username: z.string().min(1, { message: "Username must be at least 1 character long." }).max(32, { message: "Username can't be longer than 32 characters." }),
        name: z.string().min(1, { message: "Name is required" }).max(150, { message: "Name can't be longer than 150 characters." }),
    });

    const form = useForm<z.infer<typeof usernameSchema>>({
        resolver: zodResolver(usernameSchema),
        defaultValues: {
            username: userData?.username || "",
            name: userData?.fullName || "",
        },
    });

    const onSubmit = (data: z.infer<typeof usernameSchema>) => {
        const new_data = {
            new_username: data.username,
            new_name: data.name,
        }
        
        APIProtected.put("api/profile/update", new_data).then(() => {
            updateUserData();
            toast.success("Profile updated successfully.");
        }).catch(() => {
            toast.error("An error occurred while updating your profile. Please try again.");
        });
    }

    const checkValues = () => {
        const keys = ["username", "name"] as const; // Keys for the form object

        for (let key of keys) {
            if (form.getValues(key) !== defaultValues[key]) { // Compare with default values
                setIsSubmitDisabled(false)
                return;
            }
        }

        setIsSubmitDisabled(true);
    }

    const resetValue = (key: 'username' | 'name') => {
        form.setValue(key, defaultValues[key])
        checkValues();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2 space-y-8 w-[40vw]" onChange={() => checkValues()}>
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <div className="flex gap-2">
                                        <Input placeholder="Your username" {...field} />
                                        <Button type="button" variant="ghost" onClick={() => resetValue("username")}><Undo /></Button>
                                    </div>
                                </FormControl>
                                <FormDescription>This is your public display name.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <div className="flex gap-2">
                                        <Input placeholder="Mai Sakurajima" {...field} />
                                        <Button type="button" variant="ghost" onClick={() => resetValue("name")}><Undo /></Button>
                                    </div>
                                </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button className="w-[10vw]" type="submit" disabled={isSubmitDisabled}>Save</Button>
            </form>
        </Form>
    );
}

export default function Profile() {
    return (
        <>
            <h2 className="text-3xl py-5 font-bold">My Profile</h2>
            <Tabs defaultValue="general">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="change-password">Change Password</TabsTrigger>
                    <TabsTrigger value="persona-access-token">Personal Access Tokens</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Card className="mt-2">
                        <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>Update your account's profile information and settings.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GeneralTab />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="change-password">
                    <Card className="mt-2">
                        <CardHeader>
                            <CardTitle>Change Your Password</CardTitle>
                            <CardDescription>Update your account's password.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChangePasswordTab />
                        </CardContent>
                    </Card>  
                </TabsContent>

                <TabsContent value="persona-access-token">
                    <Card className="mt-2">
                        <CardHeader>
                            <CardTitle>Personal Access Tokens</CardTitle>
                            <CardDescription>Manage your personal access tokens. Personal Access tokens are used to access the API when using our Self-Healing framework.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PersonalAccessTokensTab />
                        </CardContent>
                    </Card>
                 </TabsContent>
            </Tabs>
        </>
    );
}