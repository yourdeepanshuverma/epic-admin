import React from "react";
import * as LucideIcons from "lucide-react";

export const DynamicIcon = ({ name, className }) => {
  if (!name) return null;
  
  // Try direct match
  let Icon = LucideIcons[name];
  
  // Try PascalCase
  if (!Icon) {
      const pascalName = name.charAt(0).toUpperCase() + name.slice(1);
      Icon = LucideIcons[pascalName];
  }

  // Try case-insensitive search
  if (!Icon) {
      const lowerName = name.toLowerCase();
      const key = Object.keys(LucideIcons).find(k => k.toLowerCase() === lowerName);
      if (key) Icon = LucideIcons[key];
  }

  if (!Icon) return null;
  return <Icon className={className} />;
};
