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
import { useSearchParams } from "react-router-dom";
import PageTitle from "@/components/custom/page-title";

export default function Profile() {
    const [currentQueryParameters, setSearchParams] = useSearchParams();

    const changeTab = (tab: string) => {
        const params = new URLSearchParams({["tab"]: tab || "general" });
        setSearchParams(params);
    }

    return (
        <>
            <PageTitle tabTitle="QAdapt | My Profile" />
            <h2 className="text-3xl py-5 font-bold">My Profile</h2>
            <Tabs defaultValue="general" value={currentQueryParameters.get("tab") || "general"} onValueChange={(value: string) => changeTab(value)}>
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="change-password">Change Password</TabsTrigger>
                    <TabsTrigger value="personal-access-token">Personal Access Tokens</TabsTrigger>
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

                <TabsContent value="personal-access-token">
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