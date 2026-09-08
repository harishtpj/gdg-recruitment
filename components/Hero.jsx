"use client";

import React from "react";
import Link from "next/link";

export default function Hero() {
  const headline = "Recruitment 2026";
  const subheading = "Ready to make your mark?";
  const descriptionText =
    "Join our departments and work on real-world projects. Your journey starts here.";

  return (
    <main className="hero">
      <div className="hero-glow hero-glow-blue" />
      <div className="hero-glow hero-glow-red" />
      <div className="hero-glow hero-glow-green" />

      <div className="container hero-content">
        <h1 className="display">{headline}</h1>
        <h2 className="hero-subheading">{subheading}</h2>
        <p className="hero-copy">{descriptionText}</p>

        <div className="hero-actions">
          <Link href="/departments">
            <button
              className="button button-primary"
              type="button"
            >
              Join us
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}