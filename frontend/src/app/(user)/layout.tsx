import { UserGuard } from "./user-guard";
import { MobileShell } from "@/components/mobile-shell";
import { PushNotificationRegister } from "@/components/push-notification-register";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserGuard>
      <MobileShell>
        {children}
      </MobileShell>
      <PushNotificationRegister />
    </UserGuard>
  );
}
