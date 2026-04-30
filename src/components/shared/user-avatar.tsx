import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

function getInitials(name: string | null | undefined): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

interface UserAvatarProps {
  user: { name?: string | null; image?: string | null }
  size?: "sm" | "default" | "lg"
}

export function UserAvatar({ user, size = "default" }: UserAvatarProps) {
  return (
    <Avatar size={size}>
      {user.image && <AvatarImage src={user.image} alt={user.name ?? ""} />}
      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
    </Avatar>
  )
}
