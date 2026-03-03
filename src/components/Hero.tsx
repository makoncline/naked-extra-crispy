import Link from "next/link";
import { siteConfig } from "../siteConfig";
import { LogoSVG } from "./LogoSvg";
import { Button } from "@/components/ui/button";

export const Hero = () => {
  const { title, description } = siteConfig;
  return (
    <div className="grid gap-5">
      <div className="grid items-center gap-4 md:grid-cols-2">
        <section className="grid gap-5">
          <h1 className="grid max-w-max gap-1 text-4xl leading-tight font-black md:text-5xl">
            <div>{title}</div>
            <div className="text-primary text-3xl md:text-4xl">{description}</div>
          </h1>
          <p className="text-muted-foreground">
            Naked Extra Crispy. It&apos;s how we like our wings. Good wings are
            crispy, but never breaded. They&apos;re tossed in buffalo sauce and come
            with a dip. Housemade sauces are key. We&apos;re not a wing spot, but we
            do wings right.
          </p>
        </section>
        <div className="flex items-center justify-center p-4">
          <LogoSVG />
        </div>
      </div>
      <div>
        <Button asChild>
          <Link href="#results">Show me the wings</Link>
        </Button>
      </div>
    </div>
  );
};
