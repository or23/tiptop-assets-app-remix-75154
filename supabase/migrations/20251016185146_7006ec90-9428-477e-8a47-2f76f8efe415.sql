-- Add admin roles for specified users
INSERT INTO public.user_roles (user_id, role)
SELECT 
  id,
  'admin'::app_role
FROM auth.users
WHERE email IN ('clay@thevisualbrand.com', 'stella@thevisualbrand.com')
ON CONFLICT (user_id, role) DO NOTHING;