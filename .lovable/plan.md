

## Plan: Redesign Auth Page to Match ChatInterface Style

### Overview
Align the Auth page's visual language with ChatInterface.tsx — same dark background (`#030303`), ambient glow positioning, glassmorphic surfaces, input styling, and button treatments.

### Changes (single file: `src/pages/Auth.tsx`)

**1. Fix `index2.ts` build error**
- This file contains raw JSON stream data, not valid TypeScript. Delete it or replace with an empty export to fix the build.

**2. Background & Ambient Glows**
- Keep `bg-[#030303]` (already matches)
- Adjust glow positions to match ChatInterface: top-left `bg-indigo-500/15` at `top-[10%] left-[20%] w-[40%] h-[40%]` and bottom-right `bg-purple-500/15` at `bottom-[20%] right-[-10%] w-[50%] h-[50%]`

**3. Card Container**
- Change from `bg-white/[0.03]` to match ChatInterface's panel style: `bg-[#050505]/60 backdrop-blur-3xl border border-white/10`
- Add `shadow-[0_8px_32px_rgba(0,0,0,0.5)]` matching the chat panel shadow
- Remove the outer glow div behind the card

**4. Header / Logo**
- Replace the standalone "A" logo with the gradient icon box matching ChatInterface's workspace icon: `bg-gradient-to-br from-indigo-500 to-purple-600` with `shadow-[0_0_30px_rgba(99,102,241,0.3)]`

**5. Tab Switcher (Sign In / Sign Up)**
- Match ChatInterface's preview/code toggle style: `bg-black/40 rounded-lg p-1 border border-white/5` with active state `bg-white/10 text-white shadow`

**6. Input Fields**
- Style inputs like ChatInterface's message input: `border-0 bg-transparent` inside a `bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-2xl` wrapper
- Keep the icon positioning but use `text-white/30` for placeholders

**7. Primary Button**
- Match the send button style: `bg-white text-black hover:bg-gray-200 rounded-xl shadow-lg` instead of the gradient button
- Or keep gradient but use ChatInterface's deploy button style: `bg-indigo-600 hover:bg-indigo-700 shadow-[0_0_15px_rgba(79,70,229,0.3)]`

**8. Divider & Secondary Buttons**
- Keep divider but use `border-white/5` matching ChatInterface borders
- Guest/mock buttons: use `bg-white/5 border-white/10 hover:bg-white/10` (already close)

**9. Remove the separate sparkles icon header** — use a simpler centered layout like ChatInterface's empty state

### Files Modified
| File | Action |
|------|--------|
| `src/pages/Auth.tsx` | Restyle to match ChatInterface |
| `src/pages/index2.ts` | Delete (fixes build errors) |

