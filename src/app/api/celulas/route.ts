import { database } from "@/configs/firebase";
import { CelulaType } from "@/types";
import { get, ref } from "firebase/database";

export async function GET() {
    const refCelulas = ref(database, "celulas")
    const snapshotCelulas = await get(refCelulas)

    const celulas = snapshotCelulas.val() as CelulaType[]

    return Response.json({ celulas: celulas.filter(c => ["Rede 12", "Rede 17"].includes(c.rede)) })
}
