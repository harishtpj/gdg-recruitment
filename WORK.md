# Work Done

Upon inspecting the application, I found that it is similar to the original recruitment website, but
has broken styling and layouts. I've tried to recreate it as much as possible based on the styles used
in the original website. Other than the fixes related to UI/UX and basic website functionality, the
following things have been done:

## Performance Improvements

Many parts of the provided web app archive has delibrate usage of the following:
- Unnecessary CPU-intensive loops (with iters. in order of 30k-50k)
- Redundant cursor state tracking (which would slow down the app)
- An unnecessary Bubble Sort
- Redundant usage of `useEffect()` even for derived states
- Usage of `Math.random()` in keys

Such snippets has been removed and replaced with appropriate equivalents, wherever possible.

## React / Next.js Fixes

- Updated to Next.js 16 from the Next.js 14 (EOL). Also fixed related *breaking changes* as part of this
update.
- Fixed stale selected applicants remaining in the response dialog after unchecking them (in the admin panel).

## Backend / DB / API Improvements

- Certain critical API routes (such as `/api/admin/applicants`, `/api/shortlist/[id]`) were
unauthorized. In such unprotected routes, authorization is added.
- Recruitment deadline has been hardcoded in the related components, extracted it and made it
dynamic (configurable via .env files).
- The given app has a `lib/modal` and `lib/actions` folder, which has separate DB logic. Despite that,
the DB logic has been manually duplicated in the API server code. Centralized and deduplicated it.
- In the above DB layer provided, manual `user` collection management code was also included. Since that
is automated by `better-auth`, it has been removed.
- The given recruitment form does not record the 'Gender' and 'Why do you want to join the department' questions (neither the zod schema validates it, nor the `FormDataModel` saves it). Fixed to include that
as part of the submission.

I've also tried to decode the content given in `constants/index.js` to my best, but I can't find any
predictable algorithm to decode it. Assuming that the encoding has been done to maintain 
confidentiality, I've left it as such.