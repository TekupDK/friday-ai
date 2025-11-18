import type { Meta, StoryObj } from "@storybook/react";

import { AppleTag } from "./AppleTag";

const meta = {
  title: "CRM/Apple UI/AppleTag",
  component: AppleTag,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AppleTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Tag",
  },
};

export const Primary: Story = {
  args: {
    children: "Primary",
    color: "#007AFF",
  },
};

export const Success: Story = {
  args: {
    children: "Success",
    color: "#34C759",
  },
};

export const Warning: Story = {
  args: {
    children: "Warning",
    color: "#FF9500",
  },
};

export const Error: Story = {
  args: {
    children: "Error",
    color: "#FF3B30",
  },
};

export const Purple: Story = {
  args: {
    children: "Purple",
    color: "#AF52DE",
  },
};

export const Removable: Story = {
  args: {
    children: "Removable",
    onRemove: () => alert("Tag removed!"),
  },
};

export const AllColors: Story = {
  args: {
    children: "All Colors",
  },
  render: () => (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      <AppleTag color="#007AFF">Blue</AppleTag>
      <AppleTag color="#34C759">Green</AppleTag>
      <AppleTag color="#FF9500">Orange</AppleTag>
      <AppleTag color="#FF3B30">Red</AppleTag>
      <AppleTag color="#AF52DE">Purple</AppleTag>
      <AppleTag color="#5856D6">Indigo</AppleTag>
      <AppleTag color="#007AFF" onRemove={() => {}}>
        Removable
      </AppleTag>
    </div>
  ),
};
