-- Oakland Community Hub: database changes made outside the app code
--
-- These statements were run manually in the Supabase SQL Editor.
-- They are not applied automatically by anything in this repo.
--
-- NOTE: this file was reconstructed from how the app uses the database,
-- not exported from it. Policy names (other than "Users can view own profile")
-- and exact view definitions may differ from what is live. Check against the
-- dashboard (Database -> Views / Policies / Functions) before re-running.


-- ---------------------------------------------------------------------------
-- 1. Feed views
--
-- The app reads posts and comments only through these views, so the author's
-- user_id is never sent to the browser. author_name is null for anonymous
-- items. is_mine lets the UI show Delete without exposing who posted.
--
-- These views run with the owner's rights (no security_invoker), which is what
-- lets them show everyone's posts while the base tables only allow reading
-- your own rows (see section 2).
--
-- created_at is cast to timestamptz so the browser gets an explicit UTC
-- timestamp and shows the correct local date.
-- ---------------------------------------------------------------------------

create or replace view public.feed_posts as
select
  p.id,
  p.content,
  p.category,
  p.is_anonymous,
  p.created_at::timestamptz as created_at,
  case when p.is_anonymous then null else pr.username end as author_name,
  pr.zip_code,
  (select count(*) from public.upvotes u where u.post_id = p.id) as upvote_count,
  exists (
    select 1 from public.upvotes u
    where u.post_id = p.id and u.user_id = auth.uid()
  ) as i_upvoted,
  (p.user_id = auth.uid()) as is_mine
from public.posts p
left join public.profiles pr on pr.id = p.user_id;

create or replace view public.feed_comments as
select
  c.id,
  c.post_id,
  c.parent_id,
  c.content,
  c.is_anonymous,
  c.created_at::timestamptz as created_at,
  case when c.is_anonymous then null else pr.username end as author_name,
  (c.user_id = auth.uid()) as is_mine
from public.comments c
left join public.profiles pr on pr.id = c.user_id;

grant select on public.feed_posts to authenticated;
grant select on public.feed_comments to authenticated;


-- ---------------------------------------------------------------------------
-- 2. Own-row SELECT policies
--
-- Direct reads of the base tables only return the signed-in user's own rows.
-- Everything else goes through the views above.
-- ---------------------------------------------------------------------------

create policy "Users can view own posts"
  on public.posts for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can view own comments"
  on public.comments for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can view own upvotes"
  on public.upvotes for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);


-- ---------------------------------------------------------------------------
-- 3. Delete own posts and comments
--
-- If RLS blocks a delete, Supabase reports 0 rows deleted, not an error.
-- The app checks the count.
-- ---------------------------------------------------------------------------

create policy "Users can delete own posts"
  on public.posts for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own comments"
  on public.comments for delete
  to authenticated
  using (auth.uid() = user_id);

grant delete on public.posts to authenticated;
grant delete on public.comments to authenticated;


-- ---------------------------------------------------------------------------
-- 4. New-user trigger
--
-- Creates a profiles row from the signup metadata. full_name is no longer
-- collected. search_path is pinned so the security definer function can't be
-- tricked into using objects from another schema.
--
-- The trigger itself (on auth.users, after insert) already existed; only the
-- function was replaced.
-- ---------------------------------------------------------------------------

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
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'zip_code'
  );
  return new;
end;
$$;
