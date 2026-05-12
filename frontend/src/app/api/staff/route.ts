import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    if (!url || !anon) {
      return NextResponse.json({ error: "Configuration Supabase incomplète" }, { status: 503 });
    }

    if (!service) {
      return NextResponse.json(
        {
          error:
            "SUPABASE_SERVICE_ROLE_KEY est requis pour créer des comptes personnel (à ajouter dans .env.local côté serveur, ne jamais exposer au client).",
        },
        { status: 503 }
      );
    }

    const userClient = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: "Session invalide" }, { status: 401 });
    }

    const { data: adminProfile } = await userClient
      .from("profiles")
      .select("hospital_id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (!adminProfile?.hospital_id || !ADMIN_ROLES.has(adminProfile.role as string)) {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }

    const body = await request.json();
    const {
      email,
      password,
      first_name,
      last_name,
      role,
      specialization,
      phone,
    } = body as Record<string, string>;

    if (!email?.trim() || !password || !first_name?.trim() || !last_name?.trim()) {
      return NextResponse.json(
        { error: "Email, mot de passe, prénom et nom sont obligatoires." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
    }

    const admin = createClient(url, service, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
    });

    if (createErr || !created.user) {
      return NextResponse.json(
        { error: createErr?.message || "Impossible de créer l'utilisateur (email déjà utilisé ?)" },
        { status: 400 }
      );
    }

    const { error: insErr } = await admin.from("profiles").insert({
      id: created.user.id,
      hospital_id: adminProfile.hospital_id,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      role: role || "DOCTOR",
      specialization: specialization?.trim() || null,
      phone: phone?.trim() || null,
      email: email.trim().toLowerCase(),
    });

    if (insErr) {
      await admin.auth.admin.deleteUser(created.user.id);
      return NextResponse.json({ error: insErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, userId: created.user.id });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
