import Link from "next/link";
import type { NavLink } from "@/types/navbar";

type NavLinksProps = {
  links: NavLink[];
};

export default function NavLinks({ links }: NavLinksProps) {
  return (
    <div className="hidden items-center md:flex">
      {links.map((link) => (
        <div key={link.name} className="flex items-center border-r px-5 last:border-0">
          <Link href={link.href} className="hover:text-gray-300">
            {link.name}
          </Link>
        </div>
      ))}
    </div>
  );
}