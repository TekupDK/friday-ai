import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AppleButton } from "./AppleButton";
import { AppleSheet } from "./AppleSheet";

const meta = {
  title: "CRM/Apple UI/AppleSheet",
  component: AppleSheet,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AppleSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    children: null,
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <div style={{ padding: "20px" }}>
          <AppleButton onClick={() => setIsOpen(true)}>Open Sheet</AppleButton>
        </div>
        <AppleSheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Sheet Title"
        >
          <div style={{ padding: "20px" }}>
            <p>Swipe down to close or tap the backdrop</p>
            <p>Try dragging the handle or sheet content</p>
          </div>
        </AppleSheet>
      </>
    );
  },
};

export const TallContent: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    children: null,
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <div style={{ padding: "20px" }}>
          <AppleButton onClick={() => setIsOpen(true)}>
            Open Tall Sheet
          </AppleButton>
        </div>
        <AppleSheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Scrollable Content"
          snapPoints={[0.5, 0.9]}
        >
          <div style={{ padding: "20px" }}>
            {Array.from({ length: 50 }, (_, i) => (
              <p key={i}>Content line {i + 1}</p>
            ))}
          </div>
        </AppleSheet>
      </>
    );
  },
};

export const NoHandle: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    children: null,
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <div style={{ padding: "20px" }}>
          <AppleButton onClick={() => setIsOpen(true)}>
            Open Sheet (No Handle)
          </AppleButton>
        </div>
        <AppleSheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="No Handle"
          showHandle={false}
        >
          <div style={{ padding: "20px" }}>
            <p>This sheet has no drag handle</p>
            <p>Tap the backdrop to close</p>
          </div>
        </AppleSheet>
      </>
    );
  },
};
