import { AuthContext } from "@/contexts/authContext";
import { ErrorCodes } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import { toast } from "sonner";
import { z } from "zod";
import ButtonLoader from "../custom/button-loader";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

export default function ChangePasswordTab() {
    const { APIProtected } = useContext(AuthContext);
    const [loading, setLoading] = useState<boolean>(false);

    const changePasswordSchema = z.object({
        currentPassword: z.string().min(1, { message: "Current password is required." }),
        newPassword: z.string().min(8, { message: "Password must be at least 8 characters long." }),
        confirmNewPassword: z.string().min(8, { message: "Password must be at least 8 characters long." }),
        signOutAllDevices: z.boolean(),
    });

    const form = useForm<z.infer<typeof changePasswordSchema>>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
            signOutAllDevices: false,
        },
    });

    const onSubmit = (data: z.infer<typeof changePasswordSchema>) => {
        if (form.getValues("newPassword") !== form.getValues("confirmNewPassword")) {
            form.setError("confirmNewPassword", {
                type: "value",
                message: "Passwords don't match"
            });
            return;
        }

        setLoading(true);

        const newPasswordData = {
            old_password: data.currentPassword,
            new_password: data.newPassword,
            sign_out_all: data.signOutAllDevices
        };

        APIProtected.post("api/profile/change_password", newPasswordData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(() => {
            form.reset();
            toast.success("Password changed successfully.");
        }).catch((err) => {
            console.log(err);
            if (err.response && err.response.data.detail.code === ErrorCodes.AUTHENTICATION_ERROR) {
                form.setError("currentPassword", {
                    type: "value",
                    message: "Invalid password"
                });

                return;
            }

            toast.error("An error occurred while changing your password. Please try again.");
        }).finally(() => {
            setLoading(false);
        });
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
                                        <Input type="password" placeholder="Your password" {...field} />
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
                                        <Input type="password" placeholder="Your new password" {...field} />
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
                                        <Input type="password" placeholder="Confirm your new password" {...field} />
                                    </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField 
                        control={form.control}
                        name="signOutAllDevices"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <Label className="pl-2" style={{margin: 0}}>Sign out of all devices except this one?</Label>
                            </FormItem>
                        )}
                    />
                    <ButtonLoader loading={loading} disabled={loading} type="submit">Submit</ButtonLoader>
                </form>
            </Form>
        </div>
    );
}