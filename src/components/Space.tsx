export const Space = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  return (
    <div
      css={`
        height: var(--space-${size});
      `}
    />
  );
};
