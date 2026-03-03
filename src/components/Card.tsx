import React from "react";
import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  hover?: boolean;
  id?: string;
};

const Card = ({ children, hover, ...rest }: CardProps) => {
  return (
    <article
      className={cn(
        "grid overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm md:grid-cols-2",
        hover && "transition-colors hover:bg-card/80"
      )}
      {...rest}
    >
      {children}
    </article>
  );
};

const Body = ({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div className={cn("flex flex-col gap-4 p-4 md:p-6", className)} {...props}>
      {children}
    </div>
  );
};

Card.Body = Body;

export { Card };
