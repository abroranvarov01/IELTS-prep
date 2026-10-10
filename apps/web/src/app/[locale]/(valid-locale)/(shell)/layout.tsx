import { Shell } from "../../Shell";

export default function ShellLayout({ children }: LayoutProps<"/[locale]">) {
  return <Shell>{children}</Shell>;
}
