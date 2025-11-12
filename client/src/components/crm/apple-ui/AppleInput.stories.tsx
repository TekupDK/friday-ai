/**
 * AppleInput Stories
 */

import type { Meta, StoryObj } from "@storybook/react";
import { Lock, Mail, User } from "lucide-react";
import { AppleInput } from "./AppleInput";

const meta = {
  title: "Apple UI/AppleInput",
  component: AppleInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    Story => (
      <div style={{ width: "400px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AppleInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Email Address",
    placeholder: "Enter your email",
  },
};

export const WithLeftIcon: Story = {
  args: {
    label: "Email Address",
    placeholder: "Enter your email",
    leftIcon: <Mail size={16} />,
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    leftIcon: <Lock size={16} />,
    helperText: "Must be at least 8 characters",
  },
};

export const WithError: Story = {
  args: {
    label: "Email Address",
    placeholder: "Enter your email",
    leftIcon: <Mail size={16} />,
    error: "This field is required",
  },
};

export const AllStates: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "400px",
        padding: "24px",
        background: "#FFFFFF",
        borderRadius: "16px",
      }}
    >
      <AppleInput
        label="Name"
        placeholder="Enter your name"
        leftIcon={<User size={16} />}
      />
      <AppleInput
        label="Email"
        type="email"
        placeholder="Enter your email"
        leftIcon={<Mail size={16} />}
        helperText="We'll never share your email"
      />
      <AppleInput
        label="Password"
        type="password"
        placeholder="Enter your password"
        leftIcon={<Lock size={16} />}
        error="Password is too short"
      />
    </div>
  ),
  parameters: {
    backgrounds: {
      default: "light",
    },
  },
};
