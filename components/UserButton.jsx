"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function UserButton({ user }) {
  const router = useRouter();

  if (!user) return null;

  const handleSignOut = () => {
    router.push("/auth/signout");
  };

  const getInitials = (firstName, lastName) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) return firstName.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  const displayName = user.name || user.email;

  return (
    <div className="user-menu-inline">
      <Avatar className="user-avatar">
        <AvatarImage src={user.image || ""} alt="" />
        <AvatarFallback>{getInitials(user.name, "")}</AvatarFallback>
      </Avatar>
      <span className="user-menu-name">{displayName}</span>
      <Button variant="outline" className="user-signout-button" type="button" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
  );
} 