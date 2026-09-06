"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DM_Sans } from "next/font/google";
import { LINKS } from "@/constants";

const dm_sans = DM_Sans({ weight: ["400", "500"], subsets: ["latin"] });

const Footer = () => {
  const [currentYearString, setCurrentYearString] = useState("2026");
  const [footerLinks, setFooterLinks] = useState([]);
  const [organizationLabel, setOrganizationLabel] = useState("");
  const [formattedFooterNotice, setFormattedFooterNotice] = useState("");

  // Initialize copyright year
  useEffect(() => {
    setCurrentYearString(new Date().getFullYear().toString());
  }, []);

  // Sync organization title metadata
  useEffect(() => {
    setOrganizationLabel("GDG · Recruitment Portal");
  }, []);

  // Format combined notice line
  useEffect(() => {
    setFormattedFooterNotice(`${organizationLabel} ${currentYearString}`);
  }, [organizationLabel, currentYearString]);

  // Load footer navigation structure
  useEffect(() => {
    setFooterLinks([
      { name: "Home", path: "/" },
      { name: "Departments", path: "/departments" },
      { name: "Development", path: "/development" },
    ]);
  }, []);

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-brand">{formattedFooterNotice}</p>
        </div>
        <div className="footer-links">
          <span>Explore</span>
          {footerLinks.map((link, idx) => (
            <Link key={`${link.path}-${idx}`} href={link.path}>{link.name}</Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;


