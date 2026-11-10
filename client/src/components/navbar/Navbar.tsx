import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, LogOut, User, Menu } from "lucide-react";
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
import { useGetAdminJobs } from "@/hooks/useGetAdminJobs";
import { useHomePath } from "@/hooks/useHomePath";

type NavlinkType = {
  url: string;
  title: string;
  badge?: number;
};

const CountBadge: React.FC<{ count?: number }> = ({ count }) =>
  count ? (
    <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold leading-5 text-white">
      {count > 99 ? "99+" : count}
    </span>
  ) : null;

const Navbar: React.FC = () => {
  // recruiters see how many applicants still need a decision next to the Applicants link
  useGetAdminJobs();
  const adminJobs = useSelector((store: RootState) => store.job.adminAllJobs);
  const pendingApplicants = (adminJobs ?? []).reduce(
    (sum, job) => sum + (job.pendingApplications ?? 0),
    0
  );

  const recruiterNavLinks: NavlinkType[] = [
    { url: "/admin/companies", title: "Companies" },
    { url: "/admin/ad-jobs", title: "Jobs" },
    { url: "/admin/applicants", title: "Applicants", badge: pendingApplicants },
  ];

  const navLinks: NavlinkType[] = [
    { url: "/", title: "Home" },
    { url: "/jobs", title: "Jobs" },
    { url: "/search", title: "Search" },
    { url: "/about", title: "About" },
    { url: "/contact", title: "Contact" },
  ];

  const { user } = useSelector((store: RootState) => store.auth);

  const handleUserLogout = useLogout();
  const homePath = useHomePath();

  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 p-3 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex container mx-auto max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link to={homePath} aria-label="Go to home" className="block size-fit">
          <Logo />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {user && user.role === "recruiter" ? (
            <>
              {recruiterNavLinks.map(({ url, title, badge }, index) => (
                <Link
                  className="flex items-center font-medium hover:text-primary"
                  to={url}
                  key={index}
                >
                  {title}
                  <CountBadge count={badge} />
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
                <Link to={"/profile"} className="flex items-center w-full">
                  <DropdownMenuItem className="w-full">
                    <User className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                </Link>
                {user.role === "student" && (
                  <Link
                    to={"/applied-jobs"}
                    className="flex items-center w-full"
                  >
                    <DropdownMenuItem className="w-full">
                      <FileText className="mr-2 h-4 w-4" /> Applied Jobs
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

        {/* Mobile: theme toggle + menu */}
        <div className="flex items-center gap-2 md:hidden">
          <ModeToggle />
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 gap-0 p-0">
              <SheetHeader className="border-b">
                <SheetTitle>
                  <Link
                    to={homePath}
                    onClick={closeMenu}
                    aria-label="Go to home"
                  >
                    <Logo />
                  </Link>
                </SheetTitle>
              </SheetHeader>

              {/* Links */}
              <nav className="flex flex-col gap-1 p-3">
                {(user && user.role === "recruiter"
                  ? recruiterNavLinks
                  : navLinks
                ).map(({ url, title, badge }) => (
                  <Link
                    key={url}
                    to={url}
                    onClick={closeMenu}
                    className="flex items-center rounded-md px-3 py-2.5 font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    {title}
                    <CountBadge count={badge} />
                  </Link>
                ))}
              </nav>

              {/* Auth Section (Mobile) */}
              <div className="mt-auto flex flex-col gap-3 border-t p-4">
                {!user ? (
                  <>
                    <Link to={"/auth/login"} onClick={closeMenu}>
                      <Button variant={"outline"} className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link to={"/auth/signup"} onClick={closeMenu}>
                      <Button className="w-full">Signup</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.profile?.profilePhoto} />
                        <AvatarFallback>
                          {user.fullName?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h2 className="truncate font-medium">
                          {user.fullName}
                        </h2>
                        <p className="truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Link to={"/profile"} onClick={closeMenu}>
                      <Button variant="outline" className="w-full">
                        <User className="mr-2 h-4 w-4" /> Profile
                      </Button>
                    </Link>
                    {user.role === "student" && (
                      <Link to={"/applied-jobs"} onClick={closeMenu}>
                        <Button variant="outline" className="w-full">
                          <FileText className="mr-2 h-4 w-4" /> Applied Jobs
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        closeMenu();
                        handleUserLogout();
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                  </>
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
