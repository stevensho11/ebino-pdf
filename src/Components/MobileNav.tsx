"use client";
import { ArrowRightCircle, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const MobileNav = ({ isAuth }: { isAuth: boolean }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleOpen = () => setIsOpen((prev) => !prev);
  const pathName = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (isOpen) toggleOpen();
  }, [pathName]);

  const closedOnCurrent = (href: string) => {
    if (pathName === href) {
      toggleOpen();
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        navRef.current &&
        !navRef.current.contains(event.target as Node) &&
        toggleRef.current &&
        !toggleRef.current.contains(event.target as Node)
      ) {
        toggleOpen();
      }
    }

    // Add when the menu is open and remove when it is closed
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    }

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, navRef]);

  return (
    <div className="sm:hidden">
      <Menu
        ref={toggleRef}
        onClick={toggleOpen}
        className="relative z-50 h-5 w-5 text-zinc-500"
      />

      {isOpen ? (
        <div
          ref={navRef}
          className="fixed animate-in slide-in-from-top-5 fade-in-20 inset-0 z-0 w-full"
        >
          <ul className="absolute bg-white border-b border-zinc-200 shadow-xl grid w-full gap-3 px-10 pt-20 pb-8">
            {!isAuth ? (
              <>
                <li>
                  <Link
                    onClick={() => closedOnCurrent("/sign-up")}
                    href="/sign-up"
                    className="flex items-center w-full font-semibold text-green-600"
                  >
                    Get Started <ArrowRightCircle className="ml-2 h-5 w-5" />
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li>
                  <Link
                    onClick={() => closedOnCurrent("/sign-in")}
                    href="/sign-in"
                    className="flex items-center w-full font-semibold"
                  >
                    Sign In
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li>
                  <Link
                    onClick={() => closedOnCurrent("/pricing")}
                    href="/pricing"
                    className="flex items-center w-full font-semibold"
                  >
                    Pricing
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    onClick={() => closedOnCurrent("/dashboard")}
                    href="/dashboard"
                    className="flex items-center w-full font-semibold"
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li>
                  <Link
                    href="/sign-out"
                    className="flex items-center w-full font-semibold"
                  >
                    Sign Out
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default MobileNav;
