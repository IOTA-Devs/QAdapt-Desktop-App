"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
//ejemplo de un campo status:
//status: "pending" | "processing" | "success" | "failed"
export type Payment = {
  collectionid: number
  name: string
  lastmodified: string
  description: string
}

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "lastmodified",
    header: "Last Modified",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
]
