import type { Meta, StoryObj } from '@storybook/react';

import Dropdown from './Dropdown';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'SharedUI/Dropdown',
  component: Dropdown,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    className: {
      description: 'Additional class name to pass to the component',
      control: {
        type: 'text',
      },
    },
    disableOption: {
      description: 'Option to show disabled',
      control: {
        type: 'text',
      },
    },
    options: {
      description: 'Options to show in the dropdown',
    },
  },
} satisfies Meta<typeof Dropdown>;

export default meta;

type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const DefaultDropdown: Story = {
  args: {
    options: [
      {
        label: 'Option 1',
        value: 'option1',
      },
      {
        label: 'Option 2',
        value: 'option2',
      },
    ],
  },
};

export const DropdownWithOneDisabled: Story = {
  name: 'Dropdown with one default option disabled',
  args: {
    disableOption: 'Disabled',
    options: [
      {
        label: 'Option 1',
        value: 'option1',
      },
      {
        label: 'Option 2',
        value: 'option2',
      },
    ],
  },
};

export const DropdownWithSomeDisabled: Story = {
  name: 'Dropdown with some options disabled',
  args: {
    options: [
      {
        label: 'Option 1',
        value: 'option1',
      },
      {
        label: 'Option 2',
        value: 'option2',
        disabled: true,
      },
      {
        label: 'Option 3',
        value: 'option3',
      },
    ],
  },
};
