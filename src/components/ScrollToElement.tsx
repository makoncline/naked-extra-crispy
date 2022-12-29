import React from "react";

export const ScrollToElement = ({ id }: { id: string }) => {
  const handleClick = () => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <button
      onClick={handleClick}
      css={`
        position: fixed;
        bottom: var(--size-2);
        right: var(--size-2);
        z-index: var(--layer-important);
        opacity: 0.6;
      `}
    >
      ⬆
    </button>
  );
};
