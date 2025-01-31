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
import { Check, Circle, Dot, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Checkbox } from "../ui/checkbox"

export default function Parcelas({ setStep, inscrito, setInscrito, evento }: StepProps) {
    const [loading, setLoading] = useState(true)
    const [parcelas, setParcelas] = useState<EventoPagamentosType[]>([])
    const [parcelasSelecionadas, setParcelasSelecionadas] = useState<EventoPagamentosType[]>(inscrito?.pagamentosAFazer || [])

    let currencyFormat = new Intl.NumberFormat('pt-BR', { currency: "BRL", style: "currency" })

    useEffect(() => {
        (async function () {
            const parcelasRequest = await fetch(`/api/eventos/${evento?.id}/inscricoes/${inscrito?.cpf}/pagamento`)
            const parcelas = await parcelasRequest.json() as { parcelas: EventoPagamentosType[] }
            setParcelas(parcelas.parcelas)
            setLoading(false)
        })()
    }, [])

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

    // const parcelasPagas = Object.values(inscrito?.pagamentos || [])
    //     .reduce<number[]>((a, p) => {
    //         return ["CONCLUIDA", "paid"].includes(p.status!)
    //             ? a.concat(p.parcelas.map(m => m.parcela))
    //             : a
    //     }, [])

    const parcelasAtivas: number[] = []
    // const parcelasAtivas = Object.values(inscrito?.pagamentos || [])
    //     .reduce<number[]>((a, p) => {
    //         return ["ATIVA", "link"].includes(p.status!)
    //             ? a.concat(p.parcelas.map(m => m.parcela))
    //             : a
    //     }, [])

    return <Card className="w-full max-w-sm">
        <CardHeader>
            <CardTitle>Parcelas</CardTitle>
            <CardDescription>Selecione as parcelas que deseja pagar</CardDescription>
        </CardHeader>
        {
            loading
                ? <CardContent className="flex justify-center items-center">
                    <Loader2 className="animate-spin size-10" />
                </CardContent>
                : <>
                    <CardContent className="flex flex-col space-y-4">
                        <div className="grid gap-2 grid-cols-2">
                            {parcelas.map(pagamento => <label
                                key={pagamento.parcela}
                                htmlFor={`parcela_${pagamento.parcela}`}
                                className={`${!pagamento.paga && 'cursor-pointer'} peer-disabled:cursor-not-allowed peer-disabled:opacity-70 border rounded-sm w-full h-full flex flex-col space-x-2 px-4 py-3 ${pagamento.paga ? 'bg-green-200' : parcelasSelecionadas?.some(s => s.parcela == pagamento.parcela) ? 'bg-blue-200' : parcelasAtivas?.includes(pagamento.parcela) ? 'bg-yellow-200' : ''}`}>
                                <Checkbox
                                    id={`parcela_${pagamento.parcela}`}
                                    className="hidden"
                                    disabled={pagamento.paga}
                                    onClick={() => selecionarParcela(pagamento)} />
                                <h1 className="text-left text-lg font-semibold">{pagamento.parcela}ª parcela</h1>
                                {
                                    pagamento.paga
                                        ? <span className="text-xs font-light">Paga</span>
                                        : <ul className="text-left text-xs font-light">
                                            {evento?.tiposPagamentos.includes("pix") && <li><b>Pix:</b> {pagamento.valores['pix'].toLocaleString('pt-BR', { currency: "BRL", style: "currency" })}</li>}
                                            {evento?.tiposPagamentos.includes("credit_card") && <li><b>Crédito:</b> {pagamento.valores['credit_card'].toLocaleString('pt-BR', { currency: "BRL", style: "currency" })}</li>}
                                            {evento?.tiposPagamentos.includes("money") && <li><b>Dinheiro:</b> {pagamento.valores['money'].toLocaleString('pt-BR', { currency: "BRL", style: "currency" })}</li>}
                                        </ul>
                                }
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
                                <Dot className="size-10 text-yellow-400" />
                                À pagar
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            icon={<Check className="size-4 mr-2" />}
                            onClick={onSubmit}
                            className="w-full bg-[#fdaf00] hover:bg-[#feef00] text-black">
                            Avançar
                        </Button>
                        <a href="#" className="text-sm" onClick={() => setStep(s => --s)}>
                            Voltar
                        </a>
                    </CardFooter>
                </>
        }
    </Card>
}