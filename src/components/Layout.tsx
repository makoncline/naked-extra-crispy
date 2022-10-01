import { Header } from "./Header";
import { Navigation } from "./Navigation";
import { Space } from "./Space";

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
        & > * {
          width: 100%;
        }
      `}
    >
      <Header title={title} description={description} />
      <Navigation />
      <Space size="md" />
      {children}
      <Space size="lg" />
    </div>
  );
};
