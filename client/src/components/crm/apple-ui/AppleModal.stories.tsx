/**
 * AppleModal Stories
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { AppleButton } from "./AppleButton";
import { AppleModal } from "./AppleModal";

const meta = {
  title: "Apple UI/AppleModal",
  component: AppleModal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AppleModal>;

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
        <AppleButton onClick={() => setIsOpen(true)}>Open Modal</AppleButton>

        <AppleModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Example Modal"
        >
          <p style={{ margin: 0, fontSize: "15px", lineHeight: "20px" }}>
            This is a modal with Apple-inspired design. It features a frosted
            glass backdrop, spring animations, and smooth transitions.
          </p>
          <div
            style={{
              marginTop: "24px",
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
            }}
          >
            <AppleButton variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </AppleButton>
            <AppleButton variant="primary" onClick={() => setIsOpen(false)}>
              Confirm
            </AppleButton>
          </div>
        </AppleModal>
      </>
    );
  },
};

export const WithoutTitle: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    children: null,
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <AppleButton onClick={() => setIsOpen(true)}>Open Modal</AppleButton>

        <AppleModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          showCloseButton={false}
        >
          <h2
            style={{ margin: "0 0 16px 0", fontSize: "22px", fontWeight: 700 }}
          >
            Custom Content
          </h2>
          <p style={{ margin: 0, fontSize: "15px", lineHeight: "20px" }}>
            Modal without header, just custom content.
          </p>
        </AppleModal>
      </>
    );
  },
};

export const LargeModal: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    children: null,
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <AppleButton onClick={() => setIsOpen(true)}>
          Open Large Modal
        </AppleButton>

        <AppleModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Large Modal"
          size="lg"
        >
          <div style={{ fontSize: "15px", lineHeight: "20px" }}>
            <p>This is a large modal with more content space.</p>
            <p>Perfect for forms or detailed information.</p>
          </div>
        </AppleModal>
      </>
    );
  },
};
