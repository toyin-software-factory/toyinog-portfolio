import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Field } from "./Field";
import { Input } from "./Input";

describe("Field", () => {
  it("labels the control and links the hint", () => {
    render(
      <Field label="Email" id="email" hint="I reply within two days.">
        {(control) => <Input {...control} type="email" />}
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAccessibleDescription("I reply within two days.");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("marks the control invalid and links the error", () => {
    render(
      <Field label="Email" id="email" hint="Your work address." error="Enter a valid email.">
        {(control) => <Input {...control} type="email" />}
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toBeInvalid();
    expect(input).toHaveAttribute("aria-describedby", "email-hint email-error");
    expect(input).toHaveAccessibleDescription("Your work address. Enter a valid email.");
  });

  it("marks optional fields in the label", () => {
    render(
      <Field label="Company" id="company" optional>
        {(control) => <Input {...control} />}
      </Field>,
    );
    expect(screen.getByRole("textbox", { name: "Company (optional)" })).toBeInTheDocument();
  });
});
