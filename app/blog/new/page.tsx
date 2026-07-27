import { redirect } from "next/navigation";

export default function BlogNewPage() {
  redirect("/member/edit-post?tab=create");
}
