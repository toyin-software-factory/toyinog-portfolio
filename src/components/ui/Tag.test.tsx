import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Tag, TagList } from "./Tag";

describe("Tag", () => {
  it("renders tags as items of a named list", () => {
    render(
      <TagList label="Skills">
        <Tag>TypeScript</Tag>
        <Tag>Design systems</Tag>
      </TagList>,
    );
    const list = screen.getByRole("list", { name: "Skills" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
  });
});
