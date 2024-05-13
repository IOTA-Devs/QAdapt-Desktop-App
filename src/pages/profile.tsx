import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// function PersonalAccessTokensTab() {
// }

// function ChangePasswordTab() {
// }

// function GeneralTab() {
// }

export default function Profile() {
    return (
        <>
            <h2 className="text-3xl py-5">Profile Settings</h2>
            <Tabs defaultValue="general">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="change-password">Change Password</TabsTrigger>
                    <TabsTrigger value="persona-access-token">Personal Access Tokens</TabsTrigger>
                </TabsList>
                <TabsContent value="general">General Works</TabsContent>
                <TabsContent value="change-password">Change Password Works</TabsContent>
                <TabsContent value="persona-access-token">Personal Access Tokens Works</TabsContent>
            </Tabs>
        </>
    );
}