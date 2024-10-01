import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

export default function Fechada() {
    return <Card className="w-full max-w-sm">
        <CardHeader>
            <CardTitle className="text-2xl">Retiro Convergir 2025</CardTitle>
            <CardDescription className="text-justify">
                Isto é, de fazer convergir em Cristo todas as coisas nos céus e na terra, na administração da plenitude dos tempos. Efésios 1:10
            </CardDescription>
        </CardHeader>
        <CardContent>
            Inscrições fechadas
        </CardContent>
    </Card>
}