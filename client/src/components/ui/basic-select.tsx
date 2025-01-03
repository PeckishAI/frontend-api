
import React from "react";
import Select, { components } from "react-select";

interface Option {
  label: string;
  value: string;
}

interface Group {
  label: string;
  options: Option[];
}

interface BasicSelectProps {
  options: Option[] | Group[];
  onChange: (selectedOption: Option | null) => void;
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
        fontSize: "0.875rem",
        padding: "0 12px",
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
    padding: "0 12px",
    margin: "0",
    display: "flex",
    alignItems: "center",
    maxWidth: "100%",
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
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "calc(100% - 24px)",
  }),
});

const CustomDropdownIndicator = (props: any) => (
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

export const BasicSelect: React.FC<BasicSelectProps> = ({
  options,
  onChange,
  placeholder = "",
  value,
  size = "medium",
}) => {
  const sizeStyles = getSizeStyles(size);

  return (
    <div style={{ width: sizeStyles.width }}>
      <Select
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        styles={customStyles(size)}
        components={{
          DropdownIndicator: CustomDropdownIndicator,
          IndicatorSeparator: () => null,
        }}
        isSearchable={true}
      />
    </div>
  );
};
