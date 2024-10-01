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
import { CheckCircle, Plus } from "lucide-react"

export default function Finalizacao({ inscrito, reset }: StepProps) {
    return <Card className="w-full max-w-sm">
        <CardHeader>
            <div className="flex flex-row space-x-4">
                <CheckCircle size={42} className="text-green-600" />
                <div className="flex-1">
                    <CardTitle>Pagamento realizado com sucesso</CardTitle>
                    <CardDescription>Parcela(as) paga</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4 text-justify">
            <p>Olá {inscrito?.nome?.split(' ').shift()}, seu pagamento foi processado com sucesso, a cada dia que passa estamos mais ansiosos para viver tudo o que Deus tem preparado para o <b>Retiro Convergir 2025</b>.</p>
            <p>Aguarde o direcionamento da sua liderança para os próximos passos.</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
            <Button
                icon={<Plus className="size-4 mr-2" />}
                onClick={reset}
                className="w-full bg-[#fdaf00] hover:bg-[#feef00] text-black">
                Nova Inscrição
            </Button>
        </CardFooter>
    </Card>
}