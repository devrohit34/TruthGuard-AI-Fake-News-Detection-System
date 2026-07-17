import { ShieldCheck, Github, Linkedin, Mail } from 'lucide-react';
import { Link } from '../lib/router';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-page py-12">
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-700 to-sky-600">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold text-slate-900">
              Truth<span className="text-teal-700">Guard</span>
            </span>
          </Link>
          <p className="mt-3 max-w-md text-sm text-slate-500">
            AI-Based Fake News Detection System using NLP and BERT Transformer models.
            Built as a final-year major project.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href="https://github.com/devrohit34"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all duration-200 hover:bg-teal-100 hover:text-teal-700 hover:scale-110"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/devrohit32/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all duration-200 hover:bg-teal-100 hover:text-teal-700 hover:scale-110"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="mailto:rohitkumar347400@gmail.com"
              aria-label="Send Email"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all duration-200 hover:bg-teal-100 hover:text-teal-700 hover:scale-110"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6">
          <p className="text-center text-sm text-slate-400">
            © {new Date().getFullYear()} TruthGuard — AI Fake News Detection System. | Developed by Rohit Kumar
          </p>
        </div>
      </div>
    </footer>
  );
}
