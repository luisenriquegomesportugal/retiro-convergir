// @ts-ignore:next-line
import EfiPay from 'sdk-node-apis-efi'
import efi from "@/configs/efi"

import { database } from "@/configs/firebase"
import { EventoPagamentosType, EventoType, InscritoType, PixCharge, PixChargeLoc } from "@/types"
import { get, ref, remove, set } from "firebase/database"
import { cancelarTransacoesEmAberto } from '@/lib/cancelar-transacoes'
import { v4 } from 'uuid'

type ApiProps = {
    params: {
        eventoId: string,
        inscritoId: number
    }
}

export async function POST(request: Request, { params }: ApiProps) {
    try {

        const refInscrito = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}`)
        const snapshotInscrito = await get(refInscrito);
        const inscrito = snapshotInscrito.val() as InscritoType

        const pagamentos = Object.values(inscrito.pagamentos || {}).filter(pagamento => {
            return pagamento.tipo === "money" && pagamento.status == "ATIVA"
        })

        if (pagamentos && pagamentos?.length > 0) {
            for (let pagamento of pagamentos) {
                await set(ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}/pagamentos/${pagamento.txid}/status`), "CONCLUIDA")
                await set(ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}/pagamentos/${pagamento.txid}/pagoEm`), new Date().toLocaleString())
            }

            return Response.json({ message: "Pagamentos em Dinheiro confirmados", error: false })
        } else {
            return Response.json({ message: "Nenhum pagamento em Dinheiro agendado", error: true }, { status: 500 })
        }
    }
    catch (e) {
        console.error(e)
        return Response.json({ message: "Falha ao gerar o pagamento", error: true }, { status: 500 })
    }
}