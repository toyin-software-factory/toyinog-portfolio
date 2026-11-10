import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

import { E2E_PRODUCTION, PROD_ENV_TAG } from "./env";

const WCAG_AA_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const expectNoAxeViolations = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(WCAG_AA_TAGS).analyze();
  expect(results.violations).toEqual([]);
};

/** Waits for the Turnstile test widget to put its token in the form. */
const waitForTurnstile = async (page: Page) => {
  await expect(page.locator('input[name="cf-turnstile-response"]')).toHaveValue(/.+/, {
    timeout: 20_000,
  });
};

const fillValidForm = async (page: Page) => {
  await page.getByLabel("Name").fill("Test Visitor");
  await page.getByLabel("Email", { exact: true }).fill("visitor@example.com");
  await page.getByRole("radio", { name: "A project" }).check();
  await page.getByLabel("Message").fill("Hello! This is an automated end to end test message.");
};

test.describe("/contact (spec 0007)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
  });

  test("shows the heading, intro, form and contact details (AC-1, AC-2)", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: "Contact" })).toBeVisible();
    await expect(page.getByText(/open to new roles|taking on new projects|new work/)).toBeVisible();
    for (const label of ["Name", "Message"]) await expect(page.getByLabel(label)).toBeVisible();
    await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
    await expect(page.getByRole("group", { name: "What's this about?" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "A role (hiring)" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Send message" })).toBeVisible();

    const honeypot = page.locator('input[name="website"]');
    await expect(honeypot).toHaveAttribute("tabindex", "-1");
    await expect(honeypot).toHaveAttribute("autocomplete", "off");

    const elsewhere = page.getByRole("complementary", { name: "Elsewhere" });
    await expect(elsewhere.getByRole("link", { name: /LinkedIn/ })).toHaveAttribute(
      "target",
      "_blank",
    );
    await expect(elsewhere.getByRole("link", { name: /GitHub/ })).toBeVisible();
    await expect(page.getByText("isn't stored on this site")).toBeVisible();
  });

  test("has no WCAG 2.2 AA violations (AC-13)", async ({ page }) => {
    await waitForTurnstile(page);
    await expectNoAxeViolations(page);
  });

  test("an empty submit shows the error summary, focuses it and links each field (AC-3)", async ({
    page,
  }) => {
    await page.getByLabel("Name").fill("Kept Name");
    await page.getByRole("button", { name: "Send message" }).click();

    const summary = page.getByRole("alert").filter({ hasText: "problems with your message" });
    await expect(summary).toBeFocused();
    for (const text of [
      "Email: Enter your email address.",
      "What's this about?: Choose what this is about.",
      "Message: Enter a message.",
    ]) {
      await expect(summary.getByRole("link", { name: text })).toBeVisible();
    }
    await expect(page.getByLabel("Name")).toHaveValue("Kept Name");
    await expect(page.getByLabel("Email", { exact: true })).toHaveAttribute("aria-invalid", "true");

    await summary.getByRole("link", { name: /^Message:/ }).click();
    await expect(page.getByRole("textbox", { name: "Message", exact: true })).toBeFocused();

    await expectNoAxeViolations(page);
  });

  test("a valid submit goes to the thank you page (dry run outside production) (AC-8, AC-10)", async ({
    page,
  }) => {
    await fillValidForm(page);
    await waitForTurnstile(page);
    await page.getByRole("button", { name: "Send message" }).click();

    await expect(page).toHaveURL(/\/contact\/sent$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Thanks, your message is on its way" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to Home" })).toHaveAttribute("href", "/");
    await expect(page.getByRole("link", { name: "See the work" })).toHaveAttribute("href", "/work");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expectNoAxeViolations(page);

    // The cookie gate (src/middleware.ts) clears the cookie on the first request it sees
    // for /contact/sent. When Next renders the page inside the action's response, that is
    // the next reload, which may show the page once more. Either way it ends on the form.
    const hasCookie = async () =>
      (await page.context().cookies()).some((c) => c.name === "contact_sent");
    await page.reload();
    if (page.url().endsWith("/contact/sent")) {
      expect(await hasCookie()).toBe(false);
      await page.reload();
    }
    await expect(page).toHaveURL(/\/contact$/);
    expect(await hasCookie()).toBe(false);
  });

  test("a filled honeypot looks like success but sends nothing (AC-4)", async ({ page }) => {
    await fillValidForm(page);
    await page.locator('input[name="website"]').fill("https://spam.example", { force: true });
    await page.getByRole("button", { name: "Send message" }).click();

    // No cookie is set for bots, so the thank you page sends them back to the form.
    await expect(page).toHaveURL(/\/contact$/);
    expect((await page.context().cookies()).some((c) => c.name === "contact_sent")).toBe(false);
  });

  test("a missing Turnstile token shows the human check message (AC-5)", async ({ page }) => {
    await fillValidForm(page);
    await waitForTurnstile(page);
    await page.evaluate(() => {
      document.querySelector('input[name="cf-turnstile-response"]')?.remove();
    });
    await page.getByRole("button", { name: "Send message" }).click();

    const alert = page.getByRole("alert").filter({ hasText: "We couldn't confirm you're human" });
    await expect(alert).toBeFocused();
    await expect(page.getByLabel("Name")).toHaveValue("Test Visitor");
    await expect(page).toHaveURL(/\/contact$/);
  });
});

test("/contact/sent without the cookie redirects to /contact (AC-10)", async ({ page }) => {
  await page.goto("/contact/sent");
  await expect(page).toHaveURL(/\/contact$/);
});

// Chromium with JavaScript turned off still parses the page as if scripting were on,
// so <noscript> content never shows in Playwright. Check the HTML a no JS browser gets.
test("without JavaScript the page explains why and shows the email (AC-11)", async ({
  request,
}) => {
  const html = await (await request.get("/contact")).text();
  const noscript = (/<noscript>([\s\S]*?)<\/noscript>/.exec(html)?.[1] ?? "").replaceAll(
    "<!-- -->",
    "",
  );
  expect(noscript).toContain("This form needs JavaScript for its spam check.");
  expect(noscript).toMatch(/You can email me at \S+@\S+/);
});

test("the sitemap lists /contact but not /contact/sent (AC-10)", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("<loc>https://toyinog.com/contact</loc>");
  expect(sitemap).not.toContain("/contact/sent");
});

test(
  "a valid submit never sends from a test build: preview dry runs, production without an inbox shows the fallback (AC-8, AC-9)",
  { tag: PROD_ENV_TAG },
  async ({ page }) => {
    await page.goto("/contact");
    await fillValidForm(page);
    await waitForTurnstile(page);
    await page.getByRole("button", { name: "Send message" }).click();

    if (E2E_PRODUCTION) {
      // CONTACT_TO_EMAIL is empty in .dev.vars, so the production path stops before the send.
      // Scoped to the form: Next's route announcer is an alert too.
      const alert = page.locator("form").getByRole("alert");
      await expect(alert).toContainText(
        "Sorry, something went wrong sending your message. Please email me directly at",
      );
      await expect(alert).toBeFocused();
      await expect(page).toHaveURL(/\/contact$/);
      await expect(page.getByLabel("Name")).not.toHaveValue("");
    } else {
      await expect(page).toHaveURL(/\/contact\/sent$/);
    }
  },
);
