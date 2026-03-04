-- Create invitations table
create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) not null,
  email text not null,
  token text unique not null,
  role text default 'user',
  status text default 'pending', -- pending, accepted, expired
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone
);

-- Alter organizations table
alter table organizations add column if not exists domain text unique;
alter table organizations add column if not exists industry text;
alter table organizations add column if not exists brand_voice text;
alter table organizations add column if not exists annual_it_budget text; -- Using text for flexibility (ranges) per user request
alter table organizations add column if not exists marketing_strategy text;
alter table organizations add column if not exists estimated_revenue text; -- Using text for flexibility
alter table organizations add column if not exists employee_count text; -- Using text for flexibility
alter table organizations add column if not exists primary_language text default 'en';
alter table organizations add column if not exists brand_colors jsonb;

-- Alter users table
alter table users add column if not exists job_role text;

-- RLS Policies

-- Enable RLS
alter table invitations enable row level security;
alter table organizations enable row level security;
alter table users enable row level security;

-- USERS TABLE policies
-- Read: Users can read themselves and others in their org (for collaboration)
create policy "Users can view members of own org" on users
  for select using (
    auth.uid() = id -- Self
    or 
    organization_id = (select organization_id from users where id = auth.uid()) -- Same Org
    or
    exists (select 1 from users where id = auth.uid() and role = 'super_admin') -- Super Admin
  );

-- Update: Users can update themselves (e.g. profile), Super Admin can update anyone
create policy "Users can update own profile" on users
  for update using (auth.uid() = id);

create policy "Super Admin can update any user" on users
  for update using (exists (select 1 from users where id = auth.uid() and role = 'super_admin'));


-- ORGANIZATIONS TABLE policies
-- Read: Users can view their own org, Super Admin views all
create policy "Users can view own org" on organizations
  for select using (
    id = (select organization_id from users where id = auth.uid())
    or
    exists (select 1 from users where id = auth.uid() and role = 'super_admin')
  );

-- Update: Super Admin only
create policy "Super Admin can update organizations" on organizations
  for update using (exists (select 1 from users where id = auth.uid() and role = 'super_admin'));

-- Insert: Super Admin only
create policy "Super Admin can create organizations" on organizations
  for insert with check (exists (select 1 from users where id = auth.uid() and role = 'super_admin'));


-- INVITATIONS TABLE policies
-- Read: Super Admin only (for listing), + Public lookup by token (security definer function usually better, but select policy works if token is known)
-- Actually, for "join via link", we might fetch the invite by token.
create policy "Super Admin views all invites" on invitations
  for select using (exists (select 1 from users where id = auth.uid() and role = 'super_admin'));

create policy "Public view invite by token" on invitations
  for select using (true); -- CAUTION: This allows listing if you know IDs, but typically we filter by token in query. Better to limit. 
-- Refining "Public view":
-- logic: anyone can select if they know the token? strictly, RLS is row-based.
-- Let's trust the backend to filter by token. The concern is enumeration.
-- Safe approach: `token = current_setting('app.current_invite_token', true)` dynamic policy? Overkill.
-- For now, let's keep it simple: Super Admin sees all. Public needs a stored procedure to "validate" without reading the whole row, OR we rely on the implementation using `service_role` key on the server side to fetch the invite, which is safer.
-- DECISION: Use Service Role for public invite validation. Policy: Super Admin only.

drop policy if exists "Public view invite by token" on invitations;

-- Create/Update/Delete: Super Admin only
create policy "Super Admin manages invites" on invitations
  for all using (exists (select 1 from users where id = auth.uid() and role = 'super_admin'));

-- RPC Function for secure invite lookup
create or replace function get_invite_by_token(token_input text)
returns jsonb
language plpgsql
security definer
as $$
declare
  invite_record record;
  org_name text;
begin
  select i.*, o.name as organization_name 
  into invite_record
  from invitations i
  join organizations o on i.organization_id = o.id
  where i.token = token_input and i.status = 'pending';

  if found then
    return jsonb_build_object(
      'email', invite_record.email,
      'organization_id', invite_record.organization_id,
      'organization_name', invite_record.organization_name
    );
  else
    return null;
  end if;
end;
$$;

create or replace function accept_invite(token_input text, user_id uuid)
returns void
language sql
security definer
as $$
  update invitations 
  set status = 'accepted', created_by = user_id -- re-using created_by temporarily or just update status
  where token = token_input;
$$;
