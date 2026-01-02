import { ChevronRight } from "lucide-react";
import { useLocation, Link } from "react-router";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({ title, items }) {
  const { pathname } = useLocation();

  // Function to detect active route
  const isActive = (href) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Recursively check if any nested child is active
  const anyChildActive = (children) =>
    children?.some((c) => isActive(c.href) || anyChildActive(c.children));

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>

      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon;
          const open = item.children ? anyChildActive(item.children) : false;

          // ---------------------------------------------------------------
          // CASE 1: SIMPLE DIRECT LINK
          // ---------------------------------------------------------------
          if (!item.children) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={isActive(item.href) ? "bg-accent font-medium" : ""}
                >
                  <Link to={item.href}>
                    {Icon && <Icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          // ---------------------------------------------------------------
          // CASE 2: COLLAPSIBLE PARENT
          // ---------------------------------------------------------------
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={open}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={open ? "bg-accent font-medium" : ""}
                  >
                    {Icon && <Icon />}
                    <span>{item.title}</span>
                    <ChevronRight
                      className={`ml-auto transition-transform duration-200 ${
                        open ? "rotate-90" : ""
                      }`}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.children.map((child) => {
                      const childOpen = child.children
                        ? anyChildActive(child.children)
                        : false;

                      // ----------------------------------------------------
                      // CASE 2A: CHILD = SIMPLE LINK
                      // ----------------------------------------------------
                      if (!child.children) {
                        return (
                          <SidebarMenuSubItem key={child.title}>
                            <SidebarMenuSubButton
                              asChild
                              className={
                                isActive(child.href)
                                  ? "bg-muted text-primary font-medium"
                                  : ""
                              }
                            >
                              <Link to={child.href}>
                                <span>{child.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      }

                      // ----------------------------------------------------
                      // CASE 2B: CHILD WITH SUB-CHILDREN → NESTED COLLAPSIBLE
                      // ----------------------------------------------------
                      return (
                        <Collapsible
                          key={child.title}
                          asChild
                          defaultOpen={childOpen}
                          className="group/subCollapsible ml-2"
                        >
                          <SidebarMenuSubItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuSubButton
                                className={
                                  childOpen ? "bg-muted font-medium" : ""
                                }
                              >
                                <span>{child.title}</span>
                                <ChevronRight
                                  className={`ml-auto h-4 w-4 transition-transform ${
                                    childOpen ? "rotate-90" : ""
                                  }`}
                                />
                              </SidebarMenuSubButton>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <SidebarMenuSub className="ml-4">
                                {child.children.map((sub) => (
                                  <SidebarMenuSubItem key={sub.title}>
                                    <SidebarMenuSubButton
                                      asChild
                                      className={
                                        isActive(sub.href)
                                          ? "bg-accent text-primary font-medium"
                                          : ""
                                      }
                                    >
                                      <Link to={sub.href}>
                                        <span>{sub.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </SidebarMenuSubItem>
                        </Collapsible>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
