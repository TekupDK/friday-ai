import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AppleSearchField } from "./AppleSearchField";

const meta = {
  title: "CRM/Apple UI/AppleSearchField",
  component: AppleSearchField,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AppleSearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Search...",
  },
};

export const WithValue: Story = {
  args: {
    value: "Search text",
    placeholder: "Search...",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Search...",
    disabled: true,
  },
};

export const Interactive: Story = {
  args: {
    placeholder: "Interactive search",
  },
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div style={{ width: "400px" }}>
        <AppleSearchField
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Type to search..."
        />
        {value && (
          <p style={{ marginTop: "16px", color: "#666" }}>
            Searching for: {value}
          </p>
        )}
      </div>
    );
  },
};
