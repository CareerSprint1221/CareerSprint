export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Resend API key not configured' });

  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const firstName = name ? name.split(' ')[0] : 'there';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'CareerSprint <onboarding@resend.dev>',
        to: email,
        subject: '🚀 Welcome to CareerSprint — Let\'s land your dream job!',
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f8fc;font-family:'Plus Jakarta Sans',Arial,sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
    
    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#7C5CFC,#F74B8B);padding:48px 40px;text-align:center">
      <h1 style="color:#fff;font-size:28px;font-weight:900;margin:0;letter-spacing:-0.5px">CareerSprint•</h1>
      <p style="color:rgba(255,255,255,.8);margin:8px 0 0;font-size:15px">AI-Powered Job Applications</p>
    </div>

    <!-- BODY -->
    <div style="padding:40px">
      <h2 style="font-size:24px;font-weight:800;color:#0f0f1a;margin:0 0 12px">Welcome, ${firstName}! 🎉</h2>
      <p style="font-size:15px;color:#4b5563;line-height:1.7;margin:0 0 24px">
        You've just joined <strong>1,166,440+ job seekers</strong> who use CareerSprint to land their dream jobs faster. We're so excited to have you!
      </p>

      <!-- FEATURES -->
      <div style="background:#f8f8fc;border-radius:16px;padding:24px;margin-bottom:28px">
        <h3 style="font-size:15px;font-weight:800;color:#0f0f1a;margin:0 0 16px">Here's what you can do with CareerSprint:</h3>
        <div style="display:flex;flex-direction:column;gap:12px">
          <div style="display:flex;align-items:center;gap:12px;font-size:14px;color:#374151">
            <span style="font-size:20px">📄</span> <span><strong>AI Resume Builder</strong> — Tailored resume for every job</span>
          </div>
          <div style="display:flex;align-items:center;gap:12px;font-size:14px;color:#374151">
            <span style="font-size:20px">✍️</span> <span><strong>Cover Letter Generator</strong> — Personalized in seconds</span>
          </div>
          <div style="display:flex;align-items:center;gap:12px;font-size:14px;color:#374151">
            <span style="font-size:20px">🎯</span> <span><strong>Smart Job Matching</strong> — Find your best-fit roles</span>
          </div>
          <div style="display:flex;align-items:center;gap:12px;font-size:14px;color:#374151">
            <span style="font-size:20px">🚀</span> <span><strong>Auto Apply</strong> — Apply to hundreds of jobs automatically</span>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:28px">
        <a href="https://aicareersprint.com/dashboard.html" 
           style="display:inline-block;background:linear-gradient(135deg,#7C5CFC,#F74B8B);color:#fff;text-decoration:none;padding:14px 36px;border-radius:50px;font-size:15px;font-weight:700;box-shadow:0 4px 16px rgba(124,92,252,.4)">
          Go to Your Dashboard →
        </a>
      </div>

      <p style="font-size:14px;color:#6b7280;line-height:1.7;border-top:1px solid #e5e7eb;padding-top:24px;margin:0">
        Need help? Just reply to this email — we're here for you.<br>
        <strong>The CareerSprint Team</strong>
      </p>
    </div>

    <!-- FOOTER -->
    <div style="background:#f8f8fc;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb">
      <p style="font-size:12px;color:#9ca3af;margin:0">
        © 2026 CareerSprint · <a href="https://aicareersprint.com" style="color:#7C5CFC;text-decoration:none">aicareersprint.com</a>
        <br>You're receiving this because you signed up at CareerSprint.
      </p>
    </div>

  </div>
</body>
</html>`
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.message || 'Failed to send email' });
    return res.status(200).json({ success: true, id: data.id });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
