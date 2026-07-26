import type { ReactNode } from "react";

export type NavLink = {
  name: string;
  href: string;
};

export type MemberList = {
  label: string;
  icon: ReactNode;
  href: string;
};
