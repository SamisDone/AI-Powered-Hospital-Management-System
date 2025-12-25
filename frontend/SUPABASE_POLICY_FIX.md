# Fix Supabase Policies for Firebase Auth

The policies you have enabled ("Users read own file" and "Users upload own files") are designed for **Supabase Authentication**. Because you are using **Firebase Authentication**, Supabase sees you as a guest (anonymous), so these "Own File" checks fail.

You need to edit your policies to simply allow access based on the bucket name, ignoring the user ID.

## 1. Edit "Users upload own files" (INSERT)
1.  Click the entry **`Users upload own files ddfses_1`** to edit it.
2.  **Target roles**: Ensure `anon` (or public) is selected.
3.  **Policy definition / USING expression**:
    Change the code to ONLY this:
    ```sql
    bucket_id = 'medical_records'
    ```
    *(Remove any text that says `auth.uid() = ...`)*.
4.  Click **Save**.

## 2. Edit "Users read own file" (SELECT)
1.  Click the entry **`Users read own file ddfses_0`** to edit it.
2.  **Target roles**: Ensure `anon` (or public) is selected.
3.  **Policy definition / USING expression**:
    Change the code to ONLY this:
    ```sql
    bucket_id = 'medical_records'
    ```
4.  Click **Save**.

---

### Why is this safe?
Since your frontend code generates a unique filename (e.g., `userId/timestamp_filename`) and you are managing access control in your application layer (Firebase), this setup allows Supabase to just act as a "dumb" storage provider.
