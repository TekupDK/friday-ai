/**
 * AppleButton Stories
 *
 * Storybook stories for AppleButton component
 */

import type { Meta, StoryObj } from "@storybook/react";
import { ChevronRight, Mail, Plus } from "lucide-react";

import { AppleButton } from "./AppleButton";

const meta = {
  title: "Apple UI/AppleButton",
  component: AppleButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "tertiary"],
      description: "Button variant",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Button size",
    },
    loading: {
      control: "boolean",
      description: "Loading state",
    },
    disabled: {
      control: "boolean",
      description: "Disabled state",
    },
    fullWidth: {
      control: "boolean",
      description: "Full width button",
    },
  },
} satisfies Meta<typeof AppleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary Button",
  },
};

export const Tertiary: Story = {
  args: {
    variant: "tertiary",
    children: "Tertiary Button",
  },
};

export const Small: Story = {
  args: {
    variant: "primary",
    size: "sm",
    children: "Small Button",
  },
};

export const Medium: Story = {
  args: {
    variant: "primary",
    size: "md",
    children: "Medium Button",
  },
};

export const Large: Story = {
  args: {
    variant: "primary",
    size: "lg",
    children: "Large Button",
  },
};

export const WithLeftIcon: Story = {
  args: {
    variant: "primary",
    leftIcon: <Plus size={16} />,
    children: "Add Item",
  },
};

export const WithRightIcon: Story = {
  args: {
    variant: "primary",
    rightIcon: <ChevronRight size={16} />,
    children: "Continue",
  },
};

export const Loading: Story = {
  args: {
    variant: "primary",
    loading: true,
    children: "Loading...",
  },
};

export const Disabled: Story = {
  args: {
    variant: "primary",
    disabled: true,
    children: "Disabled Button",
  },
};

export const FullWidth: Story = {
  args: {
    variant: "primary",
    fullWidth: true,
    children: "Full Width Button",
  },
  parameters: {
    layout: "padded",
  },
};

export const AllVariants: Story = {
  args: {
    children: "All Variants",
  },
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "300px",
      }}
    >
      <AppleButton variant="primary">Primary</AppleButton>
      <AppleButton variant="secondary">Secondary</AppleButton>
      <AppleButton variant="tertiary">Tertiary</AppleButton>
      <AppleButton variant="primary" leftIcon={<Mail size={16} />}>
        With Icon
      </AppleButton>
      <AppleButton variant="primary" loading>
        Loading
      </AppleButton>
      <AppleButton variant="primary" disabled>
        Disabled
      </AppleButton>
    </div>
  ),
};
