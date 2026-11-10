import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ContactState } from "@/lib/contact/handle";

import { sendContact } from "./actions";
import { ContactForm } from "./ContactForm";

vi.mock("./actions", () => ({ sendContact: vi.fn() }));

const reset = vi.fn();
vi.mock("./Turnstile", async () => {
  const { useImperativeHandle } = await import("react");
  return {
    Turnstile: ({ ref }: { ref?: React.Ref<{ reset: () => void }> }) => {
      useImperativeHandle(ref, () => ({ reset }));
      return null;
    },
  };
});

const values = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  type: "project",
  message: "Could you help us rebuild our marketing site?",
};

const answerWith = (state: ContactState) => {
  vi.mocked(sendContact).mockResolvedValue(state);
};

const submit = async () => {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await Promise.resolve();
  });
};

const renderForm = () => render(<ContactForm turnstileSiteKey="test" email="hello@toyinog.com" />);

describe("ContactForm (spec 0007)", () => {
  beforeEach(() => {
    vi.mocked(sendContact).mockReset();
    reset.mockReset();
  });

  it("shows the rate limit message, focuses it and resets Turnstile (AC-6)", async () => {
    answerWith({ status: "rate_limited", values });
    renderForm();
    await submit();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "Too many messages in a short time. Please wait a minute and try again.",
    );
    expect(alert).toHaveFocus();
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("shows the human check message when Turnstile fails (AC-5)", async () => {
    answerWith({ status: "turnstile", values });
    renderForm();
    await submit();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't confirm you're human. Please try again.",
    );
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("shows the email as text and keeps the input when sending fails (AC-9)", async () => {
    answerWith({ status: "send_failed", values });
    renderForm();
    await submit();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Sorry, something went wrong sending your message. Please email me directly at hello@toyinog.com.",
    );
    expect(screen.getByLabelText("Name")).toHaveValue(values.name);
    expect(screen.getByLabelText(/^Email/)).toHaveValue(values.email);
    expect(screen.getByRole("radio", { name: "A project" })).toBeChecked();
    expect(screen.getByLabelText(/^Message/)).toHaveValue(values.message);
  });

  it("says how many problems there are and links each field (AC-3)", async () => {
    answerWith({
      status: "invalid",
      errors: { name: "Enter your name.", type: "Choose what this is about." },
      values: { ...values, name: "", type: "" },
    });
    renderForm();
    await submit();

    const summary = await screen.findByRole("alert", { name: /There are 2 problems/ });
    expect(summary).toHaveFocus();
    expect(screen.getByRole("link", { name: "Name: Enter your name." })).toHaveAttribute(
      "href",
      "#name",
    );
    expect(
      screen.getByRole("link", { name: "What's this about?: Choose what this is about." }),
    ).toHaveAttribute("href", "#type-hiring");
  });

  it("shows a pending state while sending (AC-11)", async () => {
    vi.mocked(sendContact).mockReturnValue(new Promise<ContactState>(() => undefined));
    renderForm();
    await submit();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Sending…/ })).toBeDisabled();
    });
    expect(screen.getByRole("button", { name: /Sending…/ })).toHaveAttribute("aria-busy", "true");
  });

  it("hides the honeypot from people and assistive tech (AC-2)", () => {
    const { container } = renderForm();
    const honeypot = container.querySelector<HTMLInputElement>('input[name="website"]');
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot).toHaveAttribute("autocomplete", "off");
    expect(honeypot?.closest('[aria-hidden="true"]')).not.toBeNull();
  });
});
