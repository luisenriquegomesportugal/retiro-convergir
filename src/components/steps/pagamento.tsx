import { StepProps, Steps } from "@/app/page"
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

export default function Pagamentos({ setStep, inscrito, reset }: StepProps) {
    const [checkout, setCheckout] = useState<string>()
    const [loading, setLoading] = useState(false)
    const [meioPagamento, setMeioPagamento] = useState<"pix" | "credit_card">("pix")

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

            setCheckout(data.checkout)

            let pagamentoEfetivado = await new Promise<boolean>(async (resolve, reject) => {
                let looping = 1
                while (looping > 0 && looping <= 60) {
                    await new Promise(r => {
                        setTimeout(r, 5000)
                    })

                    try {
                        const responseVP = await fetch(`/api/eventos/retiroconvergir2025/inscricoes/${inscrito?.cpf}/pagamento/${data.txid}/status`, { cache: "no-cache" })
                        if (!responseVP.ok) {
                            throw new Error()
                        }

                        const { status } = await responseVP.json() as { status: string }

                        looping = !['CONCLUIDA', 'paid'].includes(status) ? looping + 1 : 0
                    }
                    catch (e) {
                        looping = -1
                        alert("Falha ao observar o status de pagamento, tente novamente mais tarde.")
                        reject()
                    }
                }

                if (looping === 0) {
                    resolve(true)
                } else {
                    alert("Tempo de aguarde do pagamento ultrapassou 5m, tente verificar o status do pagamento mais tarde.")
                    resolve(false)
                }
            })

            if (pagamentoEfetivado) {
                setCheckout(undefined)
                setStep(Steps.FINALIZACAO)
                return true
            } else {
                setCheckout(undefined)
                reset()
                return false
            }
        } catch (e: any) {
            alert("Falha ao gerar o pagamento, avise sua liderança e tente mais tarde.")
        } finally {
            setLoading(false)
        }
    }

    const pagamentoTotaisPix = inscrito?.pagamentosAFazer?.reduce((a, p) => a + p.valores['pix'], 0)
    const pagamentoTotaisCartao = inscrito?.pagamentosAFazer?.reduce((a, p) => a + p.valores['credit_card'], 0)

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
                        onClick={() => setMeioPagamento("pix")}
                        className={`border w-full h-full flex flex-col justify-start items-start px-4 py-2 space-y-2 ${meioPagamento === "pix" ? 'bg-muted' : ''}`}>
                        <h1 className="text-left text-lg font-semibold">Pix</h1>
                        <ul className="text-left text-xs font-light">
                            <li><b>Total:</b> {pagamentoTotaisPix?.toLocaleString('pt-BR', { currency: "BRL", style: "currency" })}</li>
                        </ul>
                    </Button>
                    <Button
                        variant={"ghost"}
                        onClick={() => setMeioPagamento("credit_card")}
                        className={`border w-full h-full flex flex-col justify-start items-start px-4 py-2 space-y-2 ${meioPagamento === "credit_card" ? 'bg-muted' : ''}`}>
                        <h1 className="text-left text-lg font-semibold">Cartão de crédito</h1>
                        <ul className="text-left text-xs font-light">
                            <li><b>Total:</b> {pagamentoTotaisCartao?.toLocaleString('pt-BR', { currency: "BRL", style: "currency" })}</li>
                        </ul>
                    </Button>

                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button
                    loading={loading}
                    icon={<Check className="size-4 mr-2" />}
                    onClick={onSubmit}
                    className="w-full bg-[#feef00] hover:bg-[#fdaf00] text-black">
                    Pagar
                </Button>
                <a href="#" className="text-sm" onClick={() => setStep(s => --s)}>
                    Voltar
                </a>
            </CardFooter>
        </Card>
    </>
}