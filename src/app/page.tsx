import { redirect } from "next/navigation";

/** The public site starts at the careers listing. */
export default function RootRedirect() {
  redirect("/careers");
}
