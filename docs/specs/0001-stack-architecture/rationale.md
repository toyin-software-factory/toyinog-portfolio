# 0001. Rationale: Next.js on Cloudflare Workers as the portfolio stack

## Context

> ⚠️ Premise note: Cloudflare Email Routing only works if toyinog.com's mail (MX) records point at Cloudflare. If Toyin already receives mail at @toyinog.com through another provider, turning on Email Routing would cut off that inbox. This was asked twice and is still unanswered. It does not block the scaffold, but it must be answered before the contact form goes live. If the domain already has a mail provider, the contact feature should switch to an email API that does not need the MX records.

toyinog.com is a personal portfolio for two audiences, hiring managers and freelance clients. It has four pages (Home, Work with case studies, About with a CV download, Contact), and it must launch in about a month (around 2026-12-10). It is built by a small agent team under a GA workflow (verify, tests, CodeRabbit review, docs), and every PR needs preview proof at desktop and mobile widths.

The forces are: content edited as Markdown files in the repo, with no CMS, login or database; a contact form that emails Toyin with spam protection; cookie free analytics so no cookie banner is needed; English only; SEO basics on every page; WCAG AA; and good mobile Core Web Vitals. Team rules require TypeScript strict and zod validation for every external input.

Without a stack decision nothing can be scaffolded, CI can't run, and no later spec (content model, design system, contact form) has a platform to build on.

## Options considered

### Option 1: Next.js on Cloudflare Workers via OpenNext, with Cloudflare services (chosen)

One Next.js app, statically generated, with the contact form as a server action on Workers. Cloudflare provides hosting, previews (Workers Builds), email (Email Routing), bot checks (Turnstile), rate limiting and analytics.

**Pros**: one vendor, almost everything free, fast global delivery, no backend to run, previews built in.
**Cons**: Next.js runs through an adapter, so features can lag and there's no image optimizer. Email Routing needs the domain's MX records and only sends to verified addresses. The vendor concentration is total.

### Option 2: Next.js on Vercel with an email API

The same app on the Next.js team's own host, with every Next.js feature working natively, and an email API for the contact form.

**Pros**: no adapter, built in image optimization, the smoothest Next.js experience.
**Cons**: one more vendor for email, the Hobby plan is meant for non commercial use, and spam protection and analytics come from separate services.

### Option 3: Astro on Cloudflare

A content first framework that ships almost no JavaScript, with a server endpoint for the form.

**Pros**: the fastest possible pages, native Markdown, a first class Cloudflare adapter.
**Cons**: a smaller ecosystem and component pool than React, and less familiar to most builders.

## Rationale

Toyin picked each layer in the stack walk. The resulting stack is coherent: Next.js gives static content pages and the one server action in a single codebase, which suits a small team on a one month deadline better than a separate backend. Cloudflare hosting makes the same account the natural home for email, Turnstile, rate limiting and analytics, so the whole site runs on one free tier with very little to operate. That fits a personal site best of all.

The real cost is the OpenNext adapter. Next.js on Workers is not the reference platform, so version upgrades need care and the image optimizer is missing. Because the site is almost entirely static and image light, both are manageable: images are pre sized by hand, and Next.js versions follow OpenNext's support list. Vercel (Option 2) would remove the adapter, but it adds vendors and the Hobby plan's terms are a poor fit for a site that seeks client work.

The email choice carries the main open risk (see the Premise note). Email Routing is free and native, but it is coupled to the domain's mail records. If that coupling turns out to clash with an existing inbox, only the contact feature's email adapter changes; the rest of the stack stands.

Smaller calls made by the lead: `images.unoptimized` with pre sized assets (runner up: Cloudflare Images, a paid service); Workers Rate Limiting binding for floods (runner up: a WAF rate limiting rule, which needs dashboard setup per zone); Workers Logs for observability (runner up: a hosted error tracker, deferred until errors appear); `gray-matter` with `unified` / `remark` / `rehype` for Markdown (runner up: `marked`, which is simpler but has a weaker plugin pipeline for headings, code and links).
