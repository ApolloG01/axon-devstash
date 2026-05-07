import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getItemById } from "@/lib/db/items"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const item = await getItemById(session.user.id, id)
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (!item.fileUrl) return NextResponse.json({ error: "No file" }, { status: 404 })

  const upstream = await fetch(item.fileUrl)
  if (!upstream.ok) {
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 502 })
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream"
  const fileName = item.fileName ?? "download"
  const headers = new Headers()
  headers.set("content-type", contentType)
  headers.set("content-disposition", `attachment; filename="${encodeURIComponent(fileName)}"`)

  return new NextResponse(upstream.body, { headers })
}
