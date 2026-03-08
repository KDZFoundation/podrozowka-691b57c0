

## Diagnosis: Admin role already exists

The user `dariusz.pgry@gmail.com` (ID: `77ee18b6-a1a2-4e81-b59a-b5adc2a98cf8`) **already has the `admin` role** in the `user_roles` table. No migration is needed.

The code and database are correctly configured:
- Route `/admin` exists in `App.tsx`
- `useAuth` hook fetches role via `maybeSingle()` from `user_roles`
- RLS policies are permissive and allow users to read their own roles
- Dashboard conditionally shows the Admin link when `isAdmin === true`

## Likely cause

The user needs to **log out and log back in** (or hard-refresh the page) so that the `useAuth` hook re-fetches the role from the database. The role was likely added after the user's current session was established, and the `fetchRole` call only runs on auth state change or initial page load.

## No code changes required

The admin role assignment is already done. Ask the user to:
1. Log out from the app
2. Log back in
3. The "Admin" button should appear on the Dashboard, and `/admin` should be accessible

