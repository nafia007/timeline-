
-- Allow admins to update any film
CREATE POLICY "Admins can update any film"
ON public.films
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete any film
CREATE POLICY "Admins can delete any film"
ON public.films
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete any profile
CREATE POLICY "Admins can delete any profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
