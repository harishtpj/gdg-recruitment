import React, { useEffect, useMemo, useState } from "react";
import * as z from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { QuestionnaireData } from "@/constants";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useSubmissions } from "@/components/SubmissionsProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const normaliseQuestion = (question) => (
  typeof question === "string"
    ? { name: question, type: "generic", placeholder: "2-3 sentences" }
    : question
);

const FormComp = ({ dept1, dept2, isLoading, setIsLoading }) => {
  // Use Better Auth's useSession hook directly
  const { data: session, isPending, error } = authClient.useSession();

  const user = session?.user;
  const isSignedIn = !!user;
  const isLoaded = !isPending;

  // Form lifecycle and input telemetry state
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameInputVal, setNameInputVal] = useState("");
  const [regNumberInputVal, setRegNumberInputVal] = useState("");
  const [emailInputVal, setEmailInputVal] = useState("");
  const [phoneInputVal, setPhoneInputVal] = useState("");
  const [formCompletionPercentage, setFormCompletionPercentage] = useState(0);
  const [keyStrokeCounter, setKeyStrokeCounter] = useState(0);
  const [syncTick, setSyncTick] = useState(0);
  const [formScrollOffset, setFormScrollOffset] = useState(0);

  const router = useRouter();
  const { submittedDepartments: contextSubmitted, markDepartmentsSubmitted } = useSubmissions();
  const [submittedDepartments, setSubmittedDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDraftReady, setIsDraftReady] = useState(false);
  const departmentNames = useMemo(
    () => [dept1, dept2].filter(Boolean).map((department) => typeof department === "string" ? department : department.name),
    [dept1, dept2]
  );
  const draftKey = user?.email && departmentNames.length
    ? `recruitment-draft:${user.email}:${[...departmentNames].sort().join("|")}`
    : null;

  // Track scroll depth within form container
  useEffect(() => {
    const handleScroll = () => {
      setFormScrollOffset(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const normalizeDeptName = (str) => (str ? str.trim().toLowerCase().replace(/\s*\/\s*/g, "/") : "");

  const questionData = useMemo(
    () => [...new Set(departmentNames.flatMap((department) =>
      (QuestionnaireData.find((item) => normalizeDeptName(item.department) === normalizeDeptName(department))?.questions ?? [])
        .map(normaliseQuestion)
        .map((question) => question.name)
    ))],
    [departmentNames]
  );

  const schemaObj = {
    Name: z.string().min(1, "Name is required"),
    RegistrationNumber: z
      .string()
      .min(1, "Registration number is required")
      .regex(
        /^\d{2}[A-Z]{3}\d{4}$/,
        "Registration number must be 2 numbers, 3 uppercase letters, and 4 numbers (e.g. 25BCE5612)"
      ),
    Email: z.string(),
    Gender: z.string().min(1, "Gender is required"),
    Phone: z
      .string()
      .min(1, "Phone is required")
      .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
    "Year of Study": z.string().optional(),
    "Why do you want to join the department?": z
      .string()
      .min(1, "Please tell us why you want to join the department"),
  };

  questionData.forEach((qd) => {
    schemaObj[qd] = z.string().optional();
  });

  const formSchema = z.object(schemaObj);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Name: "",
      RegistrationNumber: "",
      Email: "",
      Gender: "",
      Phone: "",
      "Why do you want to join the department?": "",
    },
  });

  useEffect(() => {
    if (!isLoaded || !user || !draftKey) return;

    const email = user.email;
    let isActive = true;
    setIsDraftReady(false);

    try {
      const savedDraft = JSON.parse(localStorage.getItem(draftKey) || "{}");
      form.reset({ ...form.getValues(), ...savedDraft.values, Email: email });
    } catch {
      form.setValue("Email", email);
    }

    async function initialiseForm() {
      const savedDraft = JSON.parse(localStorage.getItem(draftKey) || "{}");
      let remoteSubmitted = contextSubmitted || [];

      if (!remoteSubmitted.length) {
        const cacheKey = `submitted_depts_${email}`;
        const cached = typeof window !== "undefined" ? sessionStorage.getItem(cacheKey) : null;

        if (cached) {
          try {
            remoteSubmitted = JSON.parse(cached);
          } catch { }
        } else {
          try {
            const response = await fetch(`/api/check-applications?email=${encodeURIComponent(email)}`);
            const result = await response.json();
            if (result?.submittedDepartments) {
              remoteSubmitted = result.submittedDepartments;
              if (typeof window !== "undefined") {
                sessionStorage.setItem(cacheKey, JSON.stringify(remoteSubmitted));
              }
            }
          } catch (err) {
            console.error("Failed to check applications:", err);
          }
        }
      }

      if (!isActive) return;
      const completed = [...new Set([...(savedDraft.submittedDepartments || []), ...remoteSubmitted])];
      setSubmittedDepartments(completed);
      if (departmentNames.length > 0 && departmentNames.every((dept) => completed.includes(dept))) {
        setErrorMessage(`You have already submitted an application for ${departmentNames.join(" and ")}.`);
      }
      localStorage.setItem(draftKey, JSON.stringify({ values: form.getValues(), submittedDepartments: completed }));
      setLoading(false);
      setIsDraftReady(true);
    }

    initialiseForm().catch(() => {
      if (isActive) {
        setLoading(false);
        setIsDraftReady(true);
      }
    });

    return () => { isActive = false; };
  }, [contextSubmitted, departmentNames, draftKey, form, isLoaded, user]);

  const watchedValues = useWatch({ control: form.control });

  useEffect(() => {
    if (!isDraftReady || !draftKey) return;
    localStorage.setItem(draftKey, JSON.stringify({ values: watchedValues, submittedDepartments }));
  }, [draftKey, isDraftReady, submittedDepartments, watchedValues]);

  // Check if user is authenticated
  if (!isLoaded) {
    return (
      <div className="form-state-shell">
        <div className="form-state-card">
          <span className="form-spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <Dialog open>
        <DialogContent showClose={false} className="notice-dialog auth-required-dialog">
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>Please sign in to access the application form.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => router.push("/auth/signin")}>Sign In</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // User is authenticated
  const userEmail = user?.email;

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    setErrorMessage("");

    const pendingDepartments = departmentNames.filter((department) => !submittedDepartments.includes(department));

    if (!pendingDepartments.length) {
      toast.success("Your applications have already been submitted.");
      setIsSubmitting(false);
      router.push("/departments");
      return;
    }

    const basicDetails = {
      Name: values.Name,
      RegistrationNumber: values.RegistrationNumber,
      Email: values.Email,
      Gender: values.Gender,
      Phone: values.Phone,
      "Year of Study": values["Year of Study"],
      "Why do you want to join the department?": values["Why do you want to join the department?"],
    };

    const submitDepartment = async (department) => {
      const questions = (QuestionnaireData.find((item) => item.department === department)?.questions ?? [])
        .map(normaliseQuestion);

      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...basicDetails,
          Department: department,
          Questions: questions.reduce((answers, question) => ({ ...answers, [question.name]: values[question.name] || "" }), {}),
        }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Could not submit ${department}.`);
      }
      return { department, success: true };
    };

    try {
      const results = await Promise.allSettled(pendingDepartments.map(submitDepartment));
      const successful = results
        .filter((result) => result.status === "fulfilled" && result.value.success)
        .map((result) => result.value.department);
      const failed = results.flatMap((result, index) =>
        result.status === "rejected" ? [pendingDepartments[index]] : []
      );
      const completed = [...new Set([...submittedDepartments, ...successful])];

      setSubmittedDepartments(completed);
      markDepartmentsSubmitted(completed);
      if (draftKey) localStorage.setItem(draftKey, JSON.stringify({ values, submittedDepartments: completed }));
      if (typeof window !== "undefined" && values?.Email) {
        sessionStorage.setItem(`submitted_depts_${values.Email}`, JSON.stringify(completed));
      }
      successful.forEach((department) => toast.success(`Application submitted for ${department}.`));

      if (failed.length) {
        setErrorMessage(`Submitted ${successful.length ? successful.join(", ") : "no applications"}. Please retry ${failed.join(", ")}.`);
      } else {
        router.push("/departments");
      }
    } catch {
      setErrorMessage("Your applications could not be submitted. Your saved answers will be kept for retrying.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="form-state-shell">
        <p>Checking your application status...</p>
      </div>
    );
  }

  if (!isFormOpen) {
    return (
      <div className="form-state-shell">
        <p>Recruitment Closed</p>
        <p>Recruitment has now been terminated.</p>
      </div>
    );
  }

  return (
    <main className="application-shell">
      {errorMessage && !isSubmitting && (
        <div className="application-error">
          <p>{errorMessage}</p>
          <Button type="button" onClick={() => router.push("/departments")}>
            Go Back
          </Button>
        </div>
      )}

      <header className="application-header">
        <p className="section-label">Step 02 · Application</p>
        <h1 className="section-title">Application Form</h1>
        <p className="body-text">
          Applying to: <strong>{departmentNames.join(", ")}</strong>
        </p>
      </header>

      <Form {...form}>
        <form className="application-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <section className="form-section">
            <h2>About You</h2>

            <div className="form-grid">
              <FormField
                control={form.control}
                name="Name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Jane Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="RegistrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. 25BCE5612" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                          <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (WhatsApp)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+919876543210" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="form-wide-field">
              <FormField
                control={form.control}
                name="Why do you want to join the department?"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why do you want to join the department?</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} placeholder="2-3 Sentences" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {renderDepartmentQuestions(departmentNames[0], QuestionnaireData, form)}
          {departmentNames[1] && renderDepartmentQuestions(departmentNames[1], QuestionnaireData, form)}

          <div className="form-actions">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
};

const renderDepartmentQuestions = (department, QuestionnaireData, form) => {
  const questions = (
    QuestionnaireData.find(qd => qd.department === department)?.questions ?? []
  )
    .map(normaliseQuestion)
    .filter((question) => question.name !== "Why do you want to join the department?" && question.name !== "Why do you want to join Organization Name?" && question.name !== "Why do you want to join DWASFW?");

  if (!questions.length) return null;

  return (
    <section className="form-section">
      <h2>{department} Questions</h2>
      <div className="form-question-list">
        {questions.map((question) => {
          const isCompact = question.type === "short-text";

          return (
            <div key={question.name} className="form-question">
              <FormField
                control={form.control}
                name={question.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{question.name}</FormLabel>
                    <FormControl>
                      {isCompact ? (
                        <Input
                          {...field}
                          placeholder={question.placeholder || "Answer..."}
                        />
                      ) : (
                        <Textarea
                          {...field}
                          rows={4}
                          placeholder={question.placeholder || "2-3 sentences"}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FormComp;
