-- Oakland Community Hub: database changes run manually in the Supabase SQL Editor.
-- Listed in the order they were run. Exact SQL, not reconstructed.

-- 1. Privacy fix (2026-10-30): safe views + own-row rules
--    Views run with owner rights on purpose (NOT security_invoker):
--    they show everyone's posts while never exposing user_id.

drop policy "Anyone can view posts" on public.posts;
create policy "Users can view own posts" on public.posts
  for select using (auth.uid() = user_id);

drop policy "Users can view comments" on public.comments;
create policy "Users can view own comments" on public.comments
  for select using (auth.uid() = user_id);

drop policy "Users can view upvotes" on public.upvotes;
create policy "Users can view own upvotes" on public.upvotes
  for select using (auth.uid() = user_id);

drop policy "Users can view all profiles" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can delete own posts" on public.posts
  for delete using (auth.uid() = user_id);
create policy "Users can delete own comments" on public.comments
  for delete using (auth.uid() = user_id);

-- 2. Time zone fix (2026-11-02): timestamptz columns, views recreated
drop view public.feed_posts;
drop view public.feed_comments;

alter table public.posts   alter column created_at type timestamptz using created_at at time zone 'UTC';
alter table public.comments alter column created_at type timestamptz using created_at at time zone 'UTC';
alter table public.upvotes  alter column created_at type timestamptz using created_at at time zone 'UTC';
alter table public.reports  alter column created_at type timestamptz using created_at at time zone 'UTC';

create view public.feed_posts as
select
  p.id, p.content, p.category, p.created_at, p.is_anonymous,
  case when p.is_anonymous then null else pr.username end as author_name,
  pr.zip_code,
  (select count(*) from public.upvotes u where u.post_id = p.id) as upvote_count,
  exists (select 1 from public.upvotes u
          where u.post_id = p.id and u.user_id = auth.uid()) as i_upvoted,
  (p.user_id = auth.uid()) as is_mine
from public.posts p
join public.profiles pr on pr.id = p.user_id;

create view public.feed_comments as
select
  c.id, c.post_id, c.parent_id, c.content, c.created_at, c.is_anonymous,
  case when c.is_anonymous then null else pr.username end as author_name,
  (c.user_id = auth.uid()) as is_mine
from public.comments c
join public.profiles pr on pr.id = c.user_id;

revoke all on public.feed_posts, public.feed_comments from anon;
grant select on public.feed_posts, public.feed_comments to authenticated;

-- 3. Signup trigger (2026-11-09): no full_name, locked search_path
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, zip_code)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'zip_code'
  );
  return new;
end;
$$;

-- 4. Allow deletes (2026-11-09); RLS still limits each user to their own rows
grant delete on public.posts, public.comments to authenticated;
