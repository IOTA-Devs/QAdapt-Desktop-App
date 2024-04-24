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
import { Link } from "react-router-dom";

export default function Signin() {
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

    const onSubmit = (values: z.infer<typeof loginFormSchema>) => {
        console.log(values);
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
                            <Button type="submit" className="w-full">Login</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}