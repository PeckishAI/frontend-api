
import { useState } from "react";
import Products from "./Products";
import Preparations from "./Preparations";
import SubSectionNav from "@/components/layout/SubSectionNav";

export default function Menu() {
  const [activeSection, setActiveSection] = useState("products");

  const sections = [
    { id: "products", label: "Products" },
    { id: "modifiers", label: "Modifiers" },
    { id: "preparations", label: "Preparations" },
  ];

  return (
    <div className="ml-64 w-[calc(100%-16rem)]">
      <div className="pt-8">
        <SubSectionNav
          sections={sections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {activeSection === "products" && <Products />}

        {activeSection === "modifiers" && <Modifiers />}

        {activeSection === "preparations" && <Preparations />}
      </div>
    </div>
  );
}
