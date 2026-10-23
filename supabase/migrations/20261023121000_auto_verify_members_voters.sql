-- Auto-verify voters created from approved member records
create or replace function ensure_voter_profile()
returns voters
language plpgsql
security definer
set search_path = public
as $$
declare
  m members%rowtype;
  a membership_applications%rowtype;
  v voters%rowtype;
  mt text;
  mno text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into m from members where user_id = auth.uid() limit 1;
  if found then
    mt := m.membership_type;
    mno := m.membership_number;
    insert into voters (id, full_name, email, member_type, member_no, is_verified)
    values (auth.uid(), m.full_name, m.email, mt, mno, true)
    on conflict (id) do update set
      full_name = excluded.full_name,
      email = excluded.email,
      member_type = excluded.member_type,
      member_no = coalesce(excluded.member_no, voters.member_no),
      is_verified = true
    returning * into v;
    return v;
  end if;

  select * into a from membership_applications where user_id = auth.uid() and status = 'approved' limit 1;
  if found then
    mt := a.membership_type;
    mno := a.membership_number;
    insert into voters (id, full_name, email, member_type, member_no, is_verified)
    values (auth.uid(), a.full_name, a.email, mt, mno, true)
    on conflict (id) do update set
      full_name = excluded.full_name,
      email = excluded.email,
      member_type = excluded.member_type,
      member_no = coalesce(excluded.member_no, voters.member_no),
      is_verified = true
    returning * into v;
    return v;
  end if;

  raise exception 'no approved membership found for this account';
end;
$$;
