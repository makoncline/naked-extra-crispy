import { col } from "../styles/utils";
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
    <div
      css={`
        display: grid;
        justify-items: center;
        max-width: var(--size-md);
        margin: 0 auto;
        padding: 0 var(--size-2);
      `}
    >
      <Header title={title} description={description} />
      <Navigation />
      {children}
    </div>
  );
};
