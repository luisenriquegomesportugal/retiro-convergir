import { database } from "@/configs/firebase";
import { EventoType, InscritoType } from "@/types";
import { get, ref } from "firebase/database";

type ApiProps = {
    params: {
        eventoId: string,
        inscritoId: number
    }
}

export async function GET(_: Request, { params }: ApiProps) {

    const refInscrito = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}`)
    const snapshotInscrito = await get(refInscrito);
    const inscrito = snapshotInscrito.val() as InscritoType

    const refEvento = ref(database, `eventos/${params.eventoId}`)
    const snapshotEvento = await get(refEvento);
    const evento = snapshotEvento.val() as EventoType

    let pagamentosDoInscrito = Object
        .values(inscrito.pagamentos! || {})
        .filter(f => ["paid", "CONCLUIDA"].includes(f.status!))

    let parcelasPagasDoInscrito = pagamentosDoInscrito
        .reduce<number[]>((acc, p) => acc.concat(p.parcelas.map(m => m.parcela)), [])

    let valoresPagosDoInscrito = pagamentosDoInscrito
        .reduce((acc, p) => acc + Number.parseFloat(p.valor!), 0)

    let valorDoRetiro = evento.pagamentos
        .reduce((acc, p) => {
            return {
                money: acc.money + p.valores.money,
                pix: acc.pix + p.valores.pix,
                credit_card: acc.credit_card + p.valores.credit_card
            }
        }, { money: 0, pix: 0, credit_card: 0 })

    let parcelasDoRetiroEmAbertoInscrito = evento.pagamentos
        .filter(p => Date.now() < new Date(p.dataLimite!).getTime() && !parcelasPagasDoInscrito.includes(p.parcela))
        .map((p, i, a) => {

            return {
                parcela: p.parcela,
                valores: {
                    money: (valorDoRetiro.money - valoresPagosDoInscrito) / a.length,
                    credit_card: (valorDoRetiro.credit_card - valoresPagosDoInscrito) / a.length,
                    pix: (valorDoRetiro.pix - valoresPagosDoInscrito) / a.length
                },
                paga: false
            }
        })

    let parcelasRetiroPagasPeloInscrito = evento.pagamentos
        .filter(p => parcelasPagasDoInscrito.includes(p.parcela))
        .map(m => ({
            parcela: m.parcela,
            valores: {
                money: 0,
                pix: 0,
                credit_card: 0
            },
            paga: true
        }))

    let parcelasZeradas = evento.pagamentos
        .map(p => ({
            parcela: p.parcela,
            valores: {
                money: 0,
                pix: 0,
                credit_card: 0
            },
            paga: true
        }))
        .filter(p => !parcelasRetiroPagasPeloInscrito.some(s => s.parcela === p.parcela) && !parcelasDoRetiroEmAbertoInscrito.some(s => s.parcela === p.parcela))

    return Response.json({
        parcelas: parcelasRetiroPagasPeloInscrito
            .concat(parcelasZeradas)
            .concat(parcelasDoRetiroEmAbertoInscrito)
            .sort((a, b) => a.parcela - b.parcela)
    })
}