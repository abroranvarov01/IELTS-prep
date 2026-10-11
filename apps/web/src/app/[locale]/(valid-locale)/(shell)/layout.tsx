import { Shell } from "@/widgets/shell";

export default function ShellLayout({ children }: LayoutProps<"/[locale]">) {
  return <Shell>{children}</Shell>;
}
