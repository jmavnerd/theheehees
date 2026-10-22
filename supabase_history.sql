-- Run once in the Supabase dashboard -> SQL Editor.
-- Keeps every previous version of the state row, so an accidental or malicious
-- overwrite can be rolled back: select state from hee_hees_state_history
--   where id = 'hh12' order by saved_at desc limit 5;
create table if not exists hee_hees_state_history (
  n bigserial primary key,
  id text not null,
  state jsonb not null,
  saved_at timestamptz not null default now()
);

create or replace function hee_hees_keep_history() returns trigger as $$
begin
  insert into hee_hees_state_history (id, state) values (old.id, old.state);
  -- keep the most recent 500 versions per row
  delete from hee_hees_state_history
   where id = old.id
     and n <= (select max(n) - 500 from hee_hees_state_history where id = old.id);
  return new;
end $$ language plpgsql security definer;

drop trigger if exists hee_hees_history on hee_hees_state;
create trigger hee_hees_history before update on hee_hees_state
  for each row execute function hee_hees_keep_history();

-- The history table must NOT be reachable with the public (anon) key:
alter table hee_hees_state_history enable row level security;  -- no policies = no anon access
-- Belt and braces (Supabase stops auto-granting new public tables on Oct 30 2026,
-- but until then it still does): make sure the public key can never touch history.
revoke all on hee_hees_state_history from anon, authenticated;
revoke all on sequence hee_hees_state_history_n_seq from anon, authenticated;

-- NOTE: only if hee_hees_state is ever recreated (new project / db reset), re-grant
-- the app's access, since new tables no longer get it automatically:
--   grant select, insert, update on public.hee_hees_state to anon;
