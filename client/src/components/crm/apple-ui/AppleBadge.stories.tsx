/**
 * AppleBadge Stories
 */

import type { Meta, StoryObj } from "@storybook/react";

import { AppleBadge } from "./AppleBadge";

const meta = {
  title: "Apple UI/AppleBadge",
  component: AppleBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: [
        "new",
        "active",
        "inactive",
        "vip",
        "at_risk",
        "planned",
        "in_progress",
        "completed",
        "cancelled",
      ],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof AppleBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const New: Story = {
  args: {
    status: "new",
  },
};

export const Active: Story = {
  args: {
    status: "active",
  },
};

export const VIP: Story = {
  args: {
    status: "vip",
  },
};

export const AtRisk: Story = {
  args: {
    status: "at_risk",
  },
};

export const AllStatuses: Story = {
  args: {
    status: "new",
  },
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
      <AppleBadge status="new" />
      <AppleBadge status="active" />
      <AppleBadge status="inactive" />
      <AppleBadge status="vip" />
      <AppleBadge status="at_risk" />
      <AppleBadge status="planned" />
      <AppleBadge status="in_progress" />
      <AppleBadge status="completed" />
      <AppleBadge status="cancelled" />
    </div>
  ),
};

export const AllSizes: Story = {
  args: {
    status: "active",
    size: "sm",
  },
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        alignItems: "flex-start",
      }}
    >
      <AppleBadge status="active" size="sm" />
      <AppleBadge status="active" size="md" />
      <AppleBadge status="active" size="lg" />
    </div>
  ),
};
