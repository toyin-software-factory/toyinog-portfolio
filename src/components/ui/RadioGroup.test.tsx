import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RadioGroup } from "./RadioGroup";

const options = [
  { value: "hiring", label: "I'm hiring" },
  { value: "project", label: "I have a project" },
];

describe("RadioGroup", () => {
  it("is a group named by its legend with one radio per option", () => {
    render(
      <RadioGroup name="reason" legend="What brings you here?" options={options} value="project" />,
    );
    expect(screen.getByRole("group", { name: "What brings you here?" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "I'm hiring" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "I have a project" })).toBeChecked();
  });

  it("links the error to the group", () => {
    render(
      <RadioGroup
        name="reason"
        legend="What brings you here?"
        options={options}
        error="Pick one."
        required
      />,
    );
    expect(
      screen.getByRole("group", { name: "What brings you here?" }),
    ).toHaveAccessibleDescription("Pick one.");
    expect(screen.getByRole("radio", { name: "I'm hiring" })).toBeRequired();
  });

  it("disables every option", () => {
    render(<RadioGroup name="reason" legend="Reason" options={options} disabled />);
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
  });
});
