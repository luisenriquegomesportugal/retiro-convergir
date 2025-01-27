"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { InscritoType, Pagamento } from "@/types"
import { useEffect } from "react"

type Props = {
    inscricoes: InscritoType[]
}

export function ValoresInscricoesDiaCard({ inscricoes }: Props) {
    let valores: { [data: string]: { data: string } & { [key: string]: string | number } } = {}
    for (let inscrito of inscricoes) {
        let pagamentos = Object.values(inscrito.pagamentos || {})
            .filter(pagamento => ["paid", "CONCLUIDA"].includes(pagamento.status!))

        for (let pagamento of pagamentos) {
            let data = new Date(pagamento.pagoEm!)
            if (/(PM|AM)/.test(pagamento.pagoEm!)) {
                data.setHours(data.getHours() - 3)
            }

            let xAsis = data.toDateString()
            if (valores[xAsis]) {
                valores[xAsis] = {
                    ...valores[xAsis],
                    [pagamento.tipo!]: Number.parseFloat(valores[xAsis][pagamento.tipo!] as string) + Number.parseFloat(pagamento.valor!)
                }
            } else {
                valores[xAsis] = {
                    data: xAsis,
                    [pagamento.tipo!]: Number.parseFloat(pagamento.valor!)
                }
            }
        }
    }

    let pagamentos = Object.values(valores)
        .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
        .map((pagamento, index) => ({ ...pagamento, data: `${new Date(pagamento.data).getDate()}/${new Date(pagamento.data).getMonth() + 1}` }))
        .slice(-5)

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Valores diários</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <ChartContainer config={{}}>
                    <BarChart
                        accessibilityLayer
                        data={pagamentos}
                    >
                        <XAxis
                            dataKey="data"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <Legend
                            verticalAlign="top"
                            height={48}
                            formatter={(value, entry, index) => value === 'money' ? "Dinheiro" : "Cartão de credito"} />
                        <Bar dataKey="credit_card" fill="hsl(var(--chart-1))" radius={2}>
                            <LabelList
                                position="top"
                                offset={12}
                                className="fill-foreground"
                                fontSize={12}
                            />
                        </Bar>
                        <Bar dataKey="money" fill="hsl(var(--chart-2))" radius={2}>
                            <LabelList
                                position="top"
                                offset={12}
                                className="fill-foreground"
                                fontSize={12}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
