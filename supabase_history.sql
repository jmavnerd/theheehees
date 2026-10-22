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
