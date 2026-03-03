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
      <Header title={title} description={description} />
      <Navigation />
      <div className="h-8" />
      <div className="w-full">{children}</div>
      <div className="h-12" />
    </div>
  );
};
