import type { Meta, StoryObj } from "@storybook/react";

import { AppleButton } from "./AppleButton";
import { BlurView } from "./BlurView";

const meta = {
  title: "CRM/Apple UI/BlurView",
  component: BlurView,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BlurView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2 style={{ margin: "0 0 8px 0" }}>Frosted Glass</h2>
        <p style={{ margin: 0, opacity: 0.8 }}>Apple-style blur effect</p>
      </div>
    ),
  },
  decorators: [
    Story => (
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "60px",
          borderRadius: "16px",
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export const WithContent: Story = {
  args: {
    children: (
      <div style={{ padding: "32px", maxWidth: "400px" }}>
        <h3 style={{ margin: "0 0 16px 0" }}>Welcome</h3>
        <p style={{ margin: "0 0 24px 0", opacity: 0.9 }}>
          This content sits on top of a frosted glass background with backdrop
          blur.
        </p>
        <AppleButton>Get Started</AppleButton>
      </div>
    ),
  },
  decorators: [
    Story => (
      <div
        style={{
          background:
            "url(https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800)",
          backgroundSize: "cover",
          padding: "60px",
          borderRadius: "16px",
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export const Elevated: Story = {
  args: {
    intensity: "heavy",
    children: (
      <div style={{ padding: "32px" }}>
        <h3 style={{ margin: "0 0 8px 0" }}>Heavy Blur</h3>
        <p style={{ margin: 0, opacity: 0.8 }}>Stronger glass effect</p>
      </div>
    ),
  },
  decorators: [
    Story => (
      <div
        style={{
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          padding: "60px",
          borderRadius: "16px",
        }}
      >
        <Story />
      </div>
    ),
  ],
};
