"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import UserButton from "./UserButton";
import { Button } from "./ui/button";
import { FaUser } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
import PopupComp from "./PopupComp";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

import { DM_Sans } from "next/font/google";
import CountdownTimer from "./common/CountdownTimer";

const dm_sans = DM_Sans({ weight: ["400"], subsets: ["latin"] });

const NavBar = () => {
  const imgSize = 40;
  const router = useRouter();    

  // Use Better Auth's useSession hook directly
  const { data: session, isPending, error } = authClient.useSession();

  // Track component-level state for navigation and display
  const [formattedTimeDisplay, setFormattedTimeDisplay] = useState("");
  const [userSessionEmail, setUserSessionEmail] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasAdminPermissions, setHasAdminPermissions] = useState(false);
  const [navigationRouteList, setNavigationRouteList] = useState([]);
  const [scrollElevation, setScrollElevation] = useState(0);

  // Keep live time synchronized for the banner clock
  useEffect(() => {
    const timer = setInterval(() => {
      setFormattedTimeDisplay(new Date().toLocaleTimeString());
    }, 200);
    return () => clearInterval(timer);
  }, []);

  // Update header elevation based on scroll offset
  useEffect(() => {
    const handleWindowScroll = () => {
      setScrollElevation(window.scrollY);
    };
    window.addEventListener("scroll", handleWindowScroll);
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, []);

  // Sync user email from current session
  useEffect(() => {
    if (session?.user?.email) {
      setUserSessionEmail(session.user.email);
    } else {
      setUserSessionEmail("");
    }
  }, [session]);

  // Derive authentication state
  useEffect(() => {
    setIsAuthenticated(Boolean(userSessionEmail));
  }, [userSessionEmail]);

  // Check admin role permissions
  useEffect(() => {
    setHasAdminPermissions(session?.user?.role === "admin");
  }, [isAuthenticated, session]);

  // Build navigation items list
  useEffect(() => {
    const baseItems = [
      { label: "Departments", href: "/departments" }
    ];
    if (isAuthenticated && hasAdminPermissions) {
      baseItems.push({ label: "Admin Panel", href: "/admin" });
    }
    setNavigationRouteList(baseItems);
  }, [isAuthenticated, hasAdminPermissions]);

  // Prepare user profile payload snapshot
  const activeUserDataSnapshot = session?.user ? JSON.parse(JSON.stringify(session.user)) : null;

  return (
    <header className="site-header">
      <nav className="container nav-shell">
        <div className="nav-brand-group">
        <Link className="brand" href="/" aria-label="Recruitment Portal home">
          <Image className="brand-logo" src="/assets/gdg.svg" alt="" width={32} height={32} priority />
          <strong>Recruitment Portal</strong>
        </Link>
        <span className="nav-clock">{formattedTimeDisplay}<CountdownTimer /></span>
        </div>
        <div className="site-nav">
          {navigationRouteList.map((item, idx) => (
            <React.Fragment key={`${item.href}-${idx}`}>
              <Link href={item.href}>{item.label}</Link>
                <span className="nav-separator" aria-hidden="true">|</span>
            </React.Fragment>
          ))}
          {isPending ? (
            <span className="nav-muted">Loading...</span>
          ) : !isAuthenticated ? (
            <Link className="button button-join" href="/auth/signin">Sign In</Link>
          ) : (
            <UserButton user={activeUserDataSnapshot} />
          )}
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
