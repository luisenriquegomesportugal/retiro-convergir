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

export function PagamentoParcelasCard({ inscricoes }: Props) {
    let valores: { [parcela: string]: number } = {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0
    }

    for (let inscrito of inscricoes) {
        let pagamentos = Object.values(inscrito.pagamentos || {})
            .filter(pagamento => ["paid", "CONCLUIDA"].includes(pagamento.status!))

        for (let pagamento of pagamentos) {
            for (let parcela of pagamento.parcelas || []) {
                valores[parcela.parcela] += 1
            }
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Pagamentos por parcela</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <ChartContainer config={{}}>
                    <LineChart width={300} height={100} margin={{ top: 20, left: 20, right: 20 }} data={Object.entries(valores)}>
                        <XAxis dataKey="0" axisLine={false} tickLine={false} tick={<CustomizedAxisTick />} tickMargin={10} />
                        <Line type="monotone" dataKey="1" stroke="#8884d8" strokeWidth={2}>
                            <LabelList
                                position="top"
                                className="fill-foreground"
                                offset={12}
                                fontSize={12}
                            />
                        </Line>
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}


const CustomizedAxisTick = (props: any) => {
    const { x, y, payload } = props;

    return (
        <svg>
            <circle
                cx={x}
                cy={y}
                r={12}
                fill={payload.value === "7" ? "#00c951" : "#615fff"}
            />
            <text
                x={x}
                y={y}
                dy={1}
                dx={1}
                className="!fill-white"
                fontSize={12}
                textAnchor="middle"
                dominantBaseline="middle">
                {payload.value}ª
            </text>
        </svg>
    );
}