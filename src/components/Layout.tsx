import { Header } from "./Header";
import { Navigation } from "./Navigation";

export const Layout = ({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="mx-auto grid w-full max-w-3xl justify-items-start px-4">
      <a
        href="#main-content"
        className="sr-only rounded-sm px-2 py-1 focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-background focus:text-foreground focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <Header title={title} description={description} />
      <Navigation />
      <div className="h-8" />
      <main id="main-content" className="w-full">
        {children}
      </main>
      <div className="h-12" />
    </div>
  );
};
