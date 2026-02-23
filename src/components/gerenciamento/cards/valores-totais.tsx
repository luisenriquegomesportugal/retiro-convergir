"use client"

import { CartesianGrid, Label, Line, LineChart, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    ChartContainer
} from "@/components/ui/chart"
import { InscritoType, Pagamento } from "@/types"

type Props = {
    inscricoes: InscritoType[]
}

export function ValoresTotaisCard({ inscricoes }: Props) {
    let valoresTotais = inscricoes.length * 360
    let valoresPagos = 0
    let chartData: { [data: string]: number } = {}

    inscricoes
        .reduce<Pagamento[]>((acc, i) => acc.concat(Object.values(i.pagamentos || {})), [])
        .filter(f => ["CONCLUIDA", "paid"].includes(f.status!))
        .sort((a, b) => new Date(a.pagoEm!).getTime() - new Date(b.pagoEm!).getTime())
        .forEach(p => {
            valoresPagos += Number.parseFloat(p.valor!)

            let data = new Date(p.pagoEm!)
            chartData[data.toLocaleDateString("pt-BR")] = valoresPagos
        })
    
    const formatCurrency = (value: number) =>
        value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Valores totais</CardTitle>
                <CardDescription>{formatCurrency(valoresPagos)}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                <ChartContainer
                    config={{}}>
                    <LineChart
                        width={500}
                        height={300}
                        data={Object.entries(chartData)}
                        margin={{
                            top: 10,
                            left: 30,
                        }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <XAxis dataKey="0" />
                        <YAxis domain={[0, valoresTotais]} tickFormatter={(value) => formatCurrency(value as number)}  />
                        <ReferenceLine y={valoresTotais} stroke="red" strokeDasharray="5 5" label="Meta" />
                        <Line type="monotone" dataKey="1" stroke="#8884d8" name="Receita (R$)" dot={false} />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
