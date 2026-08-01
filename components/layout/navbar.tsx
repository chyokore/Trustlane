import { Menu } from "lucide-react";

import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";

const navigation = ["Home", "Features", "How it Works", "About"];

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <nav
        aria-label="Main navigation"
        className="container flex h-[72px] items-center justify-between"
      >
        <Logo />
        <div className="hidden items-center gap-7 md:flex">
          {navigation.map((item) => (
            <a
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
              key={item}
            >
              {item}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <Button asChild size="sm" variant="ghost">
            <a href="#signin">Sign In</a>
          </Button>
          <Button asChild size="sm">
            <a href="#signup">Sign Up</a>
          </Button>
        </div>
        <button
          aria-label="Open navigation menu"
          className="grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-card md:hidden"
          type="button"
        >
          <Menu className="size-5" />
        </button>
      </nav>
    </header>
  );
}
