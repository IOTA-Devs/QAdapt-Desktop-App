import { AuthContext } from "@/contexts/authContext";
import { useContext } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, User, LogOut, Settings, Info, SunMoon } from "lucide-react"
import { NavLink } from "react-router-dom";
import { 
    DropdownMenu, 
    DropdownMenuTrigger, 
    DropdownMenuContent, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuItem, 
    DropdownMenuSub, 
    DropdownMenuSubTrigger, 
    DropdownMenuPortal, 
    DropdownMenuSubContent 
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/themeContext";
import { SidebarMenuProps } from "@/models/types";

export default function SidebarMenu({ children, items } : SidebarMenuProps ) {
    const { userData, logout } = useContext(AuthContext);
    const { setTheme } = useTheme();
  
    return (
      <div className="flex flex-row">
        <aside className="h-screen w-72">
            <nav className="h-full flex flex-col border-r shadow-sm justify-between">
                <div>
                    <div className="flex flex-row gap-2 items-center p-3">
                        <img className="w-10" src="/images/logos/QAdapt_Logo.png" alt="QAdapt_logo" />
                        <h3 className="text-lg font-semibold">QAdapt</h3>
                    </div>
                    <div className="flex flex-col gap-2 m-1 mt-5">
                        {items.map((item, index) => (
                            <NavLink key={index} to={item.link} 
                            className={({ isActive }) => `flex flex-row items-center gap-2 p-2 rounded-md text-muted-foreground text-sm hover:bg-muted transition-all duration-75 ease-in-out ${isActive && "bg-muted text-primary"}`}>
                                {item.icon}
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
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
                                            <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                                <DropdownMenuItem>
                                    <Info className="mr-2 h-4 w-4" />
                                    <span>Help</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout}>
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