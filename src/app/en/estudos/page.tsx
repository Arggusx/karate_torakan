import { redirect } from "next/navigation";

/** Fase 1 do inglês: a entrada do academy em inglês é o índice dos katas. */
export default function EstudosEnPage() {
  redirect("/en/estudos/tecnicas");
}
