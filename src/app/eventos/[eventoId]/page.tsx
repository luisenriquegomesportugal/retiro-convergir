import { PagamentoParcelasCard } from "@/components/gerenciamento/cards/pagamento-parcelas"
import { ValoresInscricoesDiaCard } from "@/components/gerenciamento/cards/valores-inscricoes-dia"
import { ValoresTotaisCard } from "@/components/gerenciamento/cards/valores-totais"
import CardTableInscricoes from "@/components/gerenciamento/inscricoes"
import CardTableInscricoesMeta from "@/components/gerenciamento/inscricoes-meta"
import { getPagamentoInscrito } from "@/lib/utils"
import { CelulaType, EventoType, InscritoType } from "@/types"

export const dynamic = 'auto'
export const revalidate = 0

type Props = {
  params: {
    eventoId: string
  }
}

const headers = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expira': '0'
}

export default async function EventoPage({ params }: Props) {
  const celulasResponse = await fetch(`${process.env.DOMAIN_URL}/api/celulas`)
  const { celulas } = await celulasResponse.json() as { celulas: CelulaType[] }

  const eventoResponse = await fetch(`${process.env.DOMAIN_URL}/api/eventos/${params.eventoId}`)
  const { evento } = await eventoResponse.json() as { evento: EventoType }

  const eventoInscricoesResponse = await fetch(`${process.env.DOMAIN_URL}/api/eventos/${params.eventoId}/inscricoes`, { headers })
  const { inscricoes } = await eventoInscricoesResponse.json() as { inscricoes: InscritoType[] }

  return <div className="flex flex-col lg:flex-row  justify-center gap-4 w-full">
    <div className="flex flex-col gap-4">
      <CardTableInscricoes celulas={celulas} evento={evento} inscricoes={inscricoes.filter(i => !i.desativado)} />
      <CardTableInscricoesMeta celulas={celulas} evento={evento} inscricoes={inscricoes.filter(i => !i.desativado)} />
    </div>
    <div className="flex flex-col sm:flex-row lg:flex-col gap-4 w-full md:max-w-[200px] lg:max-w-md">
      <PagamentoParcelasCard inscricoes={inscricoes.filter(i => !i.desativado)} />
      <ValoresInscricoesDiaCard inscricoes={inscricoes} />
      <ValoresTotaisCard inscricoes={inscricoes} />
    </div>
  </div>
}
