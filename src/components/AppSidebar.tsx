import { Home, Search, BookOpen, LayoutGrid, Star, User, Gift, Zap, ChevronDown, Bell, Sidebar as SidebarIcon, MessageSquare, Plus, Trash2, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface AppSidebarProps {
  user: any;
  conversations: Conversation[];
  currentConversationId: string | null;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onSignOut: () => void;
}

export function AppSidebar({
  user,
  conversations,
  currentConversationId,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  onSignOut,
}: AppSidebarProps) {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const { toast } = useToast();

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteConversation(id);
    toast({
      title: "Conversation deleted",
      description: "The conversation has been removed.",
    });
  };

  return (
    <Sidebar className={`border-r border-gray-200 bg-[#fbfbfb] text-gray-800 ${collapsed ? "w-16" : "w-[260px]"}`} collapsible="icon">
      <SidebarHeader className="p-4 pt-5 pb-2">
        <div className="flex items-center justify-between w-full">
          {!collapsed && (
            <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-gray-100/50 justify-start h-9 max-w-[200px]">
              <div className="w-5 h-5 rounded flex items-center justify-center bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 text-white font-bold text-xs shrink-0">
                E
              </div>
              <span className="font-semibold text-[13px] truncate">Empirial's Lovable</span>
              <ChevronDown className="h-4 w-4 text-gray-400 shrink-0 ml-1" />
            </Button>
          )}
          {collapsed && (
            <div className="w-7 h-7 mx-auto rounded flex items-center justify-center bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 text-white font-bold text-sm shrink-0">
              E
            </div>
          )}
          {!collapsed && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600" onClick={toggleSidebar}>
              <SidebarIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup className="py-2">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg text-sm px-3 h-9 transition-colors">
                  <Home className="h-4 w-4 mr-3 shrink-0" />
                  {!collapsed && <span className="font-medium text-[13px]">Home</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg text-sm px-3 h-9 transition-colors justify-between w-full">
                  <div className="flex items-center">
                    <Search className="h-4 w-4 mr-3 shrink-0" />
                    {!collapsed && <span className="font-medium text-[13px]">Search</span>}
                  </div>
                  {!collapsed && (
                    <div className="bg-gray-200/50 rounded px-1.5 py-0.5 text-[10px] font-semibold text-gray-400">Ctrl K</div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg text-sm px-3 h-9 transition-colors">
                  <BookOpen className="h-4 w-4 mr-3 shrink-0" />
                  {!collapsed && <span className="font-medium text-[13px]">Resources</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="py-2">
          {!collapsed && (
            <SidebarGroupLabel className="h-6 text-[11px] font-semibold uppercase tracking-wider text-gray-500 px-3 mb-1">
              Projects
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg text-sm px-3 h-9 transition-colors">
                  <LayoutGrid className="h-4 w-4 mr-3 shrink-0" />
                  {!collapsed && <span className="font-medium text-[13px]">All projects</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg text-sm px-3 h-9 transition-colors">
                  <Star className="h-4 w-4 mr-3 shrink-0" />
                  {!collapsed && <span className="font-medium text-[13px]">Starred</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg text-sm px-3 h-9 transition-colors justify-between w-full">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-3 shrink-0" />
                    {!collapsed && <span className="font-medium text-[13px]">Created by me</span>}
                  </div>
                  {!collapsed && <ChevronDown className="h-3 w-3 text-gray-400" />}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="py-2">
           {!collapsed && (
             <SidebarGroupLabel className="h-6 text-[11px] font-semibold flex justify-between items-center text-gray-500 px-3 mb-1">
               <span className="uppercase tracking-wider">Recents</span>
               <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-gray-200 rounded" onClick={onNewConversation}>
                 <Plus className="h-3 w-3" />
               </Button>
             </SidebarGroupLabel>
           )}
           <SidebarGroupContent>
             <ScrollArea className="h-[200px]">
               <SidebarMenu className="gap-0.5">
                 {conversations.map((conv) => (
                   <SidebarMenuItem key={conv.id}>
                     <SidebarMenuButton
                       onClick={() => onSelectConversation(conv.id)}
                       isActive={currentConversationId === conv.id}
                       className={`w-full justify-between group rounded-md h-8 px-3 text-[13px] ${currentConversationId === conv.id ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                     >
                       <div className="flex items-center gap-2 flex-1 min-w-0">
                         <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
                         {!collapsed && (
                           <span className="truncate text-[12px]">{conv.title}</span>
                         )}
                       </div>
                       {!collapsed && (
                         <div
                           className="h-5 w-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-gray-200 cursor-pointer transition-all"
                           onClick={(e) => handleDelete(e, conv.id)}
                         >
                           <Trash2 className="h-3 w-3 text-red-500/70 hover:text-red-600" />
                         </div>
                       )}
                     </SidebarMenuButton>
                   </SidebarMenuItem>
                 ))}
               </SidebarMenu>
             </ScrollArea>
           </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 pb-4 space-y-3">
        {!collapsed && (
          <div className="space-y-2">
            <div className="bg-[#fcf8fa] border border-pink-100 rounded-xl p-3 flex items-start gap-3 cursor-pointer hover:bg-pink-50/50 transition-colors">
               <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900">Share Lovable</p>
                  <p className="text-[11px] text-gray-500 truncate">100 credits per paid referral</p>
               </div>
               <div className="h-7 w-7 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm shrink-0">
                  <Gift className="h-3.5 w-3.5 text-gray-700" />
               </div>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-xl p-3 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
               <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900">Upgrade to Pro</p>
                  <p className="text-[11px] text-gray-500 truncate">Unlock more features</p>
               </div>
               <div className="h-7 w-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                  <Zap className="h-3.5 w-3.5 text-indigo-600 fill-indigo-600" />
               </div>
            </div>
          </div>
        )}
        
        <div className={`pt-2 flex items-center ${collapsed ? 'justify-center' : 'justify-between px-1'}`}>
           <div className="w-8 h-8 rounded-full bg-[#8c736d] text-white flex items-center justify-center font-medium text-sm shadow-sm cursor-pointer hover:opacity-90">
              E
           </div>
           {!collapsed && (
             <div className="flex gap-1">
               <div className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer relative transition-colors">
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-[#fbfbfb]"></span>
               </div>
               <div className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors" onClick={onSignOut} title="Sign Out">
                  <LogOut className="h-4 w-4" />
               </div>
             </div>
           )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
