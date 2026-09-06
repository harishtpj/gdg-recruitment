"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function SignInPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user && !isPending) {
      router.push("/");
    }
  }, [session, isPending, router]);

  if (session?.user) {
    return (
      <div className="auth-shell">
        <div className="auth-status">
          <p>Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (mode === "signup" && !name) {
      toast.error("Please enter your name.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signup") {
        const res = await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: "/",
        });
        if (res?.error) {
          toast.error(res.error.message || "Failed to create account.");
        } else {
          toast.success("Account created successfully!");
          router.push("/");
        }
      } else {
        const res = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/",
        });
        if (res?.error) {
          toast.error(res.error.message || "Invalid credentials.");
        } else {
          toast.success("Signed in successfully!");
          router.push("/");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      toast.error("Authentication failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <Card className="auth-card">
        <CardHeader>
          <p className="section-label">Candidate Portal</p>
          <CardTitle>Recruitment 2026</CardTitle>
          <CardDescription>Sign in to continue your application.</CardDescription>
        </CardHeader>
        <CardContent>
        <div className="auth-mode-switcher">
        <Button
          variant={mode === "signin" ? "default" : "outline"}
          type="button"
          onClick={() => setMode("signin")}
          aria-pressed={mode === "signin"}
        >
          Sign In
        </Button>
        <Button
          variant={mode === "signup" ? "default" : "outline"}
          type="button"
          onClick={() => setMode("signup")}
          aria-pressed={mode === "signup"}
        >
          Create Account
        </Button>
      </div>

      <div className="auth-heading">
        <h2>{mode === "signin" ? "Sign In" : "Create Account"}</h2>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {mode === "signup" && (
          <div className="auth-field">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}

        <div className="auth-field">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="auth-field">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button className="auth-submit" type="submit" disabled={submitting}>
          {submitting ? "Processing..." : mode === "signin" ? "Sign In" : "Create Account"}
        </Button>
      </form>
        </CardContent>
      </Card>
    </main>
  );
}
