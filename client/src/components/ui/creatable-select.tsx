import React, { useState } from "react";
import Creatable from "react-select/creatable";
import { components, createFilter } from "react-select";
import { PlusCircle } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface Group {
  label: string;
  options: Option[];
}

interface CreatableSelectProps {
  options: Option[] | Group[];
  onChange: (selectedOption: Option | null) => void;
  onCreateOption: (newOption: string) => void;
  placeholder?: string;
  value?: Option | null;
  size?: "small" | "medium" | "large";
}

const getSizeStyles = (size: "small" | "medium" | "large") => {
  switch (size) {
    case "small":
      return {
        height: "40px",
        width: "100px",
        fontSize: "0.75rem",
        padding: "0 8px",
      };
    case "medium":
      return {
        height: "40px",
        width: "200px",
        fontSize: "0.875rem",
        padding: "0 12px",
      };
    case "large":
      return {
        height: "40px",
        width: "100%",
        fontSize: "1rem",
        padding: "0 16px",
      };
    default:
      return {};
  }
};

const customStyles = (size: "small" | "medium" | "large") => ({
  control: (provided: any, state: any) => ({
    ...provided,
    display: "flex",
    height: getSizeStyles(size).height,
    width: getSizeStyles(size).width,
    padding: getSizeStyles(size).padding,
    fontSize: getSizeStyles(size).fontSize,
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: "6px",
    border: `1px solid ${state.isFocused ? "#000" : "#d1d5db"}`,
    backgroundColor: "#fff",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(0, 0, 0, 0.1)" : "none",
    "&:hover": {
      borderColor: "#000",
    },
    gap: "0px",
  }),
  menu: (provided: any) => ({
    ...provided,
    zIndex: 9999,
    backgroundColor: "#fff",
    borderRadius: "6px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    border: "1px solid #d1d5db",
  }),
  menuPortal: (provided: any) => ({
    ...provided,
    zIndex: 9999,
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    display: "flex",
    alignItems: "center",
    padding: "8px 16px",
    fontSize: "0.875rem",
    cursor: "pointer",
    backgroundColor: state.isFocused ? "#f3f4f6" : "#fff",
    color: state.isFocused ? "#000" : "#374151",
    "&:active": {
      backgroundColor: "#e5e7eb",
    },
  }),
  dropdownIndicator: (provided: any) => ({
    ...provided,
    color: "#6b7280",
    padding: "0",
    margin: "0",
    borderLeft: "none",
    "&:hover": {
      color: "#000",
    },
  }),
  indicatorsContainer: (provided: any) => ({
    ...provided,
    borderLeft: "none",
    padding: "0",
    margin: "0",
    display: "flex",
    alignItems: "center",
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    padding: "0",
    margin: "0",
    display: "flex",
    alignItems: "center",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "#9ca3af",
    fontSize: getSizeStyles(size).fontSize,
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: "#374151",
    fontSize: getSizeStyles(size).fontSize,
  }),
});

const CustomMenu = (props: any) => {
  const { children, selectProps } = props;

  // Remove duplicate groups by label
  const uniqueGroups = Array.isArray(selectProps.options) 
    ? selectProps.options.reduce((acc: any[], item: any) => {
        if (!acc.some(g => g.label === item.label)) {
          acc.push(item);
        }
        return acc;
      }, [])
    : [];

  return (
    <components.Menu {...props}>
      <div className="flex flex-col">
        {uniqueGroups.map((item: any) => {
          if (item.options) {
            // This is a group
            return (
              <div key={item.label} className="group">
                <div className="px-2 py-1 text-xs uppercase tracking-wide text-gray-500 font-semibold">
                  {item.label}
                </div>
                {item.options.map((option: any) => (
                  <components.Option
                    key={option.value}
                    data={option}
                    {...props}
                  />
                ))}
              </div>
            );
          }
          // This is a single option
          return (
            <components.Option key={item.value} data={item} {...props} />
          );
        })}
        {/* Separator */}
        <div className="border-t border-gray-300 my-2"></div>
        {/* Create New Option */}
        <div
          className="flex items-center cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 rounded-md mb-2"
          onClick={() =>
            selectProps.onCreateOption(selectProps.inputValue || "New Item")
          }
        >
          <PlusCircle className="mr-2 h-4 w-4 text-gray-600" />
          <span className="text-gray-800">
            Create{" "}
            {selectProps.inputValue
              ? `"${selectProps.inputValue}"`
              : "New Item"}
          </span>
        </div>
      </div>
    </components.Menu>
  );
};

const CustomDropdownIndicator = (props: any) => {
  return (
    <components.DropdownIndicator {...props}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 8l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </components.DropdownIndicator>
  );
};

const CustomOption = (props: any) => {
  const { data, selectProps } = props;

  if (data.__isNew__) {
    return (
      <div
        className="flex items-center cursor-pointer p-2 text-sm hover:bg-gray-100"
        onClick={() => selectProps.onCreateOption(selectProps.inputValue)}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        <span>Create "{selectProps.inputValue}"</span>
      </div>
    );
  }

  return <components.Option {...props} />;
};

export const CreatableSelect: React.FC<CreatableSelectProps> = ({
  options,
  onChange,
  onCreateOption,
  placeholder = "Search...",
  value,
  size = "medium",
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
  };

  const handleChange = (newValue: any) => {
    onChange(newValue);
  };

  const handleCreate = (newOptionLabel: string) => {
    const newOption = {
      label: newOptionLabel,
      value: newOptionLabel.toLowerCase(),
    };
    onCreateOption(newOptionLabel);
    handleChange(newOption);
  };

  const sizeStyles = getSizeStyles(size);

  return (
    <div style={{ width: sizeStyles.width }}>
      <Creatable
        isClearable
        value={value}
        onChange={handleChange}
        onInputChange={handleInputChange}
        onCreateOption={handleCreate}
        options={options}
        placeholder={placeholder}
        styles={customStyles(size)}
        components={{
          Menu: CustomMenu,
          Option: CustomOption,
          ClearIndicator: () => null,
          DropdownIndicator: CustomDropdownIndicator,
          IndicatorSeparator: () => null,
        }}
        filterOption={createFilter({ ignoreAccents: false })}
      />
    </div>
  );
};
