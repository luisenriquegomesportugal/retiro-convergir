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
import { Input } from "@/components/ui/input"
import { InscritoType, Steps } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { cpf as cpfValidation } from 'cpf-cnpj-validator'
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form"
import { Check } from "lucide-react"
import { useState } from "react"

const FormSchema = z
    .object({
        cpf: z
            .string({
                required_error: "CPF obrigatório",
                invalid_type_error: "CPF inválido (digite somente os 11 números)"
            })
            .length(11, "CPF inválido (digite somente os 11 números)")
            .refine(data => cpfValidation.isValid(data), "CPF inválido (digite somente os 11 números)"),
    })

export default function Formulario({ setStep, inscrito, setInscrito }: StepProps) {
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: { cpf: "" }
    })

    async function onSubmit({ cpf }: z.infer<typeof FormSchema>) {
        setLoading(true)

        try {
            const response = await fetch(`/api/eventos/retiroconvergir2025/inscricoes/${cpf}`)
            const { inscrito } = await response.json() as { inscrito: InscritoType }

            setLoading(false)

            if (inscrito) {
                setInscrito(inscrito)
                
                if (inscrito.finalizada) {
                    setStep(Steps.FINALIZACAO)
                } else if (inscrito.novo) {
                    setStep(Steps.FORMULARIO)
                } else if (!inscrito.termos) {
                    setStep(Steps.TERMOS)
                } else {
                    setStep(Steps.PARCELAS)
                }
            } else {
                setInscrito({
                    cpf
                })
                setStep(Steps.FORMULARIO)
            }
        }
        catch (e) {
            setLoading(false)

            alert("Falha ao validar o inscrito")
        }
    }

    return <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Formulário</CardTitle>
                    <CardDescription>
                        Digite seu CPF para validar seu cadastro.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <FormField
                        control={form.control}
                        name="cpf"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="CPF" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter>
                    <Button 
                    icon={<Check className="size-4 mr-2" />} 
                    loading={loading} 
                    type="submit" 
                    className="w-full bg-[#fdaf00] hover:bg-[#feef00] text-black">
                        Avançar
                    </Button>
                </CardFooter>
            </Card>
        </form>
    </Form>
}