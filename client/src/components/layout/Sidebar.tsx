import { Link } from "wouter";
import { Package, ClipboardList, MenuSquare, FileText, FileBox, ClipboardCheck, Files, ChartBar } from "lucide-react";

const menuItems = [
  { icon: Package, label: "Orders", href: "/" },
  { icon: ClipboardList, label: "Inventory", href: "/inventory" },
  { icon: MenuSquare, label: "Menu", href: "/menu" },
  { icon: Files, label: "Documents", href: "/documents" },
  { icon: ChartBar, label: "General", href: "/general" },
];

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-0">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Restaurant Manager</h1>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link href={item.href} className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors">
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                  {item.subItems && (
                    <ul className="ml-6 mt-1 space-y-1">
                      {item.subItems.map((subItem) => {
                        const SubIcon = subItem.icon;
                        return (
                          <li key={subItem.href}>
                            <Link href={subItem.href} className="flex items-center gap-3 px-3 py-2 text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors">
                              <SubIcon className="h-4 w-4" />
                              {subItem.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
