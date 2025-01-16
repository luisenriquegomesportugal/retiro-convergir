import { EventoType, InscritoType } from "@/types"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPagamentoInscrito(inscrito: InscritoType) {
  return getPagamentosInscrito(inscrito)?.pop()
}

export function getPagamentosInscrito(inscrito: InscritoType) {
  if (!inscrito.pagamentos) {
    return []
  }

  return Object.values(inscrito.pagamentos)
    .sort((a, b) => Date.parse(a.criadoEm!) - Date.parse(b.criadoEm!))
}