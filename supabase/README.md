# Base de données AKWABA HEALTH (Supabase)

## Nouveau projet

1. Créez un projet sur [Supabase](https://supabase.com).
2. Dans **SQL Editor**, exécutez le fichier `schema.sql` en une fois (schéma complet + RLS).
3. Dans **Authentication → Providers**, désactivez temporairement « Confirm email » pour tester l’inscription, ou configurez les emails.
4. Copiez l’URL et les clés dans `frontend/.env.local` (voir `frontend/.env.example`).
5. Ajoutez `SUPABASE_SERVICE_ROLE_KEY` dans `frontend/.env.local` pour que **Ajouter un membre** (personnel) fonctionne via `/api/staff`.

## Projet déjà créé avec une ancienne version du schéma

Après sauvegarde, exécutez `migrations/20260512120000_align_existing_database.sql` puis vérifiez les tables manquantes (`suppliers`, colonnes sur `lab_tests`, `invoices`, etc.).
