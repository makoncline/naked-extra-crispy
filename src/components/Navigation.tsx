import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Loading } from "./Loading";
import { DrumSvg } from "./DrumSvg";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const router = useRouter();
  const showLogoText = router.pathname !== "/";
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={cn(
        "text-sm text-muted-foreground hover:text-foreground",
        router.pathname === href && "text-foreground underline"
      )}
    >
      {label}
    </Link>
  );

  return (
    <div className="grid w-full grid-cols-[auto_1fr] gap-4 pt-2">
      <div className="flex flex-wrap items-center gap-4 max-[420px]:flex-col max-[420px]:items-start">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <DrumSvg />
          {showLogoText && (
            <div className="flex flex-col gap-0 leading-none text-muted-foreground">
              <span className="text-xl font-black">Naked</span>
              <span className="text-xs font-extrabold">Extra Crispy</span>
            </div>
          )}
        </Link>
        <div className="flex items-center gap-3">
          {navLink("/spots", "Spots")}
          {navLink("/ratings", "Ratings")}
          {navLink("/map", "Map")}
        </div>
      </div>
      <div className="justify-self-end text-right text-sm">
        {session ? (
          <div className="flex flex-col items-end gap-1">
            <span className="text-muted-foreground">{session.user?.email}</span>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              Sign out
            </Button>
          </div>
        ) : isLoading ? (
          <Loading scale={0.5} />
        ) : (
          <Button size="sm" onClick={() => signIn("google")}>
            Sign in
          </Button>
        )}
      </div>
    </div>
  );
};
