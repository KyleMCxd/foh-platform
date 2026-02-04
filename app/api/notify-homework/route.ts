import { NextRequest, NextResponse } from "next/server";

// This API route handles email notifications for homework submissions
// You can integrate with any email service (Resend, SendGrid, Mailgun, etc.)

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { studentEmail, moduleTitle, fileName, submittedAt } = body;

        // Configure your email service here
        // Example with Resend (https://resend.com):
        // 
        // import { Resend } from 'resend';
        // const resend = new Resend(process.env.RESEND_API_KEY);
        // 
        // await resend.emails.send({
        //   from: 'FOH Academy <noreply@fohacademy.nl>',
        //   to: 'admin@fohacademy.nl',  // Your admin email
        //   subject: `Nieuw huiswerk: ${moduleTitle}`,
        //   html: `
        //     <h2>Nieuw Huiswerk Ingeleverd</h2>
        //     <p><strong>Student:</strong> ${studentEmail}</p>
        //     <p><strong>Module:</strong> ${moduleTitle}</p>
        //     <p><strong>Bestand:</strong> ${fileName}</p>
        //     <p><strong>Tijd:</strong> ${new Date(submittedAt).toLocaleString('nl-NL')}</p>
        //     <p><a href="https://fohplatform.vercel.app/admin/homework">Bekijk in Admin Panel →</a></p>
        //   `
        // });

        console.log("📧 Email notification would be sent:", {
            to: "admin@fohacademy.nl",
            subject: `Nieuw huiswerk: ${moduleTitle}`,
            student: studentEmail,
            file: fileName,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to send notification:", error);
        return NextResponse.json(
            { error: "Failed to send notification" },
            { status: 500 }
        );
    }
}
