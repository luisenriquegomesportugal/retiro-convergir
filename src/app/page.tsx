"use client"

import Finalizacao from "@/components/steps/finalizacao"
import Formulario from "@/components/steps/formulario"
import Pagamentos from "@/components/steps/pagamento"
import Parcelas from "@/components/steps/parcelas"
import Termos from "@/components/steps/termos"
import Validacao from "@/components/steps/validacao"
import { InscritoType, Steps } from "@/types"
import { Dispatch, SetStateAction, useState } from "react"

export type StepProps = {
    step: number
    inscrito: InscritoType | null
    setStep: Dispatch<SetStateAction<number>>
    setInscrito: Dispatch<SetStateAction<InscritoType | null>>
    reset: () => void
}

export default function LoginForm() {
    const [step, setStep] = useState<number>(Steps.VALIDACAO)
    const [inscrito, setInscrito] = useState<InscritoType | null>(null)

    const reset = () => {
        setStep(Steps.VALIDACAO)
        setInscrito(null)
    }

    return (<div className="w-full flex flex-col lg:flex-row items-center justify-around">
        <div className="flex flex-1 items-center justify-center">
            <img src={"/Logo-white.png"} alt="Logo do retiro" className="self-center w-40 md:w-60 lg:w-80 mb-6" />
        </div>
        <div className="flex flex-1 items-center justify-center">
            {
                step === Steps.VALIDACAO && <Validacao step={step} inscrito={inscrito} setStep={setStep} setInscrito={setInscrito} reset={reset} />
                || step === Steps.FORMULARIO && <Formulario step={step} inscrito={inscrito} setStep={setStep} setInscrito={setInscrito} reset={reset} />
                || step === Steps.TERMOS && <Termos step={step} inscrito={inscrito} setStep={setStep} setInscrito={setInscrito} reset={reset} />
                || step === Steps.PARCELAS && <Parcelas step={step} inscrito={inscrito} setStep={setStep} setInscrito={setInscrito} reset={reset} />
                || step === Steps.PAGAMENTO && <Pagamentos step={step} inscrito={inscrito} setStep={setStep} setInscrito={setInscrito} reset={reset} />
                || step === Steps.FINALIZACAO && <Finalizacao step={step} inscrito={inscrito} setStep={setStep} setInscrito={setInscrito} reset={reset} />
            }
        </div>
    </div>
    )
}
