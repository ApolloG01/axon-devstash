import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { uploadToR2 } from "@/lib/r2"
import { IMAGE_TYPES, FILE_TYPES, IMAGE_MAX, FILE_MAX } from "@/lib/upload-config"
import { randomUUID } from "crypto"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!session.user.isPro) {
    return NextResponse.json(
      { error: "File uploads require a Pro subscription." },
      { status: 403 }
    )
  }

  const formData = await req.formData()
  const file = formData.get("file")
  const kind = formData.get("kind") as string | null // "image" | "file"

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  const mimeType = file.type
  const isImage = IMAGE_TYPES.has(mimeType)
  const isFile = FILE_TYPES.has(mimeType)

  if (!isImage && !isFile) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 422 })
  }

  if (kind === "image" && !isImage) {
    return NextResponse.json({ error: "Not an image file" }, { status: 422 })
  }
  if (kind === "file" && !isFile) {
    return NextResponse.json({ error: "Not an allowed file type" }, { status: 422 })
  }

  const maxBytes = isImage ? IMAGE_MAX : FILE_MAX
  if (file.size > maxBytes) {
    const limit = isImage ? "5 MB" : "10 MB"
    return NextResponse.json({ error: `File exceeds ${limit} limit` }, { status: 422 })
  }

  const ext = file.name.split(".").pop() ?? "bin"
  const key = `${session.user.id}/${randomUUID()}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const url = await uploadToR2(key, buffer, mimeType)

  return NextResponse.json({
    url,
    fileName: file.name,
    fileSize: file.size,
    mimeType,
  })
}
