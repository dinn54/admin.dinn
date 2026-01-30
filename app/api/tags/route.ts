import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  console.log("query type", query ? true : false);

  try {
    let dbQuery = supabase
      .from("dinn_post_tags")
      .select("name, count")
      .order("count", { ascending: false }) // Popularity first
      .limit(10); // Limit results
    if (query) {
      // If search term exists, filter by name
      dbQuery = dbQuery.ilike("name", `%${query}%`);
    }

    const { data, error } = await dbQuery;
    console.log("data", data);
    if (error) {
      console.error("Error fetching tags:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return just the array of tag strings or objects?
    // User requested: "글자 입력시마다 일치하는 태그명이 있으면 가져왔으면 좋겠어"
    // Usually standardized JSON response is better.
    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
