import { StepProps } from "@/app/page"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { EventoPagamentosType, InscritoType, Steps } from "@/types"
import { Check, Circle, Dot } from "lucide-react"
import { useState } from "react"
import { Checkbox } from "../ui/checkbox"

export default function Parcelas({ setStep, inscrito, setInscrito, evento }: StepProps) {
    const [parcelasSelecionadas, setParcelasSelecionadas] = useState<EventoPagamentosType[]>(inscrito?.pagamentosAFazer || [])

    async function onSubmit() {
        if (!parcelasSelecionadas.length) {
            alert("Selecione pelo menos uma parcela")
            return;
        }

        const payload: InscritoType = {
            ...inscrito!,
            pagamentosAFazer: parcelasSelecionadas
        }

        setInscrito(payload)
        setStep(Steps.PAGAMENTO)
    }

    function selecionarParcela(pagamento: EventoPagamentosType) {
        setParcelasSelecionadas(o => {
            if (o.some(s => s.parcela == pagamento.parcela)) {
                return o.filter(f => f.parcela != pagamento.parcela)
            } else {
                return o.concat(pagamento)
            }
        })
    }

    const parcelasPagas = Object.values(inscrito?.pagamentos || [])
        .reduce<number[]>((a, p) => {
            return ["CONCLUIDA", "paid"].includes(p.status!)
                ? a.concat(p.parcelas.map(m => m.parcela))
                : a
        }, [])

    return <Card className="w-full max-w-sm">
        <CardHeader>
            <CardTitle>Parcelas</CardTitle>
            <CardDescription>Selecione as parcelas que deseja pagar</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
            <div className="grid gap-2 grid-cols-2">
                {evento?.pagamentos.map(pagamento => <label
                    key={pagamento.parcela}
                    htmlFor={`parcela_${pagamento.parcela}`}
                    className={`cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70 border rounded-sm w-full h-full flex flex-col space-x-2 px-4 py-3 ${parcelasPagas?.includes(pagamento.parcela) ? 'bg-green-200' : parcelasSelecionadas?.some(s => s.parcela == pagamento.parcela) ? 'bg-blue-200' : ''}`}>
                    <Checkbox
                        id={`parcela_${pagamento.parcela}`}
                        className="hidden"
                        disabled={parcelasPagas?.includes(pagamento.parcela)}
                        onClick={() => selecionarParcela(pagamento)} />
                    <h1 className="text-left text-lg font-semibold">{pagamento.parcela}ª parcela</h1>
                    <ul className="text-left text-xs font-light">
                        <li><b>Pix:</b> {pagamento.valores['pix'].toLocaleString('pt-BR', { currency: "BRL", style: "currency" })}</li>
                        <li><b>Crédito:</b> {pagamento.valores['credit_card'].toLocaleString('pt-BR', { currency: "BRL", style: "currency" })}</li>
                    </ul>
                </label>)
                }
            </div>
            <div className="flex flex-row space-x-4 text-sm">
                <div className="flex flex-row items-center">
                    <Dot className="size-10 text-green-400" />
                    Pago
                </div>
                <div className="flex flex-row items-center">
                    <Dot className="size-10 text-blue-400" />
                    Selecionado
                </div>
                <div className="flex flex-row items-center">
                    <Circle className="size-2 mr-4" />
                    À pagar
                </div>
            </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
            <Button
                icon={<Check className="size-4 mr-2" />}
                onClick={onSubmit}
                className="w-full bg-[#feef00] hover:bg-[#fdaf00] text-black">
                Avançar
            </Button>
            <a href="#" className="text-sm" onClick={() => setStep(s => --s)}>
                Voltar
            </a>
        </CardFooter>
    </Card>
}