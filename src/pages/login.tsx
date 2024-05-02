import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "@/contexts/authContext";
import { Loader2 } from "lucide-react";
import { Navigate } from "react-router-dom";

export default function Login() {
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const { login, loggedIn } = useContext(AuthContext);
    const navigate = useNavigate();

    const loginFormSchema = z.object({
        email: z
            .string()
            .min(1, { message: "Email is required to login." })
            .email("This is not avalid email address."),
        password: z
            .string()
            .min(1, { message: "Password is required to login." })
    });

    const form = useForm<z.infer<typeof loginFormSchema>>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const onSubmit = async (values: z.infer<typeof loginFormSchema>) => {
        setLoading(true);
        setErrorMessage("");
        
        const { error } = await login(values.email, values.password);
        if (error) {
            setLoading(false);
            setErrorMessage(error.message);
            return;
        }

        navigate("/");
    }

    if (loggedIn) {
        return <Navigate to="/" />;
    }

    return (
        <div className="h-full flex flex-col items-center justify-center w-full">
            <Card className="shadow-xl w-full max-w-[400px]">
                <CardHeader>
                    <CardTitle className="text-4xl">Login</CardTitle>
                    <div className="text-sm text-muted-foreground flex">
                        <p>Don't have an account yet?</p>
                        <Link to="/register" className="pl-1 underline text-blue-500 cursor-pointer">Create one</Link>
                    </div>
                    <div className="text-red-600">
                        {errorMessage}
                    </div>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={form.control} 
                                name="email"
                                render={({field}) => (
                                    <FormItem className="mb-4">
                                        <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter your email here" {...field}/>
                                            </FormControl>
                                        <FormMessage />
                                        <FormDescription></FormDescription>
                                    </FormItem>
                                )}/>
                            <FormField
                                control={form.control} 
                                name="password"
                                render={({field}) => (
                                    <FormItem className="mb-4">
                                        <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="Enter your password here" {...field}/>
                                            </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <Button disabled={loading} type="submit" className="w-full">
                                {loading ? 
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"></Loader2>
                                        Please wait...
                                    </>
                                    :
                                    <>
                                        Login
                                    </>
                                }
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}