import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, email, message, company } = await req.json();
    if (company) return NextResponse.json({ ok: true }); // honeypot silently accepted
    if (!name || !email || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }
    // TODO: send via Resend/SendGrid or store in Supabase.
    console.log('Contact message:', { name, email, message });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
