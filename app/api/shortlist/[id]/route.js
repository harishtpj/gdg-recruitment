import { NextResponse } from 'next/server';
import FormDataModel from '@/lib/modals/form.modal';

export async function PATCH(req, { params }) {
    const { id } = params;
    const { shortlisted } = await req.json();

    try {
        const applicant = await FormDataModel.findByIdAndUpdate(id, { shortlisted });

        if (!applicant) {
            return NextResponse.json({ success: false, message: 'Applicant not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: applicant });
    } catch (error) {
        console.error('Error updating applicant:', error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}
