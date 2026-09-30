import { NextResponse } from 'next/server';

/**
 * Newsletter subscribe endpoint.
 * Auto-detects the provider from whichever env vars are set:
 *   - Mailchimp:  MAILCHIMP_API_KEY, MAILCHIMP_LIST_ID, MAILCHIMP_DC
 *   - Brevo:      BREVO_API_KEY, (optional) BREVO_LIST_ID
 *   - ConvertKit: CONVERTKIT_API_KEY, CONVERTKIT_FORM_ID
 * If none are configured, it accepts the email and logs it (safe for local dev).
 */

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req: Request) {
  let email: string;
  try {
    ({ email } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  try {
    const provider = detectProvider();
    switch (provider) {
      case 'mailchimp':
        await subscribeMailchimp(email);
        break;
      case 'brevo':
        await subscribeBrevo(email);
        break;
      case 'convertkit':
        await subscribeConvertKit(email);
        break;
      default:
        console.log(`[newsletter] no provider configured; captured: ${email}`);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[newsletter] provider error:', err);
    return NextResponse.json({ error: 'Subscription failed. Please try again.' }, { status: 502 });
  }
}

function detectProvider(): 'mailchimp' | 'brevo' | 'convertkit' | 'none' {
  if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_LIST_ID && process.env.MAILCHIMP_DC) return 'mailchimp';
  if (process.env.BREVO_API_KEY) return 'brevo';
  if (process.env.CONVERTKIT_API_KEY && process.env.CONVERTKIT_FORM_ID) return 'convertkit';
  return 'none';
}

/** Mailchimp — status 'pending' triggers double opt-in. */
async function subscribeMailchimp(email: string) {
  const dc = process.env.MAILCHIMP_DC!;
  const listId = process.env.MAILCHIMP_LIST_ID!;
  const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.MAILCHIMP_API_KEY!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email_address: email, status: 'pending' }),
  });
  // 400 with "Member Exists" is not a real failure for our purposes.
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (body?.title === 'Member Exists') return;
    throw new Error(`Mailchimp ${res.status}: ${body?.title ?? 'error'}`);
  }
}

/** Brevo (Sendinblue) — set updateEnabled so re-subscribes don't error. */
async function subscribeBrevo(email: string) {
  const listId = process.env.BREVO_LIST_ID;
  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      updateEnabled: true,
      ...(listId ? { listIds: [Number(listId)] } : {}),
    }),
  });
  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => ({}));
    if (body?.code === 'duplicate_parameter') return;
    throw new Error(`Brevo ${res.status}: ${body?.message ?? 'error'}`);
  }
}

/** ConvertKit — adding to a form sends the confirmation email (double opt-in). */
async function subscribeConvertKit(email: string) {
  const formId = process.env.CONVERTKIT_FORM_ID!;
  const res = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: process.env.CONVERTKIT_API_KEY!, email }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`ConvertKit ${res.status}: ${body?.message ?? 'error'}`);
  }
}
