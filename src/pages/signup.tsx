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
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function SingupForm() {
    const signupFormSchema = z.object({
        email: z
        .string()
        .min(1, { message: "Email is required." })
        .email("This is not avalid email address."),
        username: z
            .string()
            .min(1, { message: "Username is required" })
            .max(32, { message: "Username can't be longer than 32 characters." }),
        firstName: z
            .string()
            .min(1, { message: "First name is required" }),
        lastName: z 
            .string(),
        password: z
            .string()
            .min(1, { message: "Password is required." })
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
            firstName: "",
            lastName: "",
            password: "",
            confirmPassword: ""
        }
    });

    const onSubmit = (values: z.infer<typeof signupFormSchema>) => {
        console.log(values);
    }

    return (
        <div className="h-full flex flex-col items-center justify-center w-full">
            <Card className="shadow-xl w-full max-w-[400px]">
                <CardHeader>
                    <CardTitle className="text-4xl">Sign Up</CardTitle>
                    <div className="text-sm text-muted-foreground flex">
                        <p>Already have an account?</p>
                        <Link to="/login" className="pl-1 underline text-blue-500 cursor-pointer">Login</Link>
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
                                    </FormItem>
                                )}/>
                            <FormField
                                control={form.control} 
                                name="username"
                                render={({field}) => (
                                    <FormItem className="mb-4">
                                        <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Your username" {...field}/>
                                            </FormControl>
                                        <FormMessage />
                                        <FormDescription>This is how others will see you. Don't use your real name.</FormDescription>
                                    </FormItem>
                                )}/>
                            <FormField
                                control={form.control} 
                                name="firstName"
                                render={({field}) => (
                                    <FormItem className="mb-4">
                                        <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input {...field}/>
                                            </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            <FormField
                                control={form.control} 
                                name="lastName"
                                render={({field}) => (
                                    <FormItem className="mb-4">
                                        <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input {...field}/>
                                            </FormControl>
                                        <FormMessage />
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
                            <FormField
                                control={form.control} 
                                name="confirmPassword"
                                render={({field}) => (
                                    <FormItem className="mb-4">
                                        <FormLabel>Confirm Password</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Confirm your password" type="password" {...field}/>
                                            </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            <Button type="submit" className="w-full">Sign up</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div> 
    );
}