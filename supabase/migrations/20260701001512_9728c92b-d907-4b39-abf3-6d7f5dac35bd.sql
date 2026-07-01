
-- Atomic "first authenticated user becomes super_admin" claim
CREATE OR REPLACE FUNCTION public.claim_first_super_admin(_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_count int;
BEGIN
  IF _user_id IS NULL THEN
    RETURN 'unauthorized';
  END IF;
  SELECT count(*) INTO existing_count FROM public.user_roles WHERE role = 'super_admin';
  IF existing_count > 0 THEN
    -- Return whether caller is already a super admin
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin') THEN
      RETURN 'already_super_admin';
    END IF;
    RETURN 'super_admin_exists';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'super_admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN 'claimed';
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_first_super_admin(uuid) TO authenticated;
