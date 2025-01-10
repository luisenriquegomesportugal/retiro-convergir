"use client"

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useSWRConfig } from 'swr'

import useSWRMutation from 'swr/mutation'

import { Credenciamento, EventoType, InscritoType, Pagamento } from "@/types";
import { Loader2, Ticket, TicketCheck, TicketPlus, Tickets } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { withMask } from 'use-mask-input';

export const dynamic = 'auto'
export const revalidate = 0

type Props = {
    evento: EventoType
    inscrito: InscritoType
}

export default function DialogPagamentoDinheiro({ evento, inscrito }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false)

    const { trigger, isMutating, error, data } = useSWRMutation(`/api/eventos/${evento.id}/inscricoes/${inscrito.cpf.replaceAll(/[^\d]+/g, "")}/pagamento/confirm_money`,
        (url) => fetch(url, { method: "POST", signal: AbortSignal.timeout(60000) }).then(r => r.json()))

    const enviarDados = async () => {
        try {
            await trigger()

            if (error) {
                throw data.message
            } else {
                setDialogOpen(false)
                alert("Confirmação de pagamento realizada com sucesso")
            }
        } catch (e: any) {
            if (e.name === "TimeoutError") {
                alert("Houve uma grande demora, tente novamente")
            } else {
                alert("Falha ao confirmar o pagamento do inscrito")
            }

            console.error(e)
        }
    }

    const pagamentoTotaisMoney = Object.values(inscrito.pagamentos || {})
        .filter(pagamento => pagamento.tipo === "money" && pagamento.status == "ATIVA")
        .reduce((a, p) => a + Number.parseFloat(p.valor!), 0)

    return <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                Conf. Pag. Dinheiro
            </DropdownMenuItem>
        </DialogTrigger>
        <DialogContent className="w-full max-w-[425px]">
            <DialogHeader className="text-left">
                <DialogTitle>Conf. de Pagagamento em Dinheiro</DialogTitle>
                <DialogDescription>Siga os passos abaixo para concluir o pagamento</DialogDescription>
            </DialogHeader>
            <div className="px-4">
                <ul className="list-decimal font-extralight text-justify">
                    <li>Receba o valor do pagamento: <b>{pagamentoTotaisMoney?.toLocaleString('pt-BR', { currency: "BRL", style: "currency" })}</b></li>
                    <li>Clique em finalizar.</li>
                    <li>Tudo certo.</li>
                </ul>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant={"ghost"}>Cancelar</Button>
                </DialogClose>
                <Button
                    variant={"outline"}
                    disabled={isMutating}
                    className="bg-green-700 text-white"
                    onClick={async () => await enviarDados()}>
                    Finalizar
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}