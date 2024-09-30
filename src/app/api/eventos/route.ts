import { database, storage } from "@/firebase";
import { EventoType } from "@/types";
import { get as getDatabase, ref as refDatabase } from "firebase/database";
import { getDownloadURL, ref as refStorage } from "firebase/storage";

export async function GET() {
    const refEventos = refDatabase(database, `eventos`)
    const snapshotEventos = await getDatabase(refEventos)

    const eventos = Object.values<EventoType>(snapshotEventos.val());

    return Response.json({ eventos })
}
