import Link from "next/link";
import { FOOTER_LINKS } from "@/lib/homepage-data";
import { APP_NAME } from "@/constants";

const LogoMark = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="#3b82f6" strokeWidth="1.8" fill="#3b82f615" />
    <path d="M12 8v8M8 10l4-2 4 2" stroke="#3b82f6" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a0a] border-t border-[#1c1c1c]">
      <div className="max-w-[1140px] mx-auto px-6 py-14">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16">
          {/* Brand */}
          <div className="md:w-64 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-[#e5e5e5] mb-3 hover:text-white transition-colors"
            >
              <LogoMark />
              {APP_NAME}
            </Link>
            <p className="text-sm text-[#737373] leading-relaxed">
              Developer knowledge hub for snippets, prompts, commands, notes,
              files, and links.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {Object.entries(FOOTER_LINKS).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-xs font-semibold text-[#e5e5e5] uppercase tracking-wider mb-4">
                  {category}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-[#737373] hover:text-[#d4d4d4] transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#1c1c1c] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#737373]">
            © {year} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="#"
              aria-label="GitHub"
              className="text-[#737373] hover:text-[#d4d4d4] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3b82f6] rounded"
            >
              <GitHubIcon />
            </a>
            <a
              href="#"
              aria-label="Twitter / X"
              className="text-[#737373] hover:text-[#d4d4d4] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3b82f6] rounded"
            >
              <XIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
