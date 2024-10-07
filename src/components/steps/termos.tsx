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
import { InscritoType, Steps } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Checkbox } from "../ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form"

const FormSchema = z
    .object({
        termo_1: z.boolean({ required_error: "Termo é obrigatório" }),
        termo_2: z.boolean({ required_error: "Termo é obrigatório" }),
        termo_3: z.boolean({ required_error: "Termo é obrigatório" })
    })

export default function Termos({ setStep, inscrito, setInscrito, reset }: StepProps) {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            termo_1: undefined,
            termo_2: undefined,
            termo_3: undefined
        }
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        const payload: InscritoType = {
            ...inscrito!,
            termos: true
        }

        setInscrito(payload)
        setStep(Steps.PARCELAS)
    }

    return <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Termos</CardTitle>
                    <CardDescription>
                        Leia e marque os termos abaixo para continuar.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <FormField
                        control={form.control}
                        name="termo_1"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-y-0 space-x-2">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />

                                </FormControl>
                                <FormLabel className="leading-5 text-justify">
                                    Estou ciente que os dados informados estão corretos e atualizados
                                </FormLabel>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="termo_2"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-y-0 space-x-2">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />

                                </FormControl>
                                <FormLabel className="leading-5 text-justify">
                                    Uma vez que a inscrição está vinculada ao CPF do adquirente, não há qualquer hipótese de transferência para outrem
                                </FormLabel>
                            </FormItem>

                        )}
                    />
                    <FormField
                        control={form.control}
                        name="termo_3"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-y-0 space-x-2">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />

                                </FormControl>
                                <FormLabel className="leading-5 text-justify">
                                    Por não estarmos diante de relação de consumo, a organizadora do retiro não tem quaisquer obrigações legais de restituir o valor da inscrição, ainda que se esteja diante de situação de caso fortuito ou de força maior
                                </FormLabel>
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button
                        icon={<Check className="size-4 mr-2" />}
                        type="submit"
                        className="w-full bg-[#fdaf00] hover:bg-[#feef00] text-black">
                        Avançar
                    </Button>
                    <a href="#" className="text-sm" onClick={() => inscrito?.novo ? setStep(s => --s) : reset()}>
                        Voltar
                    </a>
                </CardFooter>
            </Card>
        </form>
    </Form>
}