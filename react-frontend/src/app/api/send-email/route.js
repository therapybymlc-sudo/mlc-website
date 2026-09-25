import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { type, name, email, phone, role, resumeUrl, message, subject: customSubject } = body;

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'MLC Health <therapy@mlchealth.in>';
    const adminRecipients = [
      'therapybymlc@gmail.com',
      'therapy@mlchealth.in',
      'therapy.aditya@gmail.com',
    ];

    // Helper to send via Resend with auto-fallback to onboarding@resend.dev
    const sendWithFallback = async (emailPayload) => {
      let resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        if (errText.includes('domain') && errText.includes('verify')) {
          console.warn('Resend domain pending verification. Retrying via onboarding@resend.dev...');
          emailPayload.from = 'MLC Health <onboarding@resend.dev>';
          resp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailPayload),
          });
        } else {
          return { ok: false, error: errText };
        }
      }

      if (resp.ok) {
        const data = await resp.json();
        return { ok: true, id: data.id };
      }
      const errText = await resp.text();
      return { ok: false, error: errText };
    };

    let emailSubject = customSubject || `New Submission on MLC Health`;
    let adminHtml = '';

    if (type === 'careers') {
      emailSubject = `New Therapist / Team Application — ${name || 'Applicant'} (${role || 'Role unspecified'})`;
      adminHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 0; background-color: #F8F9F8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 32px 16px;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E8ECE8; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                <tr>
                  <td style="background: #56756D; padding: 28px 32px; text-align: left;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #C9A960; font-weight: 700;">CAREERS PORTAL</span>
                    <h1 style="color: #ffffff; font-size: 20px; margin: 6px 0 0; font-weight: 600;">New Candidate Application</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: #F8FAF9; border-radius: 12px; padding: 20px; border: 1px solid #E6ECE8; margin-bottom: 20px;">
                      <tr><td style="padding: 6px 0; color: #718096; font-size: 13px; width: 130px;">Applicant Name</td><td style="padding: 6px 0; color: #2E2E2E; font-size: 14px; font-weight: 600;">${name || '—'}</td></tr>
                      <tr><td style="padding: 6px 0; color: #718096; font-size: 13px;">Role Applied</td><td style="padding: 6px 0; color: #56756D; font-size: 14px; font-weight: 700;">${role || '—'}</td></tr>
                      <tr><td style="padding: 6px 0; color: #718096; font-size: 13px;">Email Address</td><td style="padding: 6px 0; color: #56756D; font-size: 14px;"><a href="mailto:${email}" style="color: #56756D;">${email || '—'}</a></td></tr>
                      <tr><td style="padding: 6px 0; color: #718096; font-size: 13px;">Phone</td><td style="padding: 6px 0; color: #2E2E2E; font-size: 14px;">${phone || '—'}</td></tr>
                      ${
                        resumeUrl
                          ? `<tr><td style="padding: 6px 0; color: #718096; font-size: 13px;">CV / Portfolio</td><td style="padding: 6px 0;"><a href="${resumeUrl}" target="_blank" style="color: #56756D; font-weight: 600;">View Portfolio ↗</a></td></tr>`
                          : ''
                      }
                    </table>

                    ${
                      message
                        ? `<div style="background: #FAFAFA; border-left: 4px solid #56756D; padding: 14px 18px; margin-bottom: 24px; border-radius: 4px;">
                            <span style="font-size: 11px; text-transform: uppercase; color: #718096; font-weight: bold; letter-spacing: 0.5px;">Candidate Note:</span>
                            <p style="margin: 6px 0 0; font-size: 14px; color: #2E2E2E; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                           </div>`
                        : ''
                    }

                    <table width="100%"><tr><td align="center">
                      <a href="mailto:${email || 'therapybymlc@gmail.com'}?subject=Application for ${encodeURIComponent(role || 'MLC Health')}" style="display: inline-block; background: #56756D; color: #ffffff; padding: 12px 28px; border-radius: 50px; font-size: 13px; font-weight: 600; text-decoration: none;">
                        Reply to Candidate ↗
                      </a>
                    </td></tr></table>
                  </td>
                </tr>
                <tr>
                  <td style="background: #F4F6F4; padding: 16px; text-align: center; border-top: 1px solid #E8ECE8;">
                    <p style="color: #718096; font-size: 12px; margin: 0;">MLC Health Careers Team</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `;
    } else {
      // General inquiry
      emailSubject = `New Contact Inquiry — ${name || 'Visitor'}`;
      adminHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #56756D; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0; font-size: 20px;">New Contact Inquiry</h2>
          </div>
          <div style="padding: 24px;">
            <p><strong>From:</strong> ${name || '—'} (${email || '—'})</p>
            <p><strong>Phone:</strong> ${phone || '—'}</p>
            <p><strong>Message:</strong></p>
            <blockquote style="background: #f9f9f9; padding: 12px; border-left: 3px solid #56756D; margin: 0;">${message || '—'}</blockquote>
          </div>
        </div>
      `;
    }

    // 1. Send Alert to MLC Admins
    const adminPayload = {
      from: fromEmail,
      to: adminRecipients,
      reply_to: email || undefined,
      subject: emailSubject,
      html: adminHtml,
    };

    const adminResult = await sendWithFallback(adminPayload);

    // 2. If it is a Career application and applicant provided an email, send confirmation
    if (type === 'careers' && email) {
      const applicantHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 0; background-color: #F8F9F8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 32px 16px;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E8ECE8; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                <tr>
                  <td style="background: #56756D; padding: 28px 32px; text-align: left;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #C9A960; font-weight: 700;">APPLICATION RECEIVED</span>
                    <h1 style="color: #ffffff; font-size: 20px; margin: 6px 0 0; font-weight: 600;">Thank You for Reaching Out</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 32px;">
                    <p style="color: #2E2E2E; font-size: 15px; margin: 0 0 14px;">Dear ${name || 'Applicant'},</p>
                    <p style="color: #4A5568; font-size: 14px; line-height: 1.7; margin: 0 0 18px;">
                      We have received your application for the <strong>${role || 'Open Role'}</strong> position at MLC Health. Thank you for your interest in joining our clinical collective.
                    </p>
                    <p style="color: #4A5568; font-size: 14px; line-height: 1.7; margin: 0 0 22px;">
                      Our coordination team reviews all incoming profiles within <strong>2 to 4 business days</strong>. If your background aligns with our clinical needs, we will reach out directly to arrange an introductory conversation.
                    </p>
                    <div style="background: #F8FAF9; border-radius: 12px; padding: 18px 20px; border: 1px solid #E6ECE8; margin-bottom: 24px;">
                      <span style="font-size: 12px; color: #56756D; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">What We Look For:</span>
                      <p style="margin: 8px 0 0; font-size: 13px; color: #718096; line-height: 1.6;">
                        At MLC, we prioritize reflective clinical practice, trauma-informed principles, and sustainable clinician well-being.
                      </p>
                    </div>
                    <p style="color: #718096; font-size: 13px; line-height: 1.6; margin: 0;">
                      In the meantime, feel free to learn more about our practice at <a href="https://www.mlchealth.in/about" style="color: #56756D; font-weight: 600;">mlchealth.in/about</a>.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background: #F4F6F4; padding: 16px; text-align: center; border-top: 1px solid #E8ECE8;">
                    <p style="color: #718096; font-size: 12px; margin: 0;">MLC Health &amp; Wellness Centre</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `;

      try {
        await sendWithFallback({
          from: fromEmail,
          to: [email],
          subject: 'Application Received — MLC Health Careers',
          html: applicantHtml,
          reply_to: 'therapy@mlchealth.in',
        });
      } catch (confirmErr) {
        console.warn('Applicant confirmation email notice:', confirmErr);
      }
    }

    if (!adminResult.ok) {
      return NextResponse.json({ error: adminResult.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: adminResult.id });
  } catch (error) {
    console.error('Resend API Route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
