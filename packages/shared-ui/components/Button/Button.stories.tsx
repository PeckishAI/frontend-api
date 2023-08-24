import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import Button from './Button';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'SharedUI/Button',
  component: Button,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    className: {
      defaultValue: '',
      description: 'Additional class name to pass to the component',
    },
    onClick: {
      action: 'clicked',

      // type: 'function',
    },
    icon: {
      description: 'Icon to display on the button',
    },
    loading: {
      type: 'boolean',
      description: 'Whether the button is in loading state',
    },
    type: {
      options: ['primary', 'secondary'],
      control: {
        type: 'radio',
      },
      // control: {
      //   type: 'select',
      //   options: ['primary', 'secondary'],
      // },
    },
    value: {
      description: 'Text of the button',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary: Story = {
  args: {
    value: 'Click me',
    onClick: () => undefined,
    type: 'primary',
    loading: false,
  },
};

export const Secondary: Story = {
  args: {
    value: 'Click me',
    type: 'secondary',
    loading: false,
  },
};

export const WithIcon: Story = {
  name: 'Button with icon',
  args: {
    value: 'Click me',
    type: 'secondary',
    loading: false,
    icon: <span>👋</span>,
  },
};
