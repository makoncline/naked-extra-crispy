import { Button } from "@/components/ui/button";

export const scrollToId = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

export const ScrollToElement = ({ id }: { id: string }) => {
  const handleClick = () => {
    scrollToId(id);
  };

  return (
    <Button
      onClick={handleClick}
      size="icon"
      variant="secondary"
      className="fixed right-3 bottom-3 z-50 opacity-70"
      aria-label="scroll to section"
    >
      ⬆
    </Button>
  );
};
