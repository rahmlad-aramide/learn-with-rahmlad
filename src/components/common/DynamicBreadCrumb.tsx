import Link from "next/link";
import React from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  pageTitle: string;
  links?: BreadcrumbItem[];
}

const DynamicPageBreadcrumb: React.FC<BreadcrumbProps> = ({
  pageTitle,
  links = [],
}) => {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
        {pageTitle}
      </h2>
      <nav>
        <ol className="flex items-center gap-1.5">
          {/* Static Home Link */}
          <li>
            <Link
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
              href="/"
            >
              Home
              <ChevronIcon />
            </Link>
          </li>

          {/* Dynamic Nested Links */}
          {links.map((link, index) => (
            <li key={index} className="flex items-center gap-1.5">
              {link.href ? (
                <Link
                  href={link.href}
                  className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                >
                  {link.label}
                </Link>
              ) : (
                <span className="text-sm text-gray-800 dark:text-white/90">
                  {link.label}
                </span>
              )}
              {/* Show icon only if it's not the last item */}
              {index < links.length - 1 && <ChevronIcon />}
            </li>
          ))}

          {/* Final Active Page (Title) */}
          {links.length > 0 && <ChevronIcon />}
          <li className="text-sm text-gray-800 dark:text-white/90">
            {pageTitle}
          </li>
        </ol>
      </nav>
    </div>
  );
};

// Reusable Icon Component to keep the JSX clean
const ChevronIcon = () => (
  <svg
    className="stroke-current text-gray-400"
    width="17"
    height="16"
    viewBox="0 0 17 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default DynamicPageBreadcrumb;
