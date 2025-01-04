import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EventoType } from "@/types"
import Link from "next/link"

export default async function EventosPage() {
  const eventosResponse = await fetch(`${process.env.DOMAIN_URL}/api/eventos`)
  const { eventos } = await eventosResponse.json() as { eventos: EventoType[] }

  return <Card>
    <CardHeader>
      <CardTitle className="mb-2">Selecione um evento para começar</CardTitle>
      {
        eventos.map(e => <Link key={e.id} href={`/eventos/${e.id}`} className="text-gray-600 ">{e.titulo}</Link>)
      }
    </CardHeader>
  </Card>
}