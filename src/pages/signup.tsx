import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "@/contexts/authContext";
import { useNavigate } from "react-router-dom";
import { ErrorCodes } from "@/types/types";
import ButtonLoader from "@/components/custom/button-loader";
import PageTitle from "@/components/custom/page-title";

export default function SingupForm() {
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const { signup } = useContext(AuthContext);
    const navigate = useNavigate();

    const signupFormSchema = z.object({
        email: z
        .string()
        .min(1, { message: "Email is required." })
        .email("This is not avalid email address."),
        username: z
            .string()
            .min(1, { message: "Username is required" })
            .max(32, { message: "Username can't be longer than 32 characters." }),
        fullName: z
            .string()
            .max(150, { message: "Full name can't be longer than 150 characters." }),
        password: z
            .string()
            .min(8, { message: "Password must be at least 8 characters long." })
            .max(50, { message: "Password can't be longer than 50 characters." }),
        confirmPassword: z
            .string()
            .min(1, { message: "Password is required." })
            .max(50, { message: "Password can't be longer than 50 characters." })
    });

    const form = useForm<z.infer<typeof signupFormSchema>>({
        resolver: zodResolver(signupFormSchema),
        defaultValues: {
            email: "",
            username: "",
            fullName: "",
            password: "",
            confirmPassword: ""
        }
    });

    const onSubmit = async (values: z.infer<typeof signupFormSchema>) => {
        setLoading(true);
        setErrorMessage("");

        if (values.password !== values.confirmPassword) {
            setLoading(false);
            form.setError("password", {
                type: "value",
                message: ""
            });
            return form.setError("confirmPassword", {
                type: "value",
                message: "Passwords do not match"
            });
        }
        
        const { error } = await signup(values.username, values.fullName, values.email, values.password);
        setLoading(false);

        if (error) {
            if (error.code === ErrorCodes.RESOURCE_CONFLICT) {
                return form.setError("email", {
                    type: "value",
                    message: error.message
                });                
            }

            setErrorMessage(error.message);
            return;
        }

        navigate("/");
    }

    return (
        <div className="h-full flex flex-col items-center justify-center w-full">
            <PageTitle tabTitle="QAdapt | Signup"/>
            <Card className="shadow-xl w-full max-w-[400px]">
                <CardHeader>
                    <CardTitle className="text-4xl">Sign Up</CardTitle>
                    <div className="text-sm text-muted-foreground flex">
                        <p>Already have an account?</p>
                        <Link to="/login" className="pl-1 underline text-blue-500 cursor-pointer">Login</Link>
                    </div>
                    <div className="text-red-600">
                        {errorMessage}
                    </div>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={form.control} 
                                name="email"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel htmlFor="email">Email</FormLabel>
                                            <FormControl>
                                                <Input id="email" placeholder="Enter your email here" {...field}/>
                                            </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            <FormField
                                control={form.control} 
                                name="username"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel htmlFor="username">Username</FormLabel>
                                            <FormControl>
                                                <Input id="username" placeholder="Your username" {...field}/>
                                            </FormControl>
                                        <FormMessage />
                                        <FormDescription>This is how others will see you.</FormDescription>
                                    </FormItem>
                                )}/>
                            <FormField
                                control={form.control} 
                                name="fullName"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel htmlFor="full-name">Full Name</FormLabel>
                                            <FormControl>
                                                <Input id="full-name" placeholder="Your full name" {...field}/>
                                            </FormControl>
                                        <FormMessage />
                                        <FormDescription>Optional</FormDescription>
                                    </FormItem>
                                )}/>
                            <FormField
                                control={form.control} 
                                name="password"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel htmlFor="password">Password</FormLabel>
                                            <FormControl>
                                                <Input id="password" type="password" placeholder="Enter your password here" {...field}/>
                                            </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            <FormField
                                control={form.control} 
                                name="confirmPassword"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel htmlFor="password-confirm">Confirm Password</FormLabel>
                                            <FormControl>
                                                <Input id="password-confirm" placeholder="Confirm your password" type="password" {...field}/>
                                            </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            <ButtonLoader 
                            loading={loading} 
                            disabled={loading} 
                            type="submit"
                            className="w-full"
                            loadingElement={
                                <>
                                    Signing up...
                                </>
                            }
                            >
                                Sign Up
                            </ButtonLoader>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div> 
    );
}