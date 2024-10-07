"use client"

import Carregando from "@/components/carregando"
import Fechada from "@/components/fechada"
import Finalizacao from "@/components/steps/finalizacao"
import Formulario from "@/components/steps/formulario"
import Pagamentos from "@/components/steps/pagamento"
import Parcelas from "@/components/steps/parcelas"
import Termos from "@/components/steps/termos"
import Validacao from "@/components/steps/validacao"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EventoType, InscritoType, Steps } from "@/types"
import { Loader2 } from "lucide-react"
import { Dispatch, SetStateAction, useEffect, useState } from "react"

export type StepProps = {
    step: number
    evento?: EventoType
    inscrito?: InscritoType
    setStep: Dispatch<SetStateAction<number>>
    setInscrito: Dispatch<SetStateAction<InscritoType | undefined>>
    reset: () => void
}

export default function LoginForm() {
    const [loading, setLoading] = useState(true)
    const [evento, setEvento] = useState<EventoType>()
    const [inscrito, setInscrito] = useState<InscritoType>()
    const [step, setStep] = useState<number>(Steps.VALIDACAO)

    useEffect(() => {
        (async () => {
            const response = await fetch(`/api/eventos/retiroconvergir2025`)
            const data = await response.json() as { evento: EventoType }

            setEvento(data.evento)
            setLoading(false)
        })();
    }, [])

    const reset = () => {
        setStep(Steps.VALIDACAO)
        setInscrito(undefined)
    }

    if (loading) {
        return <Carregando />
    }

    if (!evento || !evento.inscricoesAbertas) {
        return <Fechada />
    }

    return (<div className="w-full flex flex-col lg:flex-row items-center justify-around">
        <div className="flex flex-1 items-center justify-center">
            <img src={"/Logo-white.png"} alt="Logo do retiro" className="self-center w-40 md:w-60 lg:w-80 mb-6" />
        </div>
        <div className="flex flex-1 items-center justify-center">
            {
                step === Steps.VALIDACAO && <Validacao evento={evento} step={step} inscrito={inscrito} setStep={setStep} setInscrito={setInscrito} reset={reset} />
                || step === Steps.FORMULARIO && <Formulario evento={evento} step={step} inscrito={inscrito} setStep={setStep} setInscrito={setInscrito} reset={reset} />
                || step === Steps.TERMOS && <Termos evento={evento} step={step} inscrito={inscrito} setStep={setStep} setInscrito={setInscrito} reset={reset} />
                || step === Steps.PARCELAS && <Parcelas evento={evento} step={step} inscrito={inscrito} setStep={setStep} setInscrito={setInscrito} reset={reset} />
                || step === Steps.PAGAMENTO && <Pagamentos evento={evento} step={step} inscrito={inscrito} setStep={setStep} setInscrito={setInscrito} reset={reset} />
                || step === Steps.FINALIZACAO && <Finalizacao evento={evento} step={step} inscrito={inscrito} setStep={setStep} setInscrito={setInscrito} reset={reset} />
            }
        </div>
    </div>
    )
}
