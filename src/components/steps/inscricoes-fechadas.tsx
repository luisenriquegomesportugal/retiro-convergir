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

export default function InscricoesFechadas({ inscrito, reset }: StepProps) {
    return <Card className="w-full max-w-sm">
        <CardHeader>
            <CardTitle className="text-2xl">Retiro Convergir 2025</CardTitle>
            <CardDescription className="text-justify">
                Isto é, de fazer convergir em Cristo todas as coisas nos céus e na terra, na administração da plenitude dos tempos. Efésios 1:10
            </CardDescription>
        </CardHeader>
        <CardContent>
            Novas inscrições encerradas.
        </CardContent>
    </Card>
}