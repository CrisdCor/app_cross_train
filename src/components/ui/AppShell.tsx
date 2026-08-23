export function AppShell({
  children,
  withBottomNavPadding = false,
}: {
  children: React.ReactNode;
  withBottomNavPadding?: boolean;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-bg">
      <div className={withBottomNavPadding ? "flex-1 pb-24" : "flex-1"}>
        {children}
      </div>
    </div>
  );
}
