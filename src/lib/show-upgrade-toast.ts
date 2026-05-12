export async function showUpgradeToast(): Promise<void> {
  const { toast } = await import("sonner")
  toast.info("Upgrade to Pro to use AI features", {
    action: { label: "Upgrade", onClick: () => { window.location.href = "/upgrade" } },
  })
}
