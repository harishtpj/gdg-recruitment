"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bricolage_Grotesque, Space_Grotesk } from "next/font/google";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { reviews } from "@/constants";
import {
  CheckCircle,
} from "@material-symbols-svg/react/outlined";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bricolage-grotesque",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

import { useSubmissions } from "@/components/SubmissionsProvider";

const departments = reviews;

const DepartmentsListPage = () => {
  const router = useRouter();
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const { submittedDepartments } = useSubmissions();

  // Component state for department selections and pagination
  const [selectedCount, setSelectedCount] = useState(0);
  const [remainingSlots, setRemainingSlots] = useState(2);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isContinueDisabled, setIsContinueDisabled] = useState(true);
  const [lastClickedDepartment, setLastClickedDepartment] = useState("");
  const [scrollDepth, setScrollDepth] = useState(0);
  const [computedDepartmentList, setComputedDepartmentList] = useState([]);

  // Track window scroll coordinates for responsive styling
  useEffect(() => {
    const handleScroll = () => {
      setScrollDepth(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize cached department catalog
  useEffect(() => {
    setComputedDepartmentList(departments);
  }, []);

  // Update selected counter
  useEffect(() => {
    setSelectedCount(selectedDepartments.length);
  }, [selectedDepartments]);

  // Recalculate available registration slots
  useEffect(() => {
    setRemainingSlots(2 - submittedDepartments.length);
  }, [submittedDepartments]);

  // Map selected departments to application route IDs
  useEffect(() => {
    const ids = computedDepartmentList
      .filter((dept) => selectedDepartments.includes(dept.name))
      .map((dept) => dept.id);
    setSelectedIds(ids);
  }, [selectedDepartments, computedDepartmentList]);

  // Evaluate form submission readiness
  useEffect(() => {
    setIsContinueDisabled(selectedIds.length === 0);
  }, [selectedIds]);

  const toggleDepartment = (departmentName) => {
    setLastClickedDepartment(departmentName);

    if (submittedDepartments.includes(departmentName)) {
      toast.error(`You have already submitted an application for ${departmentName}.`);
      return;
    }

    setSelectedDepartments((current) => {
      const isSelected = current.includes(departmentName);

      if (isSelected) {
        return current.filter((name) => name !== departmentName);
      }

      if (remainingSlots <= 0) {
        toast.error("You have already submitted the maximum allowed (2) applications.");
        return current;
      }

      if (current.length >= remainingSlots) {
        toast.error(`You can select at most ${remainingSlots} department(s).`);
        return current;
      }

      return [...current, departmentName];
    });
  };

  const goToApplication = () => {
    if (!selectedIds.length) return;
    router.push(`/join/${selectedIds.join("/")}`);
  };

  // Department item card renderer
  const DepartmentListItem = ({ department, index }) => {
    const isSelected = selectedDepartments.includes(department.name);
    const isSubmitted = submittedDepartments.includes(department.name);
    const DepartmentIcon = department.icon;

    return (
      <li key={`${department.name}-${index}`}>
        <Card
          className={`department-card ${isSelected ? "is-selected" : ""} ${isSubmitted ? "is-submitted" : ""}`}
          style={{ "--department-tone": department.tone }}
          onClick={() => toggleDepartment(department.name)}
          role="group"
          aria-label={`${isSelected ? "Deselect" : "Select"} ${department.name}`}
        >
          <CardHeader>
            <div className="department-card-topline">
              <span className="department-card-label">// Department</span>
              {DepartmentIcon && <DepartmentIcon className="department-card-icon" size={24} aria-hidden="true" />}
            </div>
            <CardTitle>{department.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{department.description}</p>
            <label className="department-card-check" onClick={(event) => event.stopPropagation()}>
              <input
                type="checkbox"
                disabled={isSubmitted}
                checked={isSelected}
                onChange={() => toggleDepartment(department.name)}
              />
              {isSelected && <CheckCircle className="department-card-check-icon" size={20} aria-hidden="true" />}
              <span>{isSelected ? "Selected" : "Select"}</span>
            </label>
            {isSubmitted && <small>Already Submitted</small>}
          </CardContent>
        </Card>
      </li>
    );
  };

  return (
    <main data-scroll-depth={scrollDepth}>
      <div className="selection-page container">
        <header className="selection-header">
          <p className="section-label">Step 01 · Select</p>
          <h1 className="section-title">Pick your departments</h1>
          <p className="body-text">Select up to <strong>two</strong> departments. Check the departments you wish to apply for.</p>
          <p className="selection-count"><strong>{selectedCount} / 2 selected</strong></p>
          <button className="button button-primary" type="button" onClick={goToApplication} disabled={isContinueDisabled}>Continue to application →</button>
        </header>
        <section className="department-section">
          <h2>Available Departments</h2>
          <ul className="department-list">
            {computedDepartmentList.map((department, index) => (
              <DepartmentListItem key={department.name || index} department={department} index={index} />
            ))}
          </ul>
        </section>
      </div>
      <Footer />
    </main>
  );
};

export default DepartmentsListPage;

