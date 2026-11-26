<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

<!-- AGENT-MEMORY:BEGIN -->
- UI copy lives in src/i18n (one object per language) — enables EN/ES switching later.
- Public gallery loaders read Cloud taxonomy and normalized artist/piece joins; preserve unseeded, explicitly marked media samples. Taxonomy review remains a sample-only preview without Cloud writes.
- Signup photos persist temporarily in IndexedDB across email/Google returns and move to Cloud storage after registration; no account permissions live in browser storage.
- Gallery buttons use the unstyled design-system variant so existing pill styling remains unchanged.
- Roles are immutable after transactional registration in user_roles; profiles never carry permissions.
- Ticket reservation and check-in use database functions with locks and ownership checks, preventing overbooking and browser privilege changes.
- Studio is a single role-aware route under the authenticated layout; taxonomy review and taxonomy browsing remain public, and legacy tickets links redirect to Studio.
- Favorites and follows persist in Cloud using canonical gallery piece IDs and artist handles, including sample media; RLS limits rows to their creator and a caller-scoped RPC exposes only artist-owned aggregate counts.
- Artist Studio owner panels persist real taxonomy, room links, pieces and media separately from its labeled sample editor, preventing sample ownership confusion.
- Artist room colors are `.room-<id>` classes setting --room/--room-fg, used via bg-room/text-room-fg — one template, many walls.
- Taxonomy IDs and normalized joins are canonical; owner-scoped transactional functions enforce selection limits and matching specialties. Shared pure helpers enforce upload settings before storage writes.
- Taxonomy media tiles mount raw media or external embeds only after playback starts and coordinate one active player; covers remain lightweight on the wall.
- Shared shop controls validate URL state with optional-input Zod schemas; sorting uses public aggregate counts, private interests/follows, and a nullable artist-rating adapter for future reviews.
- Registration records newsletter consent transactionally using server time and role-derived source; client drafts never grant roles.
- Platform links normalize through one shared helper for quiz and Studio; room media loads players only after an explicit play action and coordinates one active player.
- Service types are taxonomy entries linked through parent_id to a medium or specialty; services store service_type_id so filters use the service's category rather than the artist's main medium. The existing Taxonomy screen remains a session-only review preview.
<!-- AGENT-MEMORY:END -->
