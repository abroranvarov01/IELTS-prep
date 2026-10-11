import Link from "next/link";

type StatusMessageProps = {
  title: string;
  body: string;
  home: { href: string; label: string };
  // With retry, "Try again" is the primary action and home becomes a quieter link.
  retry?: { label: string; onRetry: () => void };
};

const primaryAction =
  "inline-flex min-h-12 items-center rounded-md bg-brand-primary px-6 font-bold text-surface-base hover:bg-brand-primary-deep active:bg-brand-primary-deep";

// The not-found and error states: what happened, why, and the way out.
export function StatusMessage({
  title,
  body,
  home,
  retry,
}: StatusMessageProps) {
  return (
    <div className="flex flex-col items-start gap-4 py-8">
      <h1 className="text-heading-1 font-extrabold">{title}</h1>
      <p>{body}</p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        {retry ? (
          <>
            <button
              type="button"
              onClick={retry.onRetry}
              className={primaryAction}
            >
              {retry.label}
            </button>
            <Link
              href={home.href}
              className="inline-flex min-h-12 items-center font-medium underline"
            >
              {home.label}
            </Link>
          </>
        ) : (
          <Link href={home.href} className={primaryAction}>
            {home.label}
          </Link>
        )}
      </div>
    </div>
  );
}
