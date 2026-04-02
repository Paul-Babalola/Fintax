import Link from "next/link";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: string; // for scroll-to-form
  };
  secondary?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon, title, description, action, secondary }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-[#1A6B4A] text-white text-sm font-medium rounded-lg hover:bg-[#145a3d] transition-colors"
            >
              {action.label}
            </Link>
          ) : (
            <a
              href="#entry-form"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-[#1A6B4A] text-white text-sm font-medium rounded-lg hover:bg-[#145a3d] transition-colors"
            >
              {action.label}
            </a>
          )}
          {secondary && (
            <Link
              href={secondary.href}
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              {secondary.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
