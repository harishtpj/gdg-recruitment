import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { submitFormAction } from "@/lib/actions/form.action";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return new Response(
        JSON.stringify({ message: "Authentication required" }),
        { status: 401 }
      );
    }

    const user = session.user;
    const userEmail = user.email;

    const deadline = new Date(process.env.NEXT_PUBLIC_RECRUITMENT_DEADLINE);
    if (new Date() > deadline)
      return new Response(
        JSON.stringify({
          message: "The submission deadline has passed"
        }),
        { status: 403 }
      );
                  

    const data = await req.json();

    const {
      Department,
      Questions,
      Gender,
      "Why do you want to join the department?": motivation,
      ...formFields
    } = data;

    if (!Gender || !motivation) {
      return new Response(
        JSON.stringify({ message: "Gender and department motivation are required" }),
        { status: 400 }
      );
    }

    const regNoRegex = /^\d{2}[A-Z]{3}\d{4}$/;
    if (formFields.RegistrationNumber && !regNoRegex.test(formFields.RegistrationNumber)) {
      return new Response(
        JSON.stringify({
          message: "Registration number must be 2 numbers, 3 uppercase letters, and 4 numbers (e.g. 25BCE5612)",
        }),
        { status: 400 }
      );
    }

    const result = await submitFormAction({
      ...formFields,
      Gender,
      "Why do you want to join the department?": motivation,
      Department,
      Questions,
      Email: userEmail,
    });

    if (!result.success) {
      return new Response(JSON.stringify({ message: result.message }), {
        status: result.status || 500,
      });
    }

    return new Response(
      JSON.stringify({
        message: "Form submitted successfully!",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Form submission error:", error);
    return new Response(JSON.stringify({ message: "Error submitting form" }), {
      status: 500,
    });
  }
}
