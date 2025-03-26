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

export default function InscricoesFinalizadas({ inscrito, reset }: StepProps) {
    return <Card className="w-full max-w-sm">
        <CardHeader>
            <div className="flex flex-row space-x-4">
                <CheckCircle size={42} className="text-green-600" />
                <div className="flex-1">
                    <CardTitle>Inscrição Confirmada</CardTitle>
                    <CardDescription>Parabens!</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4 text-justify">
            <p>Olá {inscrito?.nome?.split(' ').shift()}, a cada dia que passa estamos mais ansiosos para viver tudo o que Deus tem preparado para o <b>Retiro Convergir 2025</b>.</p>
            <p>Fique atento(a) às próximas atualizações e, se precisar de alguma informação, fale com sua liderança.</p>
        </CardContent>
    </Card>
}