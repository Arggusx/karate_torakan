import { redirect } from "next/navigation";

/** /en sozinho leva ao academy em inglês. */
export default function EnPage() {
  redirect("/en/estudos");
}
