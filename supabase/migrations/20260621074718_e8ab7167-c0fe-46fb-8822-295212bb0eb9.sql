
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can send a contact message" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can submit a corporate inquiry" ON public.corporate_inquiries;

CREATE POLICY "Public can subscribe with valid email"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND length(email) <= 254
    AND (name IS NULL OR length(name) <= 100)
  );

CREATE POLICY "Public can send contact message"
  ON public.contact_messages FOR INSERT
  WITH CHECK (
    length(name) BETWEEN 1 AND 100
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND length(email) <= 254
    AND length(message) BETWEEN 1 AND 2000
    AND (mobile IS NULL OR length(mobile) <= 20)
  );

CREATE POLICY "Public can submit corporate inquiry"
  ON public.corporate_inquiries FOR INSERT
  WITH CHECK (
    length(name) BETWEEN 1 AND 100
    AND length(company_name) BETWEEN 1 AND 150
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND length(email) <= 254
    AND length(mobile) BETWEEN 4 AND 20
    AND length(requirement) BETWEEN 1 AND 2000
  );
