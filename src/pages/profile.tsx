import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import GeneralTab from "@/components/profile-page/general-tab";
import ChangePasswordTab from "@/components/profile-page/change-password-tab";
import PersonalAccessTokensTab from "@/components/profile-page/personal-access-tokens-tab";

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