import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { Moon, Sun } from "lucide-react"
import CreateNewChat from "@/components/Chat/CreateNewChat"
import NewGroupChatModel from "@/components/Chat/NewGroupChatModel"
import GroupChatList from "@/components/Chat/GroupChatList"
import DirectMessageList from "@/components/Chat/DirectMessageList"
import { useThemeStore } from "@/stores/useThemeStore"
import { useAuthStore } from "@/stores/useAuthStore"
import { AddFriendModel } from "../Chat/AddFriendModel"
import NotificationBell from "../Chat/NotificationBell"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  
  const {isDark, toggleTheme} = useThemeStore()
  const { user } = useAuthStore(); // Lấy hàm logout ra

  return (
    <Sidebar 
      variant="inset" 
      {...props}
    >
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              size="lg" 
              asChild
              className="bg-gradient-primary"
            >

              <a href="/">
                <div className="flex w-full items-center px-2 justify-between">
                  <h1 className="text-xl font-bold text-white">VIT CHAT</h1>
                  <div className="flex items-center gap-2">
                    <Sun className="size-4 text-white/80"/>
                    <Switch
                      checked={isDark}
                      onCheckedChange={toggleTheme}
                      className="data-[state=checked]:bg-white/80"
                    />
                    <Moon className="size-4 text-white/80"/>

                  </div>
                </div>

              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Bắt đầu phần side bar Content */}

      <SidebarContent className="beautiful-scrollbar">

        {/* New Chat */}
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="flex items-center gap-2 px-1 py-1">
              <div className="flex-1">
                <h3>ĐOẠN CHAT</h3>
              </div>
              <NotificationBell/>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Kết thúc phần hiển thị New chat */}

        {/* Group chat */}

        <SidebarGroup>
          <SidebarGroupLabel className="uppercase">
            Nhóm chat
          </SidebarGroupLabel>
          <SidebarGroupAction title="Tạo nhóm" className="cursor-pointer">
            <NewGroupChatModel/>

          </SidebarGroupAction>

          <SidebarGroupContent>

            <GroupChatList/>


          </SidebarGroupContent>
        </SidebarGroup>

        {/* Kết thúc phần hiển thị Group chat */}


        {/* Direct Message */}

        <SidebarGroup>
          <SidebarGroupLabel className="uppercase">
            <h2>BẠN BÈ</h2>
          </SidebarGroupLabel>
          <SidebarGroupAction 
            title="Kết bạn"
            className="cursor-pointer"
          >

            <AddFriendModel/>

          </SidebarGroupAction>

          <SidebarGroupContent>

            <DirectMessageList/>

          </SidebarGroupContent>
        </SidebarGroup>

        {/* Kết thúc phần hiển thị Direct Messages */}
        
      </SidebarContent>

      {/* Kết thúc phần side bar Content */}

      {/* Footer */}
      <SidebarFooter>
        {user && <NavUser user={user}/>}
      </SidebarFooter>
    </Sidebar>
  )
}
