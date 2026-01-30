import { NextResponse } from "next/server";
import { getProductBySlug } from "@/db/queries";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const data = await getProductBySlug(params.slug);
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}
