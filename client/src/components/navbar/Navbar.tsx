import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Menu } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router";
import Logo from "@/shared/Logo";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ModeToggle } from "@/shared/ModeToggle";
import { useLogout } from "@/hooks/useLogout";

type NavlinkType = {
  url: string;
  title: string;
};

const Navbar: React.FC = () => {
  const recruiterNavLinks: NavlinkType[] = [
    { url: "/admin/companies", title: "Companies" },
    { url: "/admin/ad-jobs", title: "Jobs" },
  ];

  const navLinks: NavlinkType[] = [
    { url: "/", title: "Home" },
    { url: "/jobs", title: "Jobs" },
    { url: "/browse", title: "Browse" },
    { url: "/about", title: "About" },
    { url: "/contact", title: "Contact" },
  ];

  const { user } = useSelector((store: RootState) => store.auth);

  const handleUserLogout = useLogout();

  return (
    <header className="z-10 relative p-3 border-b">
      <nav className="flex container mx-auto max-w-7xl items-center justify-between">
        {/* Logo */}
        <Logo />

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {user && user.role === "recruiter" ? (
            <>
              {recruiterNavLinks.map(({ url, title }, index) => (
                <Link
                  className="font-medium hover:text-primary"
                  to={url}
                  key={index}
                >
                  {title}
                </Link>
              ))}
            </>
          ) : (
            <>
              {navLinks.map(({ url, title }, index) => (
                <Link
                  className="font-medium hover:text-primary"
                  to={url}
                  key={index}
                >
                  {title}
                </Link>
              ))}
            </>
          )}
        </div>

        {/* Auth Section (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <ModeToggle />
          {!user ? (
            <>
              <Link to={"/auth/login"}>
                <Button variant={"outline"} size="sm">
                  Login
                </Button>
              </Link>
              <Link to={"/auth/signup"}>
                <Button size="sm">Signup</Button>
              </Link>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={user.profile?.profilePhoto} />
                  <AvatarFallback>
                    {user.fullName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12">
                      <AvatarImage src={user.profile?.profilePhoto} />
                      <AvatarFallback>
                        {user.fullName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <section>
                      <h2 className="font-medium">{user.fullName}</h2>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </section>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user && user.role === "student" && (
                  <Link to={"/profile"} className="flex items-center w-full">
                    <DropdownMenuItem className="w-full">
                      <User className="mr-2 h-4 w-4" /> Profile
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuItem onClick={handleUserLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>

              {/* Links */}
              <div className="flex flex-col gap-4 mt-6">
                {navLinks.map(({ url, title }, index) => (
                  <Link
                    className="font-medium hover:text-primary"
                    to={url}
                    key={index}
                  >
                    {title}
                  </Link>
                ))}
              </div>

              {/* Auth Section (Mobile) */}
              <div className="mt-6 flex flex-col gap-3">
                {!user ? (
                  <>
                    <Link to={"/auth/login"}>
                      <Button variant={"outline"} className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link to={"/auth/signup"}>
                      <Button className="w-full">Signup</Button>
                    </Link>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.profile?.profilePhoto} />
                      <AvatarFallback>
                        {user.fullName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-medium">{user.fullName}</h2>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
