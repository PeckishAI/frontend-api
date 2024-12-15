import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  name: string;
  avatar?: string;
  role: string;
}

interface UserProfileSectionProps {
  user: User;
  onSignOut: () => void;
  onViewProfile: () => void;
  onSettings: () => void;
}

export function UserProfileSection({ user, onSignOut, onViewProfile, onSettings }: UserProfileSectionProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2 px-3 py-6 hover:bg-accent">
          <Avatar className="h-8 w-8">
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name} />
            ) : (
              <AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 flex flex-col items-start text-left group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.role}</span>
          </div>
          <ChevronUp className="ml-2 h-4 w-4 group-data-[collapsible=icon]:hidden" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" alignOffset={-12}>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuItem onClick={onViewProfile}>View Profile</DropdownMenuItem>
        <DropdownMenuItem onClick={onSettings}>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut}>Sign Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
