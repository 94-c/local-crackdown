// shadcn/ui components
export { Button, buttonVariants } from "./button"
export type { ButtonProps } from "./button"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./card"

export { Badge, badgeVariants } from "./badge"
export type { BadgeProps } from "./badge"

export { Progress } from "./progress"

export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs"

export { Input } from "./input"
export type { InputProps } from "./input"

export { Label } from "./label"

export { Textarea } from "./textarea"
export type { TextareaProps } from "./textarea"

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./dialog"

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "./select"

export { Separator } from "./separator"

export { Switch } from "./switch"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./tooltip"

export { Avatar, AvatarImage, AvatarFallback } from "./avatar"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./dropdown-menu"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./table"

export { Skeleton } from "./skeleton"

export { ScrollArea, ScrollBar } from "./scroll-area"

export { Checkbox } from "./checkbox"

export { Spinner } from "./spinner"
export type { SpinnerProps, SpinnerSize } from "./spinner"

export { Toaster } from "./sonner"

// ---------------------------------------------------------------------------
// Backward-compatible legacy exports
// ---------------------------------------------------------------------------

// LoadingSkeleton — backed by Skeleton
export { LoadingSkeleton } from "./legacy/LoadingSkeleton"

// ErrorAlert — standalone legacy component
export { ErrorAlert } from "./legacy/ErrorAlert"

// SuccessAlert — standalone legacy component
export { SuccessAlert } from "./legacy/SuccessAlert"

// EmptyState — standalone legacy component
export { EmptyState } from "./legacy/EmptyState"

// ProgressBar — wrapper around Progress
export { ProgressBar } from "./legacy/ProgressBar"

// FormField — standalone legacy component
export { FormField } from "./legacy/FormField"

// ToastProvider + useToast — legacy context-based toast (kept for pages that use it)
export { ToastProvider, useToast } from "./legacy/ToastProvider"
