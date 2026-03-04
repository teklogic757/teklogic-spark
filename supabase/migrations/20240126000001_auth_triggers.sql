-- Trigger to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  org_id uuid;
  role_input text;
begin
  -- Get org_id from metadata (passed during signup)
  org_id := (new.raw_user_meta_data->>'organization_id')::uuid;
  
  -- Check for role in metadata (if master admin creates user manually via API, though invite flow handles it differently)
  -- Default to 'user'
  role_input := coalesce(new.raw_user_meta_data->>'role', 'user');

  if org_id is not null then
    -- Insert into public.users
    insert into public.users (id, organization_id, email, full_name, role)
    values (
      new.id,
      org_id,
      new.email,
      new.raw_user_meta_data->>'full_name',
      role_input
    );
  end if;
  return new;
end;
$$;

-- Trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
