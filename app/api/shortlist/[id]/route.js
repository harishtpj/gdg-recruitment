import { NextResponse } from 'next/server';
import FormDataModel from '@/lib/modals/form.modal';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function PATCH(req, { params }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    if (session.user.role !== 'admin') {
        return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }
    const { id } = await params;
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
