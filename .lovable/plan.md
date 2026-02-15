

# Grant Admin Role

Insert a row into the `user_roles` table to assign the admin role to your account (eliu.rubio.villegas@gmail.com).

## What will be done

- Run a SQL insert to add a record in the `user_roles` table with your user ID and the `admin` role
- After this, logging in will grant you access to the `/admin` CMS panel

## Technical Details

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('a7c64b9f-1851-4cf9-91f2-7d7646adf0a4', 'admin');
```

No code changes are needed -- this is a data-only operation.

