import { NextResponse } from "next/server" 
import { prisma } from "@/lib/db"
import { hash } from "bcryptjs"
import { z } from "zod"

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  companyName: z.string().min(2),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, companyName } = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return new Response(JSON.stringify({ error: "User already exists" }), { status: 400 })
    }

    const passwordHash = await hash(password, 10)

    // Create Workspace and User in a transaction
    const user = await prisma.$transaction(async (tx: any) => {
      const workspace = await tx.workspace.create({
        data: {
          name: companyName,
        }
      })

      const newUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "ADMIN", // First user gets ADMIN role
          workspaceId: workspace.id
        }
      })

      return newUser
    })

    return new Response(JSON.stringify({ message: "User created successfully", userId: user.id }), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.issues }), { status: 400 })
    }
    console.error(error)
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 })
  }
}
