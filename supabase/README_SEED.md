# VitaCare Data Seeding Instructions

To resolve the "Invalid login credentials" error, you must populate your Supabase project with the demo accounts.

## Prerequisites

1.  **Supabase Service Role Key**:
    - Go to your [Supabase Dashboard](https://supabase.com/dashboard/projects).
    - Navigate to **Project Settings** > **API**.
    - Copy the `service_role` (secret) key. **Warning: Never share this key.**

## Instructions

Run the following command in your terminal from the project root:

```bash
# Set your service role key (replace with your actual key)
export SUPABASE_SERVICE_ROLE_KEY=your-secret-service-role-key

# Run the seeding script
node supabase/seed.js
```

## Demo Accounts Created

After seeding, you can log in with:

### Doctor Portal
- **Email**: `dr.smith@vitacare.com`
- **License**: `MED-1001`
- **Password**: `testpass123`

### Patient Portal
- **Email**: `patient@test.com`
- **Password**: `testpass123`

---

> [!IMPORTANT]
> If you are running this on a live production environment, ensure you are in the correct project. This script is idempotent and can be run safely multiple times.
