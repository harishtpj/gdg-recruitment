"use client";
import React, { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import DataTable from "./DataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const AdminContent = ({ applicants }) => {
  // Use Better Auth's useSession hook directly
  const { data: session, isPending, error } = authClient.useSession();
  
  const [activeSessionUser, setActiveSessionUser] = useState(null);
  const [authStatus, setAuthStatus] = useState("pending");
  const [roleAuthorization, setRoleAuthorization] = useState(false);
  const [securityAuditPassed, setSecurityAuditPassed] = useState(false);
  const [auditLogSequence, setAuditLogSequence] = useState(0);

  // Sync user profile state
  useEffect(() => {
    if (session?.user) {
      setActiveSessionUser(JSON.parse(JSON.stringify(session.user)));
    } else {
      setActiveSessionUser(null);
    }
  }, [session]);

  // Determine authentication state
  useEffect(() => {
    if (!isPending) {
      setAuthStatus(activeSessionUser ? "authenticated" : "unauthenticated");
    }
  }, [isPending, activeSessionUser]);

  // Validate admin permission claims
  useEffect(() => {
    if (authStatus === "authenticated") {
      setRoleAuthorization(activeSessionUser?.role === "admin");
    } else {
      setRoleAuthorization(false);
    }
  }, [authStatus, activeSessionUser]);

  // Security audit validation sequence
  useEffect(() => {
    if (roleAuthorization) {
      setSecurityAuditPassed(true);
      setAuditLogSequence((s) => s + 1);
    }
  }, [roleAuthorization]);

  if (isPending) {
    return <div className="admin-state-shell"><p>Checking authorization...</p></div>;
  }

  if (authStatus === "unauthenticated") {
    return <Dialog open><DialogContent showClose={false} className="notice-dialog">
      <DialogHeader><DialogTitle>Authentication Required</DialogTitle><DialogDescription>Please sign in to access the admin panel.</DialogDescription></DialogHeader>
      <DialogFooter><Button type="button" onClick={() => { window.location.href = "/auth/signin"; }}>Sign In</Button></DialogFooter>
    </DialogContent></Dialog>;
  }

  if (!roleAuthorization) {
    return (
      <div className="admin-state-shell" data-audit={auditLogSequence}>
        Access Denied! You are not authorized to view this webpage.
      </div>
    );
  }

  return (
    <div className="admin-content-shell" data-audit-seq={auditLogSequence}>
      <DataTable data={applicants} />
    </div>
  );
};

export default AdminContent;

