import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { Github, Twitter, Mail, ShieldCheck, Sparkles } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr] py-14">
          <div className="space-y-4">
            <Logo size={44} />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              AI-powered personal finance. Track every rupee, master every budget, chat with your money — powered by Gemini 2.0 Flash.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" aria-label="Twitter" className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"><Twitter className="h-4 w-4" /></a>
              <a href="#" aria-label="Github" className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"><Github className="h-4 w-4" /></a>
              <a href="#" aria-label="Email" className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"><Mail className="h-4 w-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground">Features</a></li>
              <li><a href="#how" className="hover:text-foreground">How it works</a></li>
              <li><a href="#ai" className="hover:text-foreground">AI Assistant</a></li>
              <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
              <li><Link to="/expenses" className="hover:text-foreground">Expenses</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">About</a></li>
              <li><a href="#" className="hover:text-foreground">Changelog</a></li>
              <li><a href="#" className="hover:text-foreground">Careers</a></li>
              <li><a href="#" className="hover:text-foreground">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Legal & Security</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
              <li><a href="#" className="hover:text-foreground flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Bank-grade security</a></li>
              <li><a href="#" className="hover:text-foreground flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Gemini 2.0 Flash</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t text-sm">
          <p className="text-muted-foreground">© {new Date().getFullYear()} CoCoWallet. All rights reserved. Built with ❤️ for better money habits.</p>
          <p className="text-muted-foreground flex items-center gap-2">Made for humans who love money <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /></p>
        </div>
      </div>
    </footer>
  )
}
