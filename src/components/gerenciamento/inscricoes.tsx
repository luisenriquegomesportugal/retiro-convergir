"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn, getPagamentoInscrito, getPagamentosInscrito } from "@/lib/utils"
import { CelulaType, EventoType, InscritoType, Pagamento } from "@/types"
import { Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Copy, DollarSign, MoreVertical, Search, Tag, User, Users } from "lucide-react"
import { parseAsArrayOf, parseAsInteger, parseAsString, queryTypes, SetValues, useQueryState, UseQueryStateReturn, UseQueryStatesReturn } from "nuqs"
import { toast } from "sonner"
import DialogTablePagamentoCamera from "./dialog-camera-pagamento"
import DialogTableCredenciamento from "./dialog-credenciamento"
import DialogPagamentoDinheiro from "./dialog-pagamento-dinheiro"

export const revalidate = 0

type Props = {
  celulas: CelulaType[]
  evento: EventoType
  inscricoes: InscritoType[]
}

const getStatusPagamento = (inscrito: InscritoType) => {
  if (!inscrito.pagamentos) {
    return null
  }

  let pagamentos = getPagamentosInscrito(inscrito)
  if (pagamentos.every(p => !["paid", "CONCLUIDA", "ATIVA", "link"].includes(p.status!))) {
    return null
  } else {
    let sorter = new Intl.Collator("pt-BR", { usage: "sort", numeric: true })
    let parcelas: { [parcela: string]: Pagamento } = {}
    pagamentos
      .filter(p => ["paid", "CONCLUIDA", "ATIVA", "link"].includes(p.status!))
      .forEach(p => p.parcelas
        .sort((p1, p2) => sorter.compare(p1.parcela.toString(), p2.parcela.toString()))
        .forEach(pa => parcelas[pa.parcela.toString()] = p))

    return parcelas
  }
}

const parseFiltroTipoPagamento = (inscrito: InscritoType) => {
  if (!inscrito.pagamentos || !Object.values(inscrito.pagamentos).some(pagamento => ["paid", "CONCLUIDA"].includes(pagamento.status!))) {
    return ["Cadastrado"]
  }

  return getPagamentosInscrito(inscrito)
    .filter(pagamento => ["paid", "CONCLUIDA"].includes(pagamento.status!))
    .reduce<string[]>((a, p) => a.concat(p.parcelas.map(pa => `${pa.parcela}ª parcela`)), [])
}

const handleOnFilterClick = (setFn: any, value: string) => {
  setFn((old: string[] | null) => {
    if (!old) {
      old = []
    }

    let nOld = old.includes(value) ? old.filter(o => o != value) : old.concat([value])
    return nOld.length == 0 ? null : nOld
  })
}

export default function CardTableInscricoes({ celulas, evento, inscricoes }: Props) {
  const [page, setPage] = useQueryState("fip", parseAsInteger.withDefault(1))
  const [filterGlobal, setFilterGlobal] = useQueryState("fif")
  const [rede, setRede] = useQueryState("fir", parseAsArrayOf(parseAsString))
  const [celula, setCelula] = useQueryState("fic", parseAsArrayOf(parseAsString))
  const [tipoPagamento, setTipoPagamento] = useQueryState("fipa", parseAsArrayOf(parseAsString))

  let inscricoesFiltradas = inscricoes
  inscricoesFiltradas = inscricoesFiltradas.filter(f => !rede ? true : rede!.includes(f.rede!))
  inscricoesFiltradas = inscricoesFiltradas.filter(f => !celula ? true : celula.includes("Convidado") ? !f.celula : celula!.includes(f.celula!))
  inscricoesFiltradas = inscricoesFiltradas.filter(f => !tipoPagamento ? true : tipoPagamento?.every(item => parseFiltroTipoPagamento(f).includes(item)))
  inscricoesFiltradas = inscricoesFiltradas.filter(f => {
    if (!filterGlobal) {
      return true
    }

    return [
      f.rede,
      f.celula?.normalize('NFD').replace(/[\u0300-\u036f]/g, ""),
      f.nome?.normalize('NFD').replace(/[\u0300-\u036f]/g, ""),
      f.cpf
    ]
      .some(v => v?.toLowerCase().includes(filterGlobal.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase()))
  })

  const sorter = new Intl.Collator('pt-BR', { usage: "sort", numeric: true })
  inscricoesFiltradas.sort((a, b) => sorter.compare(`${a.rede}-${a.celula}-${a.nome}`, `${b.rede}-${b.celula}-${b.nome}`))

  let pagesLength = inscricoesFiltradas.length ? Math.ceil(inscricoesFiltradas.length / 10) : 0

  let redes = celulas.map(c => c.rede)
    .filter((v, i, a) => a.lastIndexOf(v) === i)
    .sort((a, b) => new Intl.Collator("pt-BR", { numeric: true }).compare(a, b))

  return <div className="grid gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Inscrições</CardTitle>
        <CardDescription>
          {inscricoesFiltradas.length} inscrições cadastradas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row mb-2 gap-2">
          <div className="relative flex-1 grow-1">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Procurar por..."
              className="w-full rounded-lg bg-background pl-8"
              value={filterGlobal || ""}
              onChange={e => {
                setFilterGlobal(e.target.value || null)
                setPage(1)
              }}
            />
          </div>
          <div className="flex mb-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-1 text-sm relative"
                >
                  <Users className="h-3.5 w-3.5" />
                  <span className="hidden xl:block w-full max-w-[150px] truncate">{
                    !rede?.length
                      ? "Todas as redes"
                      : rede.join(', ')
                  }</span>
                  {rede?.length && <span className="absolute bg-red-500 rounded-full size-[8px] top-[10px] right-[10px] md:hidden" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Pesquisar..." />
                  <CommandList>
                    <CommandEmpty>Nenhuma rede encontrada.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        setRede(null)
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            !rede?.length ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Todas as Redes
                      </CommandItem>
                      {
                        redes.map(r => <CommandItem className="cursor-pointer" key={r} onSelect={() => {
                          handleOnFilterClick(setRede, r)
                          setPage(1)
                        }}>
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              rede?.includes(r) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {r}
                        </CommandItem>)
                      }
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-1 text-sm relative"
                >
                  <User className="h-3.5 w-3.5" />
                  <span className="hidden xl:block w-full max-w-[150px] truncate">{
                    !celula?.length
                      ? "Todas as celulas"
                      : celula.join(', ')
                  }</span>
                  {celula?.length && <span className="absolute bg-red-500 rounded-full size-[8px] top-[10px] right-[10px] md:hidden" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Pesquisar..." />
                  <CommandList>
                    <CommandEmpty>Nenhuma celula encontrada.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        setCelula(null)
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            !celula ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Todas as células
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        handleOnFilterClick(setCelula, "Convidado")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            celula?.includes("Convidado") ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Convidado
                      </CommandItem>
                      {
                        (
                          !rede?.length
                            ? celulas
                            : celulas.filter(f => rede?.includes(f.rede))
                        ).map(s => <CommandItem className="cursor-pointer" key={s.celula} onSelect={() => {
                          handleOnFilterClick(setCelula, s.celula)
                          setPage(1)
                        }}>
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              celula?.includes(s.celula) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {s.celula}
                        </CommandItem>)
                      }
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {/* <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-1 text-sm relative"
                >
                  <Tag className="h-3.5 w-3.5" />
                  <span className="hidden xl:block w-full max-w-[150px] truncate">{
                    !situacao?.length
                      ? "Todas as situações"
                      : situacao?.join(', ')
                  }</span>
                  {situacao?.length && <span className="absolute bg-red-500 rounded-full size-[8px] top-[10px] right-[10px] md:hidden" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        setSituacao(null)
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            !situacao?.length ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Todas as situações
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        handleOnFilterClick(setSituacao, "Credenciado")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            situacao?.includes("Credenciado") ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Credenciado
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        handleOnFilterClick(setSituacao, "Pago")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            situacao?.includes("Pago") ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Pago
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        handleOnFilterClick(setSituacao, "Não pago")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            situacao?.includes("Não pago") ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Não pago
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        handleOnFilterClick(setSituacao, "Aguardando")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            situacao?.includes("Aguardando") ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Aguardando pagamento
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        handleOnFilterClick(setSituacao, "Cadastrado")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            situacao?.includes("Cadastrado") ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Cadastrado
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover> */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-1 text-sm relative"
                >
                  <DollarSign className="h-3.5 w-3.5" />
                  <span className="hidden xl:block w-full max-w-[150px] truncate">{
                    !tipoPagamento?.length
                      ? "Todas as parcelas"
                      : tipoPagamento.join(', ')
                  }</span>
                  {tipoPagamento?.length && <span className="absolute bg-red-500 rounded-full size-[8px] top-[10px] right-[10px] md:hidden" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        setTipoPagamento(null)
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            !tipoPagamento?.length ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Todos os pagamentos
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        handleOnFilterClick(setTipoPagamento, "Cadastrado")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            tipoPagamento?.includes("Cadastrado") ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Cadastrado
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        handleOnFilterClick(setTipoPagamento, "1ª parcela")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            tipoPagamento?.includes("1ª parcela") ? "opacity-100" : "opacity-0"
                          )}
                        />
                        1ª parcela
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        handleOnFilterClick(setTipoPagamento, "2ª parcela")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            tipoPagamento?.includes("2ª parcela") ? "opacity-100" : "opacity-0"
                          )}
                        />
                        2ª parcela
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        handleOnFilterClick(setTipoPagamento, "3ª parcela")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            tipoPagamento?.includes("3ª parcela") ? "opacity-100" : "opacity-0"
                          )}
                        />
                        3ª parcela
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        handleOnFilterClick(setTipoPagamento, "4ª parcela")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            tipoPagamento?.includes("4ª parcela") ? "opacity-100" : "opacity-0"
                          )}
                        />
                        4ª parcela
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        handleOnFilterClick(setTipoPagamento, "5ª parcela")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            tipoPagamento?.includes("5ª parcela") ? "opacity-100" : "opacity-0"
                          )}
                        />
                        5ª parcela
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        handleOnFilterClick(setTipoPagamento, "6ª parcela")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            tipoPagamento?.includes("6ª parcela") ? "opacity-100" : "opacity-0"
                          )}
                        />
                        6ª parcela
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        handleOnFilterClick(setTipoPagamento, "7ª parcela")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            tipoPagamento?.includes("7ª parcela") ? "opacity-100" : "opacity-0"
                          )}
                        />
                        7ª parcela
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              className="gap-1 text-sm"
              onClick={async () => {
                let inscricoesText = inscricoesFiltradas
                  .map(v => {
                    let pagamento = "Cadastrado"
                    let pagamentos = getStatusPagamento(v)
                    if (pagamentos != null) {
                      pagamento = Object.entries(pagamentos)
                        .filter(([parcela, pagamento]) => ["paid", "CONCLUIDA"].includes(pagamento.status!))
                        .map(([parcela, pagamento]) => `${parcela}ª`)
                        .join(', ')
                    }

                    return [v.rede, v.celula, v.nome, pagamento, v.telefone].join('\t')
                  })
                await navigator.clipboard.writeText([
                  "Rede\tCélula\tNome\tPagamento\tSituação\tTelefone",
                  ...inscricoesText
                ].join('\n'))
                toast.success("Copiado com sucesso")
              }}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden md:table-cell">
                Rede
              </TableHead>
              <TableHead className="hidden md:table-cell">
                Célula
              </TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">
                CPF
              </TableHead>
              <TableHead>
                Parcelas pagas
              </TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              inscricoesFiltradas
                .slice((page - 1) * 10, page * 10 > inscricoesFiltradas.length ? inscricoesFiltradas.length : page * 10)
                .map((inscrito, i) => <TableRow key={inscrito.cpf} className={i % 2 == 0 ? "bg-accent" : "null"}>
                  <TableCell className="hidden md:table-cell">
                    {inscrito.rede || '-'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {inscrito.celula || 'Convidado'}
                  </TableCell>
                  <TableCell>
                    {inscrito.nome}
                    <div className="text-sm text-muted-foreground md:hidden lg:hidden xl:hidden">
                      {inscrito.celula || 'Convidado'}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell" onDoubleClick={async () => {
                    await navigator.clipboard.writeText(inscrito.cpf)
                    toast.success("Copiado com sucesso")
                  }}>
                    {inscrito.cpf.replace(/\d{3}(\d{3})(\d{2})\d{3}/, '***.$1.$2*-**')}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {
                        getStatusPagamento(inscrito) == null
                          ? <Badge className="bg-gray-500">Cadastrado</Badge>
                          : Object.entries(getStatusPagamento(inscrito)!)
                            .map(([parcela, pagamento], i, a) => <div key={`${inscrito.cpf}-${parcela}`} className={`size-6 flex justify-center items-center rounded-full text-white ${a.length === 7 && a.every(([_, e]) => ["paid", "CONCLUIDA"].includes(e.status!)) ? 'bg-green-500' : ["paid", "CONCLUIDA"].includes(pagamento.status!) ? 'bg-indigo-500' : "bg-yellow-500"}`}>{parcela}ª</div>)
                      }
                    </div>
                  </TableCell>
                  <TableCell className="text-right flex space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        {
                          Object.values(getStatusPagamento(inscrito) || {}).some(pagamento => pagamento.status === "ATIVA" && pagamento.tipo === "money")
                          && <>
                            <DropdownMenuSeparator />
                            <DialogPagamentoDinheiro evento={evento} inscrito={inscrito} />
                          </>
                        }
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href = `tel:+55${inscrito.telefone}`}>
                          Ligar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href = `https://wa.me/55${inscrito.telefone}`}>
                          Mandar mensagem
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href = `mailto:${inscrito.email}`}>
                          Enviar email
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>)
            }
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-4">
        <div className="text-sm text-muted-foreground">
          Mostrando de <span className="font-medium">{((page - 1) * 10) + 1}</span>{' '}
          até{' '}
          <span className="font-medium">{page * 10 > inscricoesFiltradas.length ? inscricoesFiltradas.length : page * 10}</span>{' '}
          de{' '}
          <span className="font-medium">{inscricoesFiltradas.length}</span> linhas
        </div>
        <Pagination className="ml-auto mr-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <Button onClick={() => setPage(1)} size="icon" variant="outline" className="size-8">
                <ChevronsLeft className="h-3.5 w-3.5" />
                <span className="sr-only">Primeiro</span>
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button onClick={() => setPage(page == 1 ? 1 : page - 1)} size="icon" variant="outline" className="size-8">
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="sr-only">Anterior</span>
              </Button>
            </PaginationItem>
            <div className="text-sm text-muted-foreground mx-2 sr-only lg:not-sr-only">
              Página {page} de {pagesLength}
            </div>
            <PaginationItem>
              <Button onClick={() => setPage(page + 1 > pagesLength ? pagesLength : page + 1)} size="icon" variant="outline" className="size-8">
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="sr-only">Próximo</span>
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button onClick={() => setPage(pagesLength)} size="icon" variant="outline" className="size-8">
                <ChevronsRight className="h-3.5 w-3.5" />
                <span className="sr-only">Último</span>
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  </div>
}
