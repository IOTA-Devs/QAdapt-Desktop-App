import { SessionContext } from "@/contexts/SessionContext";
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, User, LogOut, Settings, Info, SunMoon } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function SidebarMenu({ children, isProtected } : { children: React.ReactNode, isProtected: boolean }) {
    const { loggedIn, userData } = useContext(SessionContext);
  
    if (isProtected && !loggedIn) {
      return <Navigate to="/login" />;
    }
  
    return (
      <div className="flex flex-row gap-5">
        <aside className="h-screen w-52">
            <nav className="h-full flex flex-col border-r shadow-sm justify-between">
                <div className="flex flex-row gap-2 items-center p-3">
                    <img className="w-10" src="/images/logos/QAdapt_Logo.png" alt="QAdapt_logo" />
                    <h3 className="text-lg font-semibold">QAdapt</h3>
                </div>

                <div className="flex flex-row border-t items-center gap-2 p-3">
                    <Avatar>
                        <AvatarImage alt="profile-avatar"/>
                        <AvatarFallback>{userData && userData.username?.[0]}</AvatarFallback>
                    </Avatar>
                    <p>{userData?.username}</p>
                    
                    <div className="ml-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger><MoreHorizontal/></DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        <SunMoon className="mr-2 h-4 w-4" />
                                        <span>Theme</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent>
                                            <DropdownMenuItem>Dark</DropdownMenuItem>
                                            <DropdownMenuItem>Light</DropdownMenuItem>
                                            <DropdownMenuItem>System</DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                                <DropdownMenuItem>
                                    <Info className="mr-2 h-4 w-4" />
                                    <span>Help</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log Out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </nav>
        </aside>
        <div>
          {children}
        </div>
      </div>
    );
  }