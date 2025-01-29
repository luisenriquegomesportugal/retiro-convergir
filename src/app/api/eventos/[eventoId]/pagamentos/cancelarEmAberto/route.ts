// @ts-ignore:next-line
import EfiPay from 'sdk-node-apis-efi'
import efi from "@/configs/efi"

import { database } from "@/configs/firebase"
import { Charge, EventoPagamentosType, EventoType, InscritoType } from "@/types"
import { get, push, ref, remove, set } from "firebase/database"
import { v4 } from "uuid"
import { cancelarTransacoesEmAberto } from '@/lib/cancelar-transacoes'

type ApiProps = {
    params: {
        eventoId: string
    }
}

export async function GET(request: Request, { params }: ApiProps) {
    try {
        const refEvento = ref(database, `eventos/${params.eventoId}`)
        const snapshotEvento = await get(refEvento);
        const evento = snapshotEvento.val() as EventoType

        const refInscrito = ref(database, `eventos/${params.eventoId}/inscricoes`)
        const snapshotInscrito = await get(refInscrito);
        const inscritos = Object.values(snapshotInscrito.val()) as InscritoType[]

        for (let inscrito of inscritos) {
            if (inscrito.pagamentos) {
                for (let pagamento of Object.values(inscrito.pagamentos!)) {
                    if (!["CONCLUIDA", "paid", "REMOVIDA_PELO_USUARIO_RECEBEDOR", "canceled"].includes(pagamento.status!)) {
                        let status = pagamento.tipo === "pix" ? "REMOVIDA_PELO_USUARIO_RECEBEDOR" : "canceled"
                        await set(ref(database, `eventos/${evento.id}/inscricoes/${inscrito.cpf}/pagamentos/${pagamento.txid}/status`), status)
                    }
                }
            }
        }


        return Response.json({ status: true })
    }
    catch (e) {
        console.error(e)
        return Response.json({ message: "Falha ao cancelar todos os pagamentos" }, { status: 400 })
    }
}