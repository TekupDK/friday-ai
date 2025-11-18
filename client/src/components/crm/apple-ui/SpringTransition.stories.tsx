import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { AppleButton } from "./AppleButton";
import { AppleCard } from "./AppleCard";
import { SpringTransition } from "./SpringTransition";

const meta = {
  title: "CRM/Apple UI/SpringTransition",
  component: SpringTransition,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SpringTransition>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <AppleCard variant="elevated">
        <div style={{ padding: "24px" }}>
          <h3>Animated Card</h3>
          <p>This card animates in with a spring transition</p>
        </div>
      </AppleCard>
    ),
  },
};

export const BouncySpring: Story = {
  args: {
    springType: "bouncy",
    children: (
      <AppleCard variant="filled">
        <div style={{ padding: "24px" }}>
          <h3>Bouncy Animation</h3>
          <p>More pronounced bounce effect</p>
        </div>
      </AppleCard>
    ),
  },
};

export const Interactive: Story = {
  args: {
    children: null,
  },
  render: () => {
    const [show, setShow] = useState(true);
    return (
      <div style={{ textAlign: "center" }}>
        <AppleButton
          onClick={() => setShow(!show)}
          style={{ marginBottom: "24px" }}
        >
          {show ? "Hide" : "Show"}
        </AppleButton>
        {show && (
          <SpringTransition>
            <AppleCard variant="glass">
              <div style={{ padding: "32px" }}>
                <h3 style={{ margin: "0 0 8px 0" }}>Toggle Me!</h3>
                <p style={{ margin: 0 }}>Watch the spring animation</p>
              </div>
            </AppleCard>
          </SpringTransition>
        )}
      </div>
    );
  },
};
