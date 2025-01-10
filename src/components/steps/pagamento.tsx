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
import { Check } from "lucide-react"
import { useState } from "react"
import { PagamentoModal } from "../modal"
import { Steps } from "@/types"

export default function Pagamentos({ setStep, inscrito, reset }: StepProps) {
    const [checkout, setCheckout] = useState<string>()
    const [loading, setLoading] = useState(false)
    const [meioPagamento, setMeioPagamento] = useState<"money">("money")

    async function onSubmit() {
        setLoading(true)

        try {
            const response = await fetch(`/api/eventos/retiroconvergir2025/inscricoes/${inscrito?.cpf}/pagamento/${meioPagamento}`, {
                method: 'POST',
                body: JSON.stringify(inscrito?.pagamentosAFazer)
            })
            const data = await response.json() as {
                message?: string
                checkout?: string
                txid?: string
            }

            if (!response.ok) {
                alert(data.message)
                return false
            }

            setCheckout(undefined)
            setStep(Steps.FINALIZACAO)
            return true
        } catch (e: any) {
            alert("Falha ao gerar o pagamento, avise sua liderança e tente mais tarde.")
            return false
        } finally {
            setLoading(false)
        }
    }

    const pagamentoTotaisMoney = inscrito?.pagamentosAFazer?.reduce((a, p) => a + p.valores['money'], 0)

    return <>
        <PagamentoModal url={checkout} />
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Pagamento</CardTitle>
                <CardDescription>Selecione a forma de pagamento que deseja utilizar</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
                <div className="grid gap-2 grid-cols-1">
                    <Button
                        variant={"ghost"}
                        onClick={() => setMeioPagamento("money")}
                        className={`border w-full h-full flex flex-col justify-start items-start px-4 py-2 space-y-2 ${meioPagamento === "money" ? 'bg-muted' : ''}`}>
                        <h1 className="text-left text-lg font-semibold">Pix</h1>
                        <ul className="text-left text-xs font-light">
                            <li><b>Total:</b> {pagamentoTotaisMoney?.toLocaleString('pt-BR', { currency: "BRL", style: "currency" })}</li>
                        </ul>
                    </Button>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button
                    disabled={loading}
                    icon={<Check className="size-4 mr-2" />}
                    onClick={onSubmit}
                    className="w-full bg-[#fdaf00] hover:bg-[#feef00] text-black">
                    Pagar
                </Button>
                <a href="#" className="text-sm" onClick={() => setStep(s => --s)}>
                    Voltar
                </a>
            </CardFooter>
        </Card>
    </>
}