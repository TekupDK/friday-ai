import type { Meta, StoryObj } from "@storybook/react";

import { AppleCard } from "./AppleCard";
import { ScrollReveal } from "./ScrollReveal";

const meta = {
  title: "CRM/Apple UI/ScrollReveal",
  component: ScrollReveal,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ScrollReveal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <AppleCard variant="elevated">
        <div style={{ padding: "24px" }}>
          <h3>Scroll to reveal</h3>
          <p>This card will animate when scrolled into view</p>
        </div>
      </AppleCard>
    ),
  },
};

export const MultipleCards: Story = {
  args: {
    children: null,
  },
  render: () => (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "40px" }}>Scroll Down</h1>
      <div style={{ height: "100vh" }} />

      <ScrollReveal>
        <AppleCard variant="elevated" style={{ marginBottom: "24px" }}>
          <div style={{ padding: "32px" }}>
            <h2 style={{ margin: "0 0 8px 0" }}>First Card</h2>
            <p style={{ margin: 0 }}>Animates on scroll</p>
          </div>
        </AppleCard>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <AppleCard variant="filled" style={{ marginBottom: "24px" }}>
          <div style={{ padding: "32px" }}>
            <h2 style={{ margin: "0 0 8px 0" }}>Second Card</h2>
            <p style={{ margin: 0 }}>With a slight delay</p>
          </div>
        </AppleCard>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <AppleCard variant="glass" style={{ marginBottom: "24px" }}>
          <div style={{ padding: "32px" }}>
            <h2 style={{ margin: "0 0 8px 0" }}>Third Card</h2>
            <p style={{ margin: 0 }}>Even more delay</p>
          </div>
        </AppleCard>
      </ScrollReveal>

      <div style={{ height: "100vh" }} />
    </div>
  ),
};
