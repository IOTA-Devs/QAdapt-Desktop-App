import { AuthContext } from "@/contexts/authContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useContext, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Undo } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import { toast } from "sonner";
import { z } from "zod";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
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
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

function DeleteAccountPasswordConfirm({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const passwordFormSchema = z.object({
        password: z.string().min(1, "Password is required")
    });

    const form = useForm<z.infer<typeof passwordFormSchema>>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            password: ""
        }
    });
    
    const onSubmit = (e: z.infer<typeof passwordFormSchema>) => {
        form.reset();

        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm by entering your Account Password</DialogTitle>
                    <DialogDescription>
                        Once you enter your password and click the confirm button, your account will be queued for deletion.
                        The period for deletion can take up to 24 hours. During this period you will not be able to access 
                        your account or create a new one with the same email until it is completely removed from our servers.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Enter your password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Password" {...field} />
                                        </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}>
                        </FormField>

                        <DialogFooter>
                            <Button variant="destructive" type="submit">Confirm</Button>
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
        name: z.string().max(150, { message: "Name can't be longer than 150 characters." }),
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
                                <div className="flex gap-2">
                                    <FormControl>
                                        <Input placeholder="Your username" {...field} />
                                    </FormControl>
                                    <Button type="button" variant="ghost" onClick={() => resetValue("username")}><Undo /></Button>
                                </div>
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
                                <div className="flex gap-2">
                                    <FormControl>
                                        <Input placeholder="Mai Sakurajima" {...field} />
                                    </FormControl>
                                    <Button type="button" variant="ghost" onClick={() => resetValue("name")}><Undo /></Button>
                                </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button className="w-[10vw]" type="submit" disabled={isSubmitDisabled}>Save</Button>
            </form>
        </Form>
    );
}

export default function GeneralTab() {
    const { userData } = useContext(AuthContext);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
    const [confirmPasswordOpen, setConfirmPasswordOpen] = useState<boolean>(false);

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
                <AlertDialog open={confirmDeleteOpen} onOpenChange={(open) => setConfirmDeleteOpen(open)}>
                    <Button className="mt-1" variant="destructive" onClick={() => setConfirmDeleteOpen(true)}>Delete Account</Button>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your account
                                and remove your data from our servers.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => setConfirmPasswordOpen(true)}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <DeleteAccountPasswordConfirm open={confirmPasswordOpen} onOpenChange={(open) => setConfirmPasswordOpen(open)}/>
        </>
    );
}