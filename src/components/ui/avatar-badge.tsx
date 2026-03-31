interface AvatarBadgeProps {
  initials: string;
  size?: "sm" | "md" | "lg";
  accentClass?: string;
}

const sizes = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
};

export function AvatarBadge({ initials, size = "md", accentClass = "bg-primary/10 text-primary" }: AvatarBadgeProps) {
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold ${accentClass}`}>
      {initials}
    </div>
  );
}
