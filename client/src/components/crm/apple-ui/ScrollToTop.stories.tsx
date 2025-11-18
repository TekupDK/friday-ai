import type { Meta, StoryObj } from "@storybook/react";

import { ScrollToTop } from "./ScrollToTop";

const meta = {
  title: "CRM/Apple UI/ScrollToTop",
  component: ScrollToTop,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ScrollToTop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: () => (
    <div>
      <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
        <h1>Scroll Down to See Button</h1>
        <p>The scroll-to-top button will appear after you scroll down 300px</p>

        {Array.from({ length: 50 }, (_, i) => (
          <p key={i}>
            Content paragraph {i + 1}. Scroll down to see the scroll-to-top
            button appear.
          </p>
        ))}
      </div>
      <ScrollToTop />
    </div>
  ),
};

export const CustomThreshold: Story = {
  args: {},
  render: () => (
    <div>
      <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
        <h1>Custom Threshold (100px)</h1>
        <p>The button appears after scrolling just 100px</p>

        {Array.from({ length: 50 }, (_, i) => (
          <p key={i}>
            Content paragraph {i + 1}. The button should appear very quickly.
          </p>
        ))}
      </div>
      <ScrollToTop threshold={100} />
    </div>
  ),
};
