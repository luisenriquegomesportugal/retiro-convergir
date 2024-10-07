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
import { CelulaType, InscritoType, Steps } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { cpf as cpfValidation } from 'cpf-cnpj-validator'
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form"
import { Check } from "lucide-react"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

const FormSchema = z
    .object({
        cpf: z
            .string({
                required_error: "O Campo CPF é obrigatório",
                invalid_type_error: "CPF inválido (digite somente números)"
            })
            .length(11, "O CPF precisa conter 11 digitos")
            .refine(data => cpfValidation.isValid(data), "CPF inválido (digite somente números)"),
        nome: z
            .string({ required_error: "O Campo Nome é obrigatório" })
            .min(10, { message: "Campo precisa ter no mínimo 10 caracteres" }),
        telefone: z
            .string({ required_error: "O Campo Telefone é obrigatório" })
            .min(10, { message: "Campo precisa ter no mínimo 10 digitos" })
            .max(11, { message: "Campo precisa ter no máximo 11 digitos" }),
        email: z
            .string({
                required_error: "O Campo Email é obrigatório",
            })
            .email("O Campo Email é obrigatório"),
        rede: z
            .string({
                required_error: "O Campo Rede é obrigatório"
            }),
        celula: z
            .string({
                required_error: "O Campo Célula é obrigatório"
            })
    })

export default function Validacao({ setStep, inscrito, setInscrito, reset }: StepProps) {
    const [celulas, setCelulas] = useState<CelulaType[]>()

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            cpf: "",
            celula: "",
            nome: "",
            rede: "",
            email: "",
            telefone: "",
            ...inscrito
        }
    })

    useEffect(() => {
        (async () => {
            const response = await fetch(`/api/celulas`)
            const data = await response.json() as { celulas: CelulaType[] }

            setCelulas(data.celulas)
        })();
    }, [])

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            const payload: InscritoType = {
                ...data,
                inscritoEm: new Date().toString(),
                nome: data.nome.toLowerCase().replace(/(^.|\s+.)/g, m => m.toUpperCase())
            }

            const response = await fetch(`/api/eventos/retiroconvergir2025/inscricoes`, {
                method: 'POST',
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const { message } = await response.json()
                throw message
            }

            setInscrito(payload)
            setStep(Steps.TERMOS)
        } catch (e: any) {
            alert(e)
            console.error(e)
        }
    }

    const sorter = new Intl.Collator('pt-BR', { numeric: true, usage: "sort" });

    const redes = celulas?.map(c => c.rede)
        .filter((r, i, a) => a.indexOf(r) === i)
        .sort((a, b) => sorter.compare(a, b))

    const celulasFiltradas = (
        form.watch("rede")
            ? celulas?.filter(c => c.rede === form.watch("rede"))
            : celulas
    )?.map(c => c.celula)
        .sort((a, b) => sorter.compare(a, b))

    return <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, data => console.log(data))}>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Formulário</CardTitle>
                    <CardDescription>Preencha seus dados para continuar</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
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
                        <FormField
                            control={form.control}
                            name="nome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Digite seu nome completo" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="telefone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Digite seu telefone, DDD + Número" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Digite seu email" type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="rede"
                            render={({ field }) => (
                                <FormItem>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione uma rede" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {redes?.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="celula"
                            render={({ field }) => (
                                <FormItem>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione uma célula" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {celulasFiltradas?.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button
                        disabled={form.formState.isSubmitting}
                        type="submit"
                        icon={<Check className="size-4 mr-2" />}
                        className="w-full bg-[#fdaf00] hover:bg-[#feef00] text-black">
                        Avançar
                    </Button>
                    <a href="#" className="text-sm" onClick={reset}>
                        Voltar
                    </a>
                </CardFooter>
            </Card>
        </form>
    </Form>
}