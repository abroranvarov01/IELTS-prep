import { Shell } from "@/widgets/shell";

// Onboarding is a short, focused flow: the shell without the product
// navigation (USER_FLOWS.md, Navigation and Practice Hub (M6), N2).
export default function OnboardingLayout({
  children,
}: LayoutProps<"/[locale]">) {
  return <Shell navigation={false}>{children}</Shell>;
}
