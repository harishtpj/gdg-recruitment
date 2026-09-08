import { NextResponse } from "next/server";
import FormDataModel from "@/lib/modals/form.modal";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const applicants = await FormDataModel.find();

    return NextResponse.json({ applicants });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return NextResponse.json(
      { error: "Failed to fetch applicants" },
      { status: 500 }
    );
  }
}
