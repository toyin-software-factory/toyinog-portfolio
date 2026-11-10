import "server-only";

/** Sends a raw email through the Email Routing binding. */
export async function sendThroughBinding(
  binding: SendEmail,
  from: string,
  to: string,
  raw: string,
) {
  // `cloudflare:email` exists only in the Workers runtime. The `.catch()` makes the
  // OpenNext bundler leave it for runtime (wrangler resolves `cloudflare:*` modules).
  const { EmailMessage } = await import(/* webpackIgnore: true */ "cloudflare:email").catch(
    (error: unknown) => {
      throw error;
    },
  );
  await binding.send(new EmailMessage(from, to, raw));
}
