import Link from "next/link"
import { ReactElement } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'auto'
export const revalidate = 0

export default async function LayoutEventosPage({ children }: { children: ReactElement }) {
  return children;
}