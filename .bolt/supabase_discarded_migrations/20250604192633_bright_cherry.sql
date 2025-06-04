/*
  # Add RLS policies for profiles table

  1. Changes
    - Enable RLS on profiles table
    - Add policies for authenticated users to:
      - Create their own profile
      - Read their own profile
      - Update their own profile

  2. Security
    - Ensures users can only access and modify their own profile data
    - Prevents unauthorized access to other users' profiles
*/

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy for creating own profile
CREATE POLICY "Users can create their own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy for reading own profile
CREATE POLICY "Users can read their own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy for updating own profile
CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);