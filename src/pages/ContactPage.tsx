import { useState } from 'react';
import { Mail, MapPin, Phone, Send, MessageSquare, CheckCircle2, ArrowUpRight } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    // Simulate submission
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 5000);
    }, 800);
  }

  return (
    <div className="container-page py-10 lg:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="section-title">Get in Touch</h1>
        <p className="mt-4 text-slate-600">
          Questions about the project, collaboration inquiries, or technical issues?
          We'd love to hear from you.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {/* Contact info */}
        <div className="space-y-4">
          {[
            {
              icon: Mail,
              label: 'Email',
              value: 'rohitkumar347400@gmail.com',
              helper: 'Send an Email',
              href: 'mailto:rohitkumar347400@gmail.com',
              external: false,
              gradient: 'from-rose-500 to-orange-500',
            },
            {
              icon: Phone,
              label: 'Phone',
              value: '7050855042',
              helper: 'Call Now',
              href: 'tel:7050855042',
              external: false,
              gradient: 'from-teal-500 to-emerald-500',
            },
            {
              icon: MapPin,
              label: 'Location',
              value: 'Gulzar Group of Institution, Khanna, Punjab (141401)',
              helper: 'View on Map',
              href: 'https://www.google.com/maps/search/?api=1&query=Gulzar+Group+of+Institution+Khanna+Punjab',
              external: true,
              gradient: 'from-sky-500 to-indigo-500',
            },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <a
                key={c.label}
                href={c.href}
                {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="group relative flex items-start gap-4 rounded-2xl border border-slate-200 bg-white/80 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${c.gradient} shadow-md transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="h-6 w-6 text-white" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{c.label}</h3>
                  <p className="mt-1 text-sm font-semibold leading-snug text-slate-800">{c.value}</p>
                  <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-teal-600 transition-colors group-hover:text-teal-700">
                    {c.helper}
                    <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </p>
                </div>
              </a>
            );
          })}
        </div>

        {/* Contact form */}
        <div className="lg:col-span-2">
          <div className="card p-8">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-800">Message Sent!</h3>
                <p className="mt-1 text-sm text-slate-500">Thank you for reaching out. We'll respond within 48 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="label">Full Name</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Subject</label>
                  <input
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="input"
                    placeholder="Project inquiry"
                  />
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={5}
                    className="input resize-y"
                    placeholder="Your message..."
                    required
                  />
                </div>
                <button type="submit" disabled={sending} className="btn-primary w-full py-3">
                  {sending ? 'Sending...' : (
                    <><Send className="h-4 w-4" /> Send Message</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <h2 className="section-title text-center">Frequently Asked Questions</h2>
        <div className="mx-auto mt-8 max-w-2xl space-y-4">
          {[
            { q: 'How accurate is the fake news detection?', a: `The fine-tuned BERT model achieves ${(0.9387 * 100).toFixed(1)}% accuracy on the held-out test set, with an F1 score of 0.938.` },
            { q: 'What dataset was used for training?', a: 'The ISOT Fake and Real News Dataset from Kaggle, containing ~44,900 articles balanced between fake and real news.' },
            { q: 'Can I use this for real-time news verification?', a: 'Yes. The system processes text in under a second and provides confidence scores and explanations for each prediction.' },
            { q: 'Is my prediction data private?', a: 'Yes. Each user can only see their own predictions. Admins can view aggregate statistics for platform oversight.' },
          ].map((f, i) => (
            <div key={i} className="card p-5">
              <div className="flex items-start gap-3">
                <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                <div>
                  <h3 className="font-semibold text-slate-800">{f.q}</h3>
                  <p className="mt-1 text-sm text-slate-600">{f.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
