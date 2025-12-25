# Supabase Storage RLS Policy Fix

The error `new row violates row-level security policy` happens because your Supabase Storage bucket (`medical_records`) is secure by default, and Supabase doesn't know about your Firebase logged-in user. It sees you as an "anonymous" visitor.

To fix this, you need to add a policy in Supabase to allow uploads.

## Steps

1.  **Go to Supabase Dashboard**: Open your project at [https://supabase.com/dashboard](https://supabase.com/dashboard).
2.  **Navigate to Storage**: Click on the **Storage** icon in the left sidebar.
3.  **Find your Bucket**: Locate the `medical_records` bucket.
4.  **Configuration / Policies**:
    *   Click on the **Configuration** tab for the bucket.
    *   Look for **Policies** or "Access Policies".
    *   Click **"New Policy"**.
5.  **Create Policy for Uploads (INSERT)**:
    *   Select **"For full customization"**.
    *   **Policy Name**: `Allow public uploads` (or similar).
    *   **Allowed Operation**: Check **INSERT**.
    *   **Target Roles**: Select `anon` (since we are not using Supabase Auth).
    *   **Using expression**: `bucket_id = 'medical_records'`
    *   **With check expression**: `bucket_id = 'medical_records'`
    *   Click **Review** and **Save**.
6.  **Create Policy for Viewing (SELECT)**:
    *   If your bucket is not "Public", you also need a policy to view files.
    *   Create another policy.
    *   **Allowed Operation**: Check **SELECT**.
    *   **Target Roles**: `anon`.
    *   **Using expression**: `bucket_id = 'medical_records'`
    *   Save.

*Note: This allows anyone with your API key (which is public in your app) to upload to this specific bucket. Since you are handling authentication in Firebase, this is the simplest way to bridge the two for now.*
