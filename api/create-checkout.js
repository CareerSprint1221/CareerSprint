export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return res.status(500).json({ error: 'Stripe key not configured' });

  try {
    const { email, plan } = req.body;
    const isYearly = plan === 'yearly';

    // Price in cents
    const amount = isYearly ? 1700 : 2699; // $17.00 or $26.99
    const interval = isYearly ? 'year' : 'month';
    const intervalCount = isYearly ? 1 : 1;

    // Create Stripe checkout session
    const params = new URLSearchParams();
    params.append('mode', 'subscription');
    params.append('success_url', 'https://aicareersprint.com/dashboard.html?upgraded=true');
    params.append('cancel_url', 'https://aicareersprint.com/pricing.html');
    params.append('line_items[0][price_data][currency]', 'usd');
    params.append('line_items[0][price_data][product_data][name]', 'CareerSprint Pro');
    params.append('line_items[0][price_data][product_data][description]', 'Unlimited job applications, AI resume tailoring, auto-apply and more');
    params.append('line_items[0][price_data][recurring][interval]', interval);
    params.append('line_items[0][price_data][recurring][interval_count]', intervalCount);
    params.append('line_items[0][price_data][unit_amount]', amount);
    params.append('line_items[0][quantity]', '1');
    if (email) params.append('customer_email', email);

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Stripe error' });
    }

    return res.status(200).json({ url: data.url });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
