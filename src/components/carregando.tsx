import {
    Card
} from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function Carregando() {
    return <Card className="w-full max-w-sm flex items-center justify-center p-10">
        <Loader2 className="size-10 animate-spin" />
    </Card>
}