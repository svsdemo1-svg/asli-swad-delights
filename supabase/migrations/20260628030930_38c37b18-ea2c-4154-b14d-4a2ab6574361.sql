ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
