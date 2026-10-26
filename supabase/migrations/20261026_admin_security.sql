-- ==============================================================================
-- CarMilan Security Migration: Secure Administrator Authorization & RLS Hardening
-- ==============================================================================

-- 1. Helper function to check if the current user has the 'admin' role
-- Using SECURITY DEFINER so that it can inspect user_roles safely without recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_role app_role;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT role INTO v_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;

  RETURN (v_role = 'admin'::app_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Prevent users from creating or updating their own roles to 'admin'
CREATE OR REPLACE FUNCTION public.prevent_self_admin_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If new role is 'admin', verify that caller is already a verified admin
  IF NEW.role = 'admin'::app_role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Access denied. You cannot assign administrator privileges.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_self_admin_escalation ON public.user_roles;
CREATE TRIGGER trg_prevent_self_admin_escalation
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_self_admin_escalation();

-- 3. Hardened RLS for user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
CREATE POLICY "Only admins can update roles" ON public.user_roles
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. Hardened RLS for audit_logs (Strictly Admin-only)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- 5. Hardened RLS for dealership_verifications
ALTER TABLE public.dealership_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dealerships view own verifications, Admins view all" ON public.dealership_verifications;
CREATE POLICY "Dealerships view own verifications, Admins view all" ON public.dealership_verifications
  FOR SELECT USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.dealerships d
      WHERE d.id = dealership_id AND d.dealer_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Only admins can approve or reject verifications" ON public.dealership_verifications;
CREATE POLICY "Only admins can approve or reject verifications" ON public.dealership_verifications
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
