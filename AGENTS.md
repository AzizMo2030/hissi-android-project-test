<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Rules
- Android APK is built by Capacitor via `.github/workflows/android-apk.yml` with `CAPACITOR=1` (SPA mode, webDir dist/client), Node 22+, Java 21, and the Capacitor template's SDK requirements; fail artifact upload when no APK exists so workflow success cannot hide a missing output. Lovable hosting never outputs an APK.
- Native-only APIs (`@capacitor/*`) are dynamically imported and guarded by `Capacitor.isNativePlatform()` so the web build keeps working.
- Timetable data is local-only (localStorage via `src/lib/lessons.ts`); no backend.
