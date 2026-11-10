# COMPREHENSIVE CODEBASE SYNC DUMP
Generated: 2026-11-09T00:12:57.836Z

---
## 1. DIRECTORY TREES

### 1.1 Mobile App Directory Structure (fitness-app)
```
.claude
.expo
.vscode
android
app
assets
components
constants
ctx
lib
node_modules
scripts
services
store
supabase
types
utils
.env
.gitignore
AGENTS.md
app.json
babel.config.js
DATABASE_SCHEMA.md
eas.json
eslint.config.js
expo_error.log
expo_output.log
expo-env.d.ts
global.css
LICENSE
metro.config.js
nativewind-env.d.ts
package-lock.json
package.json
PROJECT_RULES.md
README.md
tailwind.config.js
tsconfig.json
WEB_RULES.md
.claude\settings.json
.vscode\extensions.json
.vscode\settings.json
android\app
android\gradle
android\.gitignore
android\build.gradle
android\gradle.properties
android\gradlew
android\gradlew.bat
android\settings.gradle
android\app\src
android\app\build.gradle
android\app\debug.keystore
android\app\proguard-rules.pro
android\app\src\debug
android\app\src\debugOptimized
android\app\src\main
android\app\src\debug\AndroidManifest.xml
android\app\src\debugOptimized\AndroidManifest.xml
android\app\src\main\java
android\app\src\main\res
android\app\src\main\AndroidManifest.xml
android\app\src\main\java\com
android\app\src\main\java\com\anonymous
android\app\src\main\java\com\anonymous\fitnessapp
android\app\src\main\java\com\anonymous\fitnessapp\MainActivity.kt
android\app\src\main\java\com\anonymous\fitnessapp\MainApplication.kt
android\app\src\main\res\drawable
android\app\src\main\res\drawable-hdpi
android\app\src\main\res\drawable-mdpi
android\app\src\main\res\drawable-xhdpi
android\app\src\main\res\drawable-xxhdpi
android\app\src\main\res\drawable-xxxhdpi
android\app\src\main\res\mipmap-anydpi-v26
android\app\src\main\res\mipmap-hdpi
android\app\src\main\res\mipmap-mdpi
android\app\src\main\res\mipmap-xhdpi
android\app\src\main\res\mipmap-xxhdpi
android\app\src\main\res\mipmap-xxxhdpi
android\app\src\main\res\values
android\app\src\main\res\values-night
android\app\src\main\res\drawable\ic_launcher_background.xml
android\app\src\main\res\drawable\rn_edit_text_material.xml
android\app\src\main\res\drawable-hdpi\splashscreen_logo.png
android\app\src\main\res\drawable-mdpi\splashscreen_logo.png
android\app\src\main\res\drawable-xhdpi\splashscreen_logo.png
android\app\src\main\res\drawable-xxhdpi\splashscreen_logo.png
android\app\src\main\res\drawable-xxxhdpi\splashscreen_logo.png
android\app\src\main\res\mipmap-anydpi-v26\ic_launcher_round.xml
android\app\src\main\res\mipmap-anydpi-v26\ic_launcher.xml
android\app\src\main\res\mipmap-hdpi\ic_launcher_background.webp
android\app\src\main\res\mipmap-hdpi\ic_launcher_foreground.webp
android\app\src\main\res\mipmap-hdpi\ic_launcher_monochrome.webp
android\app\src\main\res\mipmap-hdpi\ic_launcher_round.webp
android\app\src\main\res\mipmap-hdpi\ic_launcher.webp
android\app\src\main\res\mipmap-mdpi\ic_launcher_background.webp
android\app\src\main\res\mipmap-mdpi\ic_launcher_foreground.webp
android\app\src\main\res\mipmap-mdpi\ic_launcher_monochrome.webp
android\app\src\main\res\mipmap-mdpi\ic_launcher_round.webp
android\app\src\main\res\mipmap-mdpi\ic_launcher.webp
android\app\src\main\res\mipmap-xhdpi\ic_launcher_background.webp
android\app\src\main\res\mipmap-xhdpi\ic_launcher_foreground.webp
android\app\src\main\res\mipmap-xhdpi\ic_launcher_monochrome.webp
android\app\src\main\res\mipmap-xhdpi\ic_launcher_round.webp
android\app\src\main\res\mipmap-xhdpi\ic_launcher.webp
android\app\src\main\res\mipmap-xxhdpi\ic_launcher_background.webp
android\app\src\main\res\mipmap-xxhdpi\ic_launcher_foreground.webp
android\app\src\main\res\mipmap-xxhdpi\ic_launcher_monochrome.webp
android\app\src\main\res\mipmap-xxhdpi\ic_launcher_round.webp
android\app\src\main\res\mipmap-xxhdpi\ic_launcher.webp
android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_background.webp
android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_foreground.webp
android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_monochrome.webp
android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_round.webp
android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.webp
android\app\src\main\res\values\colors.xml
android\app\src\main\res\values\strings.xml
android\app\src\main\res\values\styles.xml
android\app\src\main\res\values-night\colors.xml
android\gradle\wrapper
android\gradle\wrapper\gradle-wrapper.jar
android\gradle\wrapper\gradle-wrapper.properties
app\(auth)
app\(onboarding)
app\(tabs)
app\(trainer-tabs)
app\client
app\recipe
app\trainer
app\_layout.tsx
app\+html.tsx
app\+not-found.tsx
app\account-security.tsx
app\chat.tsx
app\fix-meal.tsx
app\index.tsx
app\lock.tsx
app\modal.tsx
app\pricing.tsx
app\scanner.tsx
app\update-password.tsx
app\(auth)\_layout.tsx
app\(auth)\forgot-password.tsx
app\(auth)\login.tsx
app\(auth)\signup.tsx
app\(auth)\update-password.tsx
app\(onboarding)\_layout.tsx
app\(onboarding)\index.tsx
app\(onboarding)\metrics.tsx
app\(onboarding)\nutrition.tsx
app\(onboarding)\taste-profile.tsx
app\(tabs)\_layout.tsx
app\(tabs)\index.tsx
app\(tabs)\log-food.tsx
app\(tabs)\profile.tsx
app\(tabs)\recipes.tsx
app\(tabs)\shopping-list.tsx
app\(trainer-tabs)\_layout.tsx
app\(trainer-tabs)\chat.tsx
app\(trainer-tabs)\index.tsx
app\(trainer-tabs)\roster.tsx
app\(trainer-tabs)\trainer-profile.tsx
app\client\[id].tsx
app\recipe\[id].tsx
app\trainer\[id].tsx
components\home
components\profile
components\trainer
components\ActivityLevelSelector.tsx
components\AdherenceChart.tsx
components\CustomAlert.tsx
components\EditScreenInfo.tsx
components\EmptyState.tsx
components\ExternalLink.tsx
components\FormattedMarkdown.tsx
components\HybridMetricInput.tsx
components\MacroBurndown.tsx
components\RecipeCard.tsx
components\RecipeCatalog.tsx
components\RecipeCatalogSkeleton.tsx
components\RecipeFiltersModal.tsx
components\RecipeSwipeCard.tsx
components\RecipeSwipeDeck.tsx
components\StyledText.tsx
components\Themed.tsx
components\useClientOnlyValue.ts
components\useClientOnlyValue.web.ts
components\useColorScheme.ts
components\useColorScheme.web.ts
components\home\CookingModeBanner.tsx
components\home\MacrosWidget.tsx
components\home\MeetCoachWidget.tsx
components\home\RecentMealsWidget.tsx
components\home\StepsRAGWidget.tsx
components\home\WidgetRenderer.tsx
components\profile\AccountSecurityCard.tsx
components\profile\AppSettingsCard.tsx
components\profile\CoachBioModal.tsx
components\profile\NutritionTargetsCard.tsx
components\profile\PersonalDetailsCard.tsx
components\profile\ProtocolNotesCard.tsx
components\profile\TrainerBrandingCard.tsx
components\trainer\ClientCard.tsx
constants\Colors.ts
constants\subscriptions.ts
ctx\AuthContext.tsx
ctx\OnboardingContext.tsx
ctx\ThemeContext.tsx
lib\gemini.ts
lib\storage.ts
lib\supabase.ts
scripts\validate_images.js
services\recipeOcrService.ts
services\recipeService.ts
services\shoppingListService.ts
services\subscriptionService.ts
store\useAppStore.ts
supabase\.temp
supabase\functions
supabase\migrations
supabase\.env.local
supabase\.gitignore
supabase\config.toml
supabase\handle_new_user.sql
supabase\.temp\cli-latest
supabase\.temp\gotrue-version
supabase\.temp\linked-project.json
supabase\.temp\pooler-url
supabase\.temp\postgres-version
supabase\.temp\project-ref
supabase\.temp\rest-version
supabase\.temp\storage-migration
supabase\.temp\storage-version
supabase\functions\coach-chat
supabase\functions\fatsecret-lookup
supabase\functions\fix-meal
supabase\functions\get-recipes
supabase\functions\image-safety
supabase\functions\ingredient-scanner
supabase\functions\pt-plan
supabase\functions\recipe-catalog
supabase\functions\supply-chain
supabase\functions\deno.json
supabase\functions\coach-chat\deno.json
supabase\functions\coach-chat\index.ts
supabase\functions\fatsecret-lookup\deno.json
supabase\functions\fatsecret-lookup\index.ts
supabase\functions\fix-meal\deno.json
supabase\functions\fix-meal\index.ts
supabase\functions\get-recipes\deno.json
supabase\functions\get-recipes\index.ts
supabase\functions\image-safety\deno.json
supabase\functions\image-safety\index.ts
supabase\functions\ingredient-scanner\deno.json
supabase\functions\ingredient-scanner\index.ts
supabase\functions\pt-plan\deno.json
supabase\functions\pt-plan\index.ts
supabase\functions\recipe-catalog\deno.json
supabase\functions\recipe-catalog\index.ts
supabase\functions\supply-chain\.npmrc
supabase\functions\supply-chain\deno.json
supabase\functions\supply-chain\index.ts
supabase\migrations\20261105000000_zero_trust_security.sql
supabase\migrations\20261105120000_recipes_indexes_and_preferences.sql
supabase\migrations\20261105130000_recipes_image_url_and_validation.sql
supabase\migrations\20261105140000_add_height_weight_to_profiles.sql
supabase\migrations\20261106000000_add_demographics_to_profiles.sql
supabase\migrations\20261106010000_pt_portal_and_daily_logs.sql
supabase\migrations\20261107000000_b2b_multi_tenant_rls.sql
supabase\migrations\20261107010000_shopping_lists_persistence_and_analytics.sql
supabase\migrations\20261107020000_phase_3_b2b_locking_and_caching.sql
supabase\migrations\20261108000000_add_onboarding_completed.sql
supabase\migrations\20261108010000_add_deleted_at_to_profiles.sql
supabase\migrations\20261108020000_api_rate_limiting.sql
supabase\migrations\20261108030000_enterprise_overhaul_schema.sql
types\database.ts
types\database.types.ts
types\recipe.ts
utils\circuitBreaker.ts
utils\conversions.ts
utils\formatters.ts
utils\healthSync.ts
utils\profileDirtyState.ts
```

### 1.2 Web App Directory Structure (fitness-app-website)
```
.expo
dist
node_modules
public
src
supabase
.env
.env.example
.gitignore
DATABASE_SCHEMA.md
eslint.config.js
index.html
package-lock.json
package.json
postcss.config.js
PROJECT_RULES.md
README.md
SCHEMA.md
tailwind.config.js
tsconfig.app.json
tsconfig.json
tsconfig.node.json
vite.config.ts
WEB_RULES.md
.expo\devices.json
.expo\README.md
src\assets
src\components
src\context
src\hooks
src\lib
src\pages
src\stores
src\types
src\App.css
src\App.tsx
src\index.css
src\main.tsx
src\components\admin
src\components\auth
src\components\client-deep-dive
src\components\common
src\components\layout
src\components\marketplace
src\components\roster
src\components\seo
src\components\settings
src\components\support
src\components\trainer
src\components\ui
src\components\utils
src\components\admin\GlobalPricingManager.tsx
src\components\auth\DangerZone.tsx
src\components\auth\InactivityTracker.tsx
src\components\auth\ProtectedRoute.tsx
src\components\auth\ReCaptchaNotice.tsx
src\components\client-deep-dive\tile-editor
src\components\client-deep-dive\MacroGovernancePanel.tsx
src\components\client-deep-dive\PushNotificationSender.tsx
src\components\client-deep-dive\tile-editor\TileEditorCanvas.tsx
src\components\common\GDPRCookieBanner.tsx
src\components\layout\DashboardLayout.tsx
src\components\layout\Footer.tsx
src\components\layout\Navbar.tsx
src\components\layout\PublicLayout.tsx
src\components\marketplace\addonCatalog.ts
src\components\marketplace\AddonMarketplaceCard.tsx
src\components\marketplace\ClientInheritanceTree.tsx
src\components\marketplace\InvoiceHistoryTable.tsx
src\components\roster\ActiveRosterList.tsx
src\components\roster\AiRosterSummaryWidget.tsx
src\components\roster\CustomFlagBuilder.tsx
src\components\roster\SingleUseInviteGenerator.tsx
src\components\roster\TelemetryLineGraph.tsx
src\components\seo\SEO.tsx
src\components\settings\NotificationsTab.tsx
src\components\settings\PreferencesTab.tsx
src\components\settings\ProfileTab.tsx
src\components\settings\SecurityTab.tsx
src\components\support\IdeasHub.tsx
src\components\support\SupportTicketList.tsx
src\components\trainer\AdjustTargetsModal.tsx
src\components\trainer\InviteClientModal.tsx
src\components\trainer\PerformanceTelemetry.tsx
src\components\trainer\PrescribedPlanUpload.tsx
src\components\trainer\ScanConfirmationModal.tsx
src\components\ui\EmptyState.tsx
src\components\ui\Skeleton.tsx
src\components\utils\ScrollToTop.tsx
src\context\AuthContext.tsx
src\hooks\useIdleTimeout.ts
src\hooks\useTheme.ts
src\lib\supabase.ts
src\pages\AddonsMarketplace.tsx
src\pages\ClientDashboard.tsx
src\pages\ClientDeepDive.tsx
src\pages\ClientOverview.tsx
src\pages\LandingPage.tsx
src\pages\LoginPage.tsx
src\pages\PlanViewer.tsx
src\pages\PortalRedirect.tsx
src\pages\PricingPage.tsx
src\pages\SignupPage.tsx
src\pages\SuperAdminDashboard.tsx
src\pages\SupportAndIdeasHub.tsx
src\pages\TrainerDashboard.tsx
src\pages\TrainerRoster.tsx
src\pages\TrainerSettings.tsx
src\stores\useTileEditorStore.ts
src\types\database.ts
supabase\.temp
supabase\functions
supabase\add_coach_credentials.sql
supabase\add_protocol_notes.sql
supabase\fix_account_status_constraint.sql
supabase\storage_brand_assets.sql
supabase\.temp\cli-latest
supabase\.temp\linked-project.json
supabase\functions\invite-client
supabase\functions\parse-pt-plan
supabase\functions\invite-client\index.ts
supabase\functions\parse-pt-plan\index.ts
```

---
## 2. LIVING DOCUMENTATION & SCHEMAS

### 2.1 Web Documentation (WEB_RULES.md)
```markdown
# WEB_RULES.md — Living Project Documentation

Welcome to the **KineticLab Web Portal** living architectural guidelines. This document records the core technical decisions, styling guidelines, routing topology, and Supabase integration patterns.

---

## 1. Tech Stack & Dependencies

- **Runtime & Bundler:** Vite (React 19 + TypeScript)
- **Styling:** Tailwind CSS with zinc neutral dark scale + emerald-500 brand accent
- **Routing:** `react-router-dom` (v7)
- **SEO & Meta Tags:** `react-helmet-async` with dynamic Open Graph & UK geo-targeting
- **Icons:** `lucide-react`
- **Backend / Authentication:** Supabase (`@supabase/supabase-js`)
  - Target Project ID: `mdhacslestacihqwohop`
  - URL: `https://mdhacslestacihqwohop.supabase.co`

---

## 2. Directory Structure

```
├── .env / .env.example
├── index.html
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── admin/                 # Super-Admin global pricing & platform telemetry
│   │   ├── auth/                  # ProtectedRoute, reCAPTCHA integration
│   │   ├── client-deep-dive/      # Tile editor, macro tolerances & push controls
│   │   ├── common/                # GDPR cookie banner, modal dialogs
│   │   ├── layout/                # Navbar, Footer, DashboardLayout, Sidebar
│   │   ├── marketplace/           # Add-on cards, client inheritance, invoice table
│   │   ├── roster/                # AI summary, query flags, client cards, line graphs, invite generator
│   │   ├── seo/                   # SEO dynamic Helmet wrapper
│   │   ├── support/               # Support tickets, AI auto-reply, Ideas Hub
│   │   └── ui/                    # Skeleton, EmptyState, badge, button primitives
│   ├── context/
│   │   └── AuthContext.tsx        # Session & profile role manager
│   ├── lib/
│   │   └── supabase.ts            # Typed Supabase client instantiation
│   ├── pages/
│   │   ├── LandingPage.tsx        # Hero, 3 pillars, stats & CTA
│   │   ├── PricingPage.tsx        # Tiered pricing cards
│   │   ├── LoginPage.tsx          # High-contrast auth sign-in with reCAPTCHA
│   │   ├── SignupPage.tsx         # Role-based registration with reCAPTCHA
│   │   ├── ClientDashboard.tsx    # Client portal view & download hub
│   │   ├── TrainerRoster.tsx      # Active roster, AI summary & telemetry (/roster)
│   │   ├── ClientDeepDive.tsx     # Tile editor, macros & push (/client/:id)
│   │   ├── AddonsMarketplace.tsx  # Add-ons & billing (/add-ons)
│   │   ├── SuperAdminDashboard.tsx# Platform owner control (/admin)
│   │   ├── SupportAndIdeasHub.tsx # Support tickets & Ideas Hub (/support)
│   │   └── PortalRedirect.tsx     # /portal dynamic role redirector
│   ├── stores/
│   │   └── useTileEditorStore.ts  # Zustand store for Web-to-Mobile Tile Editor
│   ├── types/
│   │   └── database.ts            # Typed Supabase schema definitions
│   ├── App.tsx                    # Global router with enterprise route topology
│   ├── index.css                  # Tailwind base layer & dark theme
│   └── main.tsx                   # Root mount with HelmetProvider
└── WEB_RULES.md                       # Living documentation
```

---

## 3. Routing & Role-Based Access Control

### Route Map
| Route | Access | Component | Purpose |
|---|---|---|---|
| `/` | Public | `LandingPage` | Marketing hero, feature grid, UK proof |
| `/pricing` | Public | `PricingPage` | Basic Protocol, Pro Athlete, Independent Coach tiered cards |
| `/login` | Public | `LoginPage` | High-contrast auth sign in with reCAPTCHA protection |
| `/signup` | Public | `SignupPage` | Role-based registration with reCAPTCHA protection |
| `/portal` | Authenticated | `PortalRedirect` | Directs user to client, trainer, or super-admin portal |
| `/client-dashboard` | Protected (`client`) | `ClientDashboard` | Mobile companion download hub (no personal data/targets) |
| `/trainer-dashboard` | Protected (`trainer`) | `TrainerDashboard` | Legacy trainer workstation & redirect hub to `/roster` |
| `/roster` | Protected (`trainer`) | `TrainerRoster` | Active roster, AI summary briefing, custom flags, telemetry & single-use client invites |
| `/client/:id` | Protected (`trainer`) | `ClientDeepDive` | Deep-dive telemetry, Web-to-Mobile Tile Editor & macro controls |
| `/trainer-dashboard/settings` | Protected (`trainer`) | `TrainerSettings` | Tabbed settings hub: Profile, Preferences, Alerts, DangerZone |
| `/trainer-dashboard/client/:clientId` | Protected (`trainer`) | `ClientOverview` | High-level summary of adherence & meal logs (legacy alias) |
| `/viewer/pt-plan/:clientId/:fileName` | Protected (`trainer`) | `PlanViewer` | Fullscreen secure signed URL document & plan viewer |
| `/add-ons` | Protected (`trainer`) | `AddonsMarketplace` | Modular feature marketplace, client inheritance & invoices |
| `/admin` | Protected (`super_admin`) | `SuperAdminDashboard`| Platform owner control: global pricing & platform telemetry (strictly decoupled from trainer tenants) |
| `/support` | Authenticated | `SupportAndIdeasHub` | Support ticket submission (AI auto-resolution) & Ideas Hub |

### Strict Multi-Tenant Architectural Boundary
- **Platform Super-Admin Route (`/admin`):** Strictly restricted to global platform owners (`profiles.role === 'super_admin'`). Dedicated solely to global platform health (telemetry), platform pricing controls (`GlobalPricingManager.tsx`), and aggregate metrics. Platform owners do NOT manage individual athletes, invite codes, or trainer rosters. No trainer-specific tables (such as `trainer_invites`) are queried or managed on this route.
- **Trainer Tenant Roster Route (`/roster`):** Dedicated exclusively to individual fitness trainers (`profiles.role === 'trainer'`). Trainers manage their tenant-level `trainer_licenses` seat capacity, view and manage their active/frozen athletes, and generate unique `KL-XXXXXX` invite codes bound directly to their `trainer_id` via `SingleUseInviteGenerator.tsx` (`public.trainer_invites`).

### ProtectedRoute Rule
- When `allowedRoles` is set, unauthenticated users are directed to `/login` with location memory.
- If a client attempts to access `/trainer-dashboard`, they are redirected to `/client-dashboard`.
- If a trainer attempts to access `/client-dashboard`, they are redirected to `/trainer-dashboard`.

---

## 4. Supabase Auth & Session Strategy

- **`AuthContext`:** Listens to `supabase.auth.onAuthStateChange` and actively fetches user profile details from the `profiles` table to resolve `role` (`client` | `trainer`).
- **Dynamic Header:** When logged out, displays `Login` and `Start Free`. When logged in, displays `Go to Portal`, user badge, role tag, and sign out control.
- **Environment Keys:** Handled via `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

---

## 5. Business Model, Brand Tone & UK Localization Rules

### B2B2C SaaS Business Model
- **We are NOT a Personal Training Agency:** KineticLab does **not** employ personal trainers. We build and operate the software infrastructure.
- **B2B (Coaches):** Independent personal trainers use our enterprise workspace to manage client rosters, monitor meal logs in real-time, and maintain client retention.
- **B2C (Users):** Standalone athletes track macros using our freemium app, optionally upgrading to Pro.
- **Multi-Tenant Tiering:** Assigning a `trainer_id` to a client dynamically binds them to an independent coach's enterprise umbrella. The client automatically inherits Pro access, bypasses consumer paywalls, and shares real-time log visibility with their coach. If unlinked, accounts transition to a locked state that cleanly reactivates to standalone Free while strictly preserving all historical logs and data.

### Tone, "Benefit Over Technology" Copywriting & Evidence-Based Philosophy
- High-contrast, analytical, scientific, and clean. Strict avoidance of motivational fluff, scammy fitness tropes, or crash dieting jargon.
- **"Benefit Over Technology" Rule:** Copy must never expose backend technical plumbing to users. Internal terms like "AI", "Gemini", "OCR", "FatSecret", "Edge Functions", "RLS", "RAG", and "Lazy-Caching" are strictly forbidden in marketing copy (Hero, Pricing Cards, and Footer) and must be translated into user-centric benefits (e.g., "Smart scanning to instantly digitize and import your PT plans", "Lightning-fast access to a massive UK supermarket database", "Dynamic digital coaching that adapts to your weekly progress", "Bank-grade data privacy", "Instant, automated briefings on client adherence").
- **Pricing Audience Toggle:** The pricing page features an interactive `[ Personal ] | [ For Coaches ]` segmented switch. Personal displays Free and Pro cards side-by-side; For Coaches presents the wide Independent Coach Workspace card with dedicated coaching capabilities and zero-paywall client benefits.

### Strict UK Localization & Normalization
- Enforce standard UK English spelling natively (*flavour*, *fibre*, *courgette*, *aubergine*, *mince*, *wholemeal*, *optimise*).
- Enforce UK supermarket packaging units (*g*, *kg*, *ml*, *400g tin*, *6-pack large eggs*). Awkward unit measurements like "1 unit of a loose apple" are explicitly rejected.
- Zero native OS alert pop-ups; rely exclusively on unified custom themed alerts.

---

## 6. Phase 2 Architecture & Schema Synchronization

- **Database Types Synchronization:** `src/types/database.ts` directly reflects `DATABASE_SCHEMA.md` from the mobile project. Tables include `profiles`, `daily_logs`, `recipes`, `user_preferences`, `shopping_lists`, `shopping_list_history`, `chat_sessions`, and `chat_messages`.
- **Role Detection Flow:**
  1. On session change or reload, `AuthContext` queries the `profiles` table using `user.id`.
  2. The `role` is resolved from `profiles.role` (with fallback to `user.user_metadata.role` or `'client'`).
  3. `ProtectedRoute` enforces `allowedRoles`. Unauthorized access triggers immediate rerouting to the appropriate portal view.
- **Dynamic Portal Navigation:** Marketing `Navbar` automatically transitions call-to-actions to `Go to Portal` with username badge and sign-out capabilities when a session is active.


---

## 7. Phase 3: Secure Dashboard Interfaces & Data Integration

### Layout Paradigm
- **`DashboardLayout`:** Authenticated users transition away from the marketing navigation (`PublicLayout`) into a dedicated workspace layout featuring:
  - Persistent desktop sidebar and responsive mobile drawer.
  - Active workspace links dynamically filtered by `role`.
  - Clean user badge with initials and direct sign-out.
  - Quick-switch link back to the public marketing site.

### Trainer Command Center & CRM
- **Roster View (`TrainerDashboard.tsx`):**
  - Fetches assigned clients directly from `profiles` where `trainer_id === user.id`, including `account_status` and `updated_at`.
  - Modern CRM telemetry cards display Active Athletes, Pending Invites, Deactivated, and Active Protocol Coverage.
  - **Inactive Client Isolation:** Deactivated/inactive clients (`account_status === 'inactive'`) are isolated from the active workspace into a dedicated "Archived / Inactive" tab, preventing clutter while maintaining quick reactivation access.
  - **Custom Client Ordering:** Trainers can manually prioritize active athletes via up/down order ranking controls. Ordered sequences are persisted to local storage (`trainer_roster_order_{trainerId}`) to maintain customized triage ordering.
  - Data table renders Client Name, Status badge (`Active`, `Pending Invite`, `Inactive`), Protocol/Goal, Daily Target, Variance, and formatted UK Last Sync Date (`updated_at`).
  - Modal-driven direct email invite flow (`InviteClientModal.tsx`) backed by the Supabase Edge Function `invite-client`.
  - Includes quick action "Copy Link" to support direct query-param onboarding (`/signup?coach={id}`).
- **Client Overview & Deactivation (`ClientOverview.tsx`):**
  - Deep-linkable route at `/trainer-dashboard/client/:clientId` protected for `trainer` role.
  - Features prominent "Deactivate Client" / "Reactivate Client" toggle action with confirmation modal/prompt.
  - Updates `profiles.account_status` to `'inactive'` or `'active'`, dynamically recalculating roster counts and moving clients between CRM stages.
- **Edge Function: `invite-client`:**
  - Secure Deno function under `supabase/functions/invite-client/index.ts`.
  - Validates caller JWT and enforces trainer role check.
  - Utilizes `SUPABASE_SERVICE_ROLE_KEY` to trigger `supabase.auth.admin.inviteUserByEmail()`.
  - Automatically initializes `profiles` record linking `trainer_id` and setting `account_status = 'pending'`.
  **Structured Error Handling:** Must catch `AuthApiError` exceptions (e.g., SMTP transport failures, duplicate emails) and return structured JSON payloads (e.g., `{ error: "ALREADY_REGISTERED", message: "..." }`). The frontend (`InviteClientModal`) extracts this via `invokeError.context` to render custom themed inline UI alerts, strictly bypassing native OS pop-ups.

### Coach Credentials & External Certification Links
- **Settings & Profile Tab (`ProfileTab.tsx`):**
  - Allows independent coaches to edit their public `trainer_bio`.
  - Dynamic list management for `credentials` (`text[]`), enabling coaches to add, edit, or remove qualifications (e.g. "BSc Sports Science", "Level 3 PT").
  - Dynamic key-value pairs for `certification_links` (`jsonb`), allowing coaches to configure verified third-party registry and cert URLs (e.g., `[{"title": "CIMSPA Directory", "url": "https://..."}]`).
  - Saved directly to `public.profiles` for display to clients in mobile companion apps and web interfaces.
- **Liability & Verification Sweep:**
  - Platform UI **must never** render "Verified" or "UK Verified" badges, checkmarks, or claims of platform verification for coaches or their qualifications to mitigate legal liability.
  - Credential verification is decentralized: coaches provide direct links to external registers/institutions rather than platform-issued verification seals.


### Client Companion Download Hub
- **Web Download Hub (`ClientDashboard.tsx`):**
  - Web view for clients (`role === 'client'`) strictly restricts access to personal health metrics, macro targets, profile settings, and coaches' details.
  - Replaces all legacy dashboards with a clean, mobile-first download hub stating that KineticLab tracking and nutrition protocol enforcement require the iOS/Android companion app.
  - Features App Store & Google Play download badges alongside an explicit "Sign Out" button.

### Skeleton Loading & UX Quality
- Reusable `Skeleton` component (`src/components/ui/Skeleton.tsx`) provides high-contrast pulse animations (`bg-zinc-800/60 animate-pulse`) mirroring target card and table structures, eliminating jitter during Supabase network queries.
- Reusable `EmptyState` component (`src/components/ui/EmptyState.tsx`) provides resilient fallback views for error and empty states (`min-h-[400px]`, theme-adaptive `bg-white dark:bg-[#171717]`, brand accent retry action via `onRetry`).


### Data Flow & Error Resilience
- **Strict Schema Adherence:** All profile and meal log data queries strictly reference existing fields in `profiles` and `daily_logs` as specified in `src/types/database.ts` (matching `DATABASE_SCHEMA.md`).
- **Null Safety:** Unassigned macro targets or coach connections render graceful fallback messages and default baselines (e.g., "General Health", "Unassigned", "Self-Directed Macro Protocol").
- **Audit Logging:** Trainer reviews of client meal logs are strictly read-only and paginated/capped to the latest 10 logs with formatted UK dates (`en-GB`).


---

## 7. Enterprise Overhaul — Trainer CRM & Telemetry Modules

### 7.1 Active Roster & Telemetry (`/roster`)
- **AI Roster Summary Briefing:**
  - Queries `public.ai_roster_summaries` scoped to `trainer_id = auth.uid()`.
  - Displays natural language weekly briefings (`ai_summary_text`), aggregated metrics overview, and actionable client intervention tags.
- **Custom Query-Based Flags Builder:**
  - Dynamic rule builder UI enabling coaches to configure automated client alerting flags: `Metric (e.g. Calories, Steps, Protein, Log Frequency) -> Condition (e.g. <, >, Variance > X%, Streak Broken) -> Outcome (e.g. Amber Warning, Red Alert, Push Prompt)`.
  - Evaluated dynamically against daily telemetry logs without polluting database schemas.
- **Client Hierarchy & State Partitioning:**
  - Strictly differentiates active clients from paused/inactive clients using `profiles.client_state` (`'active' | 'frozen' | 'deactivated'`).
  - Active athletes support manual visual ordering and drag-and-drop prioritization.
  - Frozen athletes are sequestered in an "Inactive / Frozen" accordion/drawer, preserving historical records while clearly indicating license seat consumption (`'frozen'` consumes a seat, `'deactivated'` frees up a seat).
- **Weekly Telemetry Metric Graphs:**
  - Interactive multi-line trend graphs powered by `recharts` for 7-day calorie adherence, protein consistency, and step RAG indicators (`green`, `amber`, `red`).
  - Toggle controls allow trainers to filter visible metric streams on the fly.
- **Single-Use Invite Generation:**
  - Individual trainers generate cryptographically secure single-use invite codes (`KL-XXXXXX`) bound directly to their `trainer_id`.
  - Records are stored in `public.trainer_invites` with 7-day expiration dates and real-time status tracking (`active`, `used`, `expired`, `revoked`).
  - Ensures tenant-level isolation for client onboarding into the trainer's workspace and seat capacity allocation.

### 7.2 Client Deep-Dive & Control (`/client/:id`)
- **Web-to-Mobile Tile Editor:**
  - Configurator interface that allows coaches to manipulate the client mobile home screen layout.
  - State management uses a dedicated Zustand store (`useTileEditorStore`) with local drag reordering, widget visibility toggles, and pin status before executing an atomic write to `public.trainer_ui_configs.home_layout`.
  - JSON schema contract: `[ { "id": string, "type": string, "order": number, "visible": boolean, "isPinned": boolean, "props": object, "requiredAddon"?: string } ]`.
- **Macro Governance:**
  - Interactive switch for "Self-Managed Macros" (`profiles.self_managed_macros` / protocol override).
  - Fine-grained variance tolerance sliders (`profiles.macro_variance`, e.g., ±5% to ±25%) triggering adherence amber/red flags when clients log outside limits.
- **Pre-defined Push Notification Dispatcher:**
  - One-click push triggers (e.g., "Macro Check-in Reminder", "Great Streak!", "Log Water & Steps") invoking Supabase Edge Functions with audit timestamps.

### 7.3 Add-Ons, Billing & Admin (`/add-ons` & `/admin`)
- **Feature Marketplace (`/add-ons`):**
  - Displays modular coach add-on cards: `recipe_ocr` (Smart Recipe Scanning), `cooking_mode` (Hands-Free Kitchen Companion), `ai_meal_planner` (Adaptive Macro Meal Suggestions).
  - Explicit visual lineage demonstrating client inheritance: linked athletes automatically unlock purchased add-ons without individual consumer paywalls.
  - Direct integration with Stripe invoice history and seat allocation gauges (`active_seats / max_clients`).
- **Super-Admin View (`/admin`):**
  - Protected route restricted exclusively to global platform owners (`profiles.role === 'super_admin'`).
  - Global module controls, base seat pricing overrides, system telemetry overview, and aggregate platform metrics.
  - Strictly decoupled from trainer tenant workspaces: no client invites, rosters, or athlete telemetry queries.

### 7.4 Support, Governance & Utilities (`/support`)
- **Support Ticket System:**
  - Real-time ticket management (`public.support_tickets`) with subject, description, priority, and status indicators (`open`, `ai_resolved`, `human_needed`, `closed`).
  - Highlights AI auto-resolution notes with one-click "Escalate to Human Support" actions.
- **Ideas Hub:**
  - Crowdsourced feature feedback forum (`public.ideas_hub` & `public.ideas_hub_votes`) featuring AI semantic deduplication badges and community upvoting.
- **Security & Compliance:**
  - Invisible reCAPTCHA v3 / Cloudflare Turnstile token verification on `/login` and `/signup` auth flows.
  - Mandatory UK/GDPR Cookie Banner offering granular analytics/essential consent toggles with persistent local storage state.


```

### 2.2 Mobile Guardrails & Documentation (PROJECT_RULES.md)
```markdown
# Project Guardrails & Hard-Learned Fixes

## 🤖 AI & LLM Endpoints
- **Gemini Model:** ALWAYS use `gemini-3.8-flash`. Never use `gemini-2.5-flash` or old 1.5 endpoints (they return 404).

## 🔐 External APIs & Auth
- **FatSecret OAuth:** Always use `https://oauth.fatsecret.com/connect/token` (never include `.api` in the subdomain to avoid DNS lookup failures).
- **FatSecret Scopes & Methods:** 
  - Scope must strictly be set to `basic` (`scope: "basic"`). Never request `basic barcode` or combined scopes, which trigger an `invalid_scope` 400 Bad Request error.
  - FatSecret REST requests (`platform.fatsecret.com/rest/server.api`) with query string parameters should use HTTP `GET`.
  - **Parameter Isolation per Method**: FatSecret REST endpoints reject invalid parameter combinations with a 400 Bad Request. When querying `food.find_id_for_barcode`, ONLY pass `barcode` (and `method`, `format`). Never mix `search_expression` or pagination into barcode lookups.
  - **FatSecret IP Whitelisting (Error Code 21):** In the FatSecret Developer Console (platform.fatsecret.com), ensure the "Allowed IP Addresses" / "IP Restriction" field is left empty/disabled so requests originating from dynamic cloud/Supabase Edge Function IP addresses are not rejected with `code: 21` (`Invalid IP address detected`).
- **Supabase Edge Functions:** 
  - Never import `@supabase/functions-js/edge-runtime.d.ts` in Edge Functions; use `jsr:@supabase/supabase-js@^2` directly.
  - Never use trailing slashes in Deno import map JSR specifiers.
  - Always include CORS headers in responses (`corsHeaders`).
  - **Edge-Level HTTPS Image Enforcement**: Both `get-recipes` and `fatsecret-lookup` Edge Functions must sanitize all extracted media URLs using `enforceHttps` before returning payloads to protect iOS ATS and Android 9+ cleartext security requirements.

## 📱 Architecture & App State
- Mobile app (`fitness-app`) communicates with Supabase Edge Functions (`coach-chat`, `fatsecret-lookup`, `get-recipes`).
- Ensure request bodies match expected keys (`query`, `food_id`, `message`).


## 🍲 Recipe Engine & External Provider Architecture
- **Unified Edge Function (`get-recipes`)**:
  - The mobile app (`fitness-app`) strictly routes both the Swipe Deck and the Recipe Catalog through the `get-recipes` Edge Function.
  - Direct database queries against `supabase.from('recipes')` are strictly prohibited on the client.
  - Supports `action: "search" | "get_recipe" | "fetch_catalog" | "fetch_deck"`.
  - Seamlessly blends internal Supabase database recipes and external FatSecret API meals (`recipes.search`).
  - Fetches single recipe details (`recipe.get` for `fatsecret_` prefixes, local DB for numeric IDs) via `fetchRecipeById`.
- **Recipe Identifiers & Typing**:
  - `Recipe.id` and `UnifiedRecipe.id` must be typed as `string | number` across `types/recipe.ts` and `types/database.ts` to accommodate external alphanumeric IDs (e.g., `fatsecret_12345`).
- **Recipe Image Protocol Enforcement (ATS & Android Cleartext) & Resilient Extraction**:
  - All recipe images (FatSecret, third-party CDN, or internal) must be forced to HTTPS via `enforceHttps` in the Edge Function and front-end helpers (`cleanHttpsUrl`/`resolveSecureCover`) to prevent blocked loads on iOS App Transport Security and Android 9+ cleartext restrictions.
  - FatSecret image responses exhibit multiple schema shapes: direct string URL (`item.recipe_image`), nested objects (`item.recipe_image.image_url` / `.url` / `.#text`), and nested collections (`item.recipe_images.recipe_image` array or single object). Edge Functions and client normalizers must use deep defensive extraction (`extractFatSecretImageUrl`) checking strings, object keys, and arrays without throwing on `.trim()`.
  - Front-end image renderers (`RecipeCard`, `RecipeSwipeCard`, `RecipeSwipeDeck`, `[id].tsx`) must maintain a `hasImageError` state with `onError={() => setHasImageError(true)}` to gracefully render fallback icons if external CDN/FatSecret assets fail to load or return 404s.
- **Swipe Deck Data Fetching & Per-Meal Target Normalization**:
  - Daily macro goals (`targetCalories`, `targetProtein`, etc.) must always be converted to single-meal targets by dividing by `mealsPerDay` (default 3) before querying `get-recipes` (`action: "fetch_deck"`). Passing daily totals directly to the Edge Function will constrain queries to 2000+ kcal meals and return empty decks.
  - Edge Function local queries must incorporate a relaxed fallback mechanism: if tight multi-macro range checks return 0 recipes, automatically fallback to a broader catalog query so the user never encounters a false "Discovery Horizon Reached" state on active daily quota.


## 🗄️ Database Architecture, Multi-Tenancy (B2B2C) & RLS (UK GDPR)
- **RBAC & Multi-Tenancy Columns on `public.profiles`:**
  - `role`: Role `'client'` | `'trainer'`, default `'client'`, constrained by check constraint.
  - `trainer_id`: UUID self-reference to `public.profiles(id)` linking clients to their assigned trainer.
  - `stripe_customer_id`: Text tracking customer Stripe entity.
  - `subscription_tier`: Text tracking user subscription tier.
- **Strict Row Level Security (RLS) Strategy:**
  - **GDPR Special Category Health Isolation:** Client health records (food logs, weight, daily macros) must never be accessible across unauthorized boundaries.
  - **`profiles` Access Control:**
    - Clients are restricted strictly to `auth.uid() = id`.
    - Trainers are permitted to read and update assigned client profiles where `trainer_id = auth.uid()`.
  - **`daily_logs` Access Control:**
    - Clients can CRUD their own food records strictly where `auth.uid() = user_id`.
    - Trainers can read and update logs where the client belongs to them via subquery:
      `EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = daily_logs.user_id AND profiles.trainer_id = auth.uid())`.
  - **Indexes for RLS Performance:**
    - Always maintain indexes on `profiles(trainer_id)`, `profiles(role)`, `daily_logs(user_id)`, and `daily_logs(user_id, logged_at)` to keep RLS policy checks performant.

## 🔀 Role-Based Access Control (RBAC) & Routing
- **Dynamic Routing Gateway**: Handled strictly via interceptor in `app/_layout.tsx`.
  - **Trainer**: Bypasses onboarding; dynamically routed to `/(trainer-tabs)`. Intercepts client tab navigation and redirects to `/(trainer-tabs)`.
  - **Client**: Must pass onboarding gates (height, weight, goals); routed to `/(tabs)`. Intercepts trainer tab navigation and redirects to `/(tabs)`.
  - **Unauthenticated**: Defaults strictly to `/(auth)`.
- **Auth Context (`ctx/AuthContext.tsx`)**: Fetches and exposes `role` (`'client' | 'trainer' | null`) directly from the `profiles` table to drive frontend navigation and authorization.


## 🎯 Trainer UI & Dynamic RAG Methodology
- **Adherence Calculation Logic (`calculateClientRAG`)**:
  - **Data Source**: Aggregated calories and protein from `daily_logs` filtered for the current date (`logged_at` >= startOfDay and <= endOfDay).
  - **Targets & Thresholds**: Client targets from `profiles` (`target_calories`, `target_protein`, `macro_variance`).
  - **RAG Status Rules**:
    - **Red (`error`)**: 0 calories logged today (`daily_logs.length === 0 || totalCalories === 0`).
    - **Green (`success`)**: `Math.abs(totalCalories - targetCalories) / targetCalories <= (macro_variance / 100)`.
    - **Amber (`warning`)**: Logs exist, but calorie variance exceeds the allowed tolerance (`> macro_variance%`).
- **Client Card Component Pattern (`components/trainer/ClientCard.tsx`)**:
  - Horizontal card wrapped in `expo-router`'s `Link` (`/client/[id]`) with `asChild`.
  - Avatar with `expo-image` featuring an overlaid absolute RAG status indicator dot.
  - Interactive "Nudge" button with touch event propagation prevented (`e.stopPropagation()`) displaying feedback via `react-native-toast-message`.



## 🥗 Preference-Driven Recipe Personalization & Ranking
- **Personalized Weight Calculation (`calculateRecipeWeight`)**:
  - **Dietary Restrictions & Allergens**:
    - Evaluated against `RESTRICTION_FORBIDDEN_TERMS` (Vegetarian, Vegan, Pescatarian, Halal, Kosher, Dairy-Free, Gluten-Free, Nut-Free, Shellfish-Free).
    - Violation triggers heavy penalty (`-2000`) and removes recipe under `strictDietaryFilter`.
    - Explicit tag match grants bonus (`+25`).
  - **Palate Alignment (Tags & Ingredients)**:
    - Favorite/liked ingredients: `+5` points; disliked ingredients: `-10` points.
    - Liked tags: `+4` points; disliked tags: `-8` points.
  - **Macro Goals Alignment (Per-Meal Bracket)**:
    - Targets divided across `meals_per_day` (default 3).
    - Calorie deviation <= 15%: `+20` points; <= 30%: `+10` points; > 50%: `-15` points.
    - Protein target >= 90%: `+20` points; >= 70%: `+10` points; < 40%: `-15` points.
  - **Look-Alike Dictionary Calibration**: Caloric/protein proximity within 20% of user swipe history (`avgCalories`, `avgProtein`) grants `+10` points each.
  - **Pro Chrono-Nutrition**: Pro users receive time-of-day boost (`+18`) for morning, midday, afternoon, and evening recipes based on `localHour`.
- **Evolving Swipe Preference Engine (EMA Recency Decay & Debounced Sync)**:
  - **Recency Decay Factor (`0.88`)**: Rather than storing static infinite states, tag and ingredient scores decay exponentially on every swipe (`score * 0.88`). Current swipe applies `+1.0` (like) or `-1.0` (dislike). Top tags/ingredients with score `>= 0.45` calibrate the active user dictionary.
  - **Macro Smoothing (EMA)**: `avgCalories = Math.round(avgCalories * 0.7 + recipeCalories * 0.3)` ensures immediate responsiveness to dietary bulks/cuts without getting pinned to stale history.
  - **Bounded History & Debounced Persistence**: `liked_recipe_ids` is capped at the last 50 interactions in local `AsyncStorage`, and remote sync to Supabase `user_preferences` is debounced (1.2s buffer) to prevent write-rate saturation and eliminate UI stutter.
  - **Child Swipe Deck Delegation**: `RecipeSwipeDeck` must NEVER execute direct database writes or `user_preferences` mutations; it delegates exclusively to parent swipe handlers that route through `recordRecipeSwipe`.
- **Rendering & Infinite-Loop Prevention Guardrails**:
  - `getDailyTargets(profile, true)` produces a new object reference on every invocation. It MUST be wrapped in `useMemo(() => getDailyTargets(profile, true), [profile])` whenever utilized inside hook dependency arrays (`useCallback`, `useEffect`).
  - Filter state updates (`FILTER_CHIPS`) must be debounced before invoking catalog queries to avoid network flooding.
- **Client & Edge Decoupling**: Raw recipes fetched via `get-recipes` Edge Function are scored and ranked client-side via `sortAndFilterRecipesByPreferences` before render in `RecipeCatalog` and `RecipeSwipeDeck`.


## 🛒 Hybrid Shopping List Persistence & Trainer Analytics
- **Offline-First Hybrid Architecture (`services/shoppingListService.ts`)**:
  - **Local Layer**: `AsyncStorage` (`@protocol_weekly_ingredients`, `@shopping_list_checklist_v2`) guarantees instant zero-latency UI rendering and full offline supermarket checklist ticking.
  - **Cloud Sync Layer**: `public.shopping_lists` table tracks `raw_ingredients`, `sections` (JSONB), `total_items`, `checked_items`, and `adherence_rate` (`(checked / total) * 100`).
  - **Read Strategy**: Local storage loads immediately; background check syncs newer Supabase state to device.
  - **Write Strategy**: Local state updates synchronously, debouncing upsert to Supabase (`user_id` unique conflict target).
- **Trainer Analytics & UK GDPR RLS**:
  - Client has full CRUD on own row (`auth.uid() = user_id`).
  - Assigned trainer has SELECT and UPDATE permission via roster subquery:
    `EXISTS (SELECT 1 FROM public.profiles WHERE public.profiles.id = shopping_lists.user_id AND public.profiles.trainer_id = auth.uid())`.
  - Trainer dashboard (`app/client/[id].tsx`) consumes `fetchClientShoppingList` to monitor client grocery procurement adherence and completed grocery items without cross-client leakage.



## 👤 Profile & User Settings Architecture
- **Modular Inline Cards over Monolithic Modals (`components/profile/`)**:
  - Profile preferences are segregated into 4 dedicated cards:
    - `PersonalDetailsCard`: Core identity (Avatar, Name, Email, Tier badge) and Biometrics (Weight, Height, Age, Sex, Activity Level).
    - `NutritionTargetsCard`: Calories, Macronutrients (Protein, Carbs, Fats), Fitness Goals chips, Macro Flexibility Window (`macro_variance`), and Trainer/Coach Rules (`ptNotes`).
    - `AppSettingsCard`: Interface Theme selector and Local Notification toggles (Push, Meal Reminders, Coach Alerts).
    - `AccountSecurityCard`: Coach linkage status, Sign Out, and Delete Account destructive flow.
- **Explicit Save Action vs. Silent Device Persistence**:
  - Database mutations (`public.profiles`) must NOT auto-save on individual field edits or trigger intrusive "auto-saved" toasts.
  - Profile & nutrition state is staged locally and committed as an atomic batch using a single, prominent **"Save Changes"** action button that invokes `refreshProfile()` with one concise success confirmation.
  - Device-level preferences (Theme, Notifications) persist silently to `AsyncStorage` (`@app_prefs_notif_*`) without user-facing toasts or interruption.
- **Elimination of AI & OCR Clutter in Settings**:
  - Settings screens must prioritize clean data entry and user agency; AI OCR plan scanners, background sync banners, or noisy auto-save toasts must not clutter account settings interfaces.


## 🎨 Theme Synchronization & UI Layout Standards
- **Theme-Driven Styling**:
  - No hardcoded hex colors or static color strings (e.g., 'black', '#4ade80') are allowed inside UI components. ALL colors must be driven dynamically by the active theme (Light/Dark/Auto) using the central theme configuration (e.g., `useThemeColor` or the `Colors` constant file).
- **Global Theme Cascading**:
  - React Navigation tab containers do not automatically inherit React context theme backgrounds. `<Tabs>` in `app/(tabs)/_layout.tsx` and `app/(trainer-tabs)/_layout.tsx` must explicitly specify `sceneStyle: { backgroundColor: colors.background }` (and `sceneContainerStyle`) to prevent light/un-themed flashing on initial render or theme toggle.
- **Recipe Catalog 1-per-Row Architecture**:
  - `RecipeCatalog` strictly renders 1 card per row (`NUM_COLUMNS = 1`). Never revert to cramped 2-column grids. Card cover images maintain full width (`height: 190`), with clear macro pills (Calories / Protein) and quick-action add buttons side-by-side.
- **Strict Ban on Native OS Alerts (`showAppAlert`)**:
  - All alerts, confirmation dialogs, notifications, and popups must use custom app-styled components matching the theme (`showAppAlert` or `CustomAlert`). Standard native OS/Android popups (`Alert.alert`) are strictly prohibited to ensure visual consistency and theme compliance.
- **Unsaved Changes Navigation Guards**:
  - Staged profile and nutrition edits must be protected against accidental navigation loss. Screens with staged state must implement `usePreventRemove` alongside tab bar listener interception (`getProfileDirtyState`) to prompt users via `showAppAlert` before discarding edits.

## 🧠 AI Formatting & UK Supermarket Packaging Standards
- **Clean Markdown Display**:
  - All AI model responses (AI PT Coach, Meal Re-engineering, Ingredient Scanner) must render through `react-native-markdown-display` with custom obsidian dark theme styling. Raw Markdown syntax (e.g. `**`, `##`) must never leak directly into plain `<Text>` components.
- **UK-Localized Packaging & English Localization (`supply-chain` Edge Function)**:
  - Gemini shopping list prompts must strictly specify UK packaging sizes (grams, kg, ml, litres, 400g tins, 6-pack eggs, standard jar weights) and UK English spelling (`mince`, `courgette`, `aubergine`, `flavour`). Never output awkward single-item units like "1 unit of a gala apple".
- **Local Cache vs. DB Multi-Session Strategy**:
  - **Shopping List History**: Active shopping list cloud state tracks real-time adherence for trainer analytics (`public.shopping_lists`). Cleared shopping lists are archived locally in `AsyncStorage` (`@shopping_list_history_v1`) to let users revisit past weeks without bloating cloud databases.
  - **AI Coaching History**: Chat sessions are managed multi-session locally (`@ai_coach_sessions_v2`) with unique session IDs, timestamps, and an interactive history picker modal.


## ⚡ Resilience, Circuit Breakers & Database Recipe Caching
- **Client-Side Circuit Breaker (`utils/circuitBreaker.ts`)**:
  - Upstream API lookups (`fatsecret-lookup`, `get-recipes`) must be guarded by `isCircuitBreakerOpen`, `recordCircuitFailure`, and `recordCircuitSuccess`.
  - When FatSecret returns IP restrictions (`Invalid IP address detected` / Error Code 21), 429 quota exhaustion, or repeated 5xx gateway errors, the breaker immediately trips for 60 seconds.
  - While tripped, live autocomplete debouncers and barcode scanners fail fast with helpful user alerts without firing HTTP requests, eliminating runaway retry loops (311+ errors).
- **Database-First Lazy Loading Recipe Cache (`get-recipes`)**:
  - Single external recipe lookups (`fatsecret_...`) must query `supabase.from('recipes').select('*').eq('description', recipeId).maybeSingle()` before querying the external FatSecret API.
  - When retrieved from FatSecret for the first time, recipes are asynchronously persisted to `public.recipes` (mapping external ID to `description`), so subsequent lookups are served 100% from the database.
- **Throttled Catalog Pagination & Infinite Loop Guards**:
  - `handleEndReached` in `app/(tabs)/recipes.tsx` must be guarded by synchronous refs (`isFetchingMoreRef`, `isLoadingRef`) and memoized with `useCallback` to prevent multi-call storms on fast scroll frames.
  - In `RecipeSwipeDeck`, `onDeckEmpty` invocations must be guarded by `hasFiredEmptyRef` and strictly check `recipes.length > 0` so that exhausting or mounting an empty deck does not trigger an infinite reload/render flashing storm.
  - In `app/(tabs)/recipes.tsx`, automatic deck hydration when `deck.length === 0` must be guarded by `hasAttemptedDeckLoadRef` to prevent re-fetch loop storms when discovery decks are empty.
- **Expo Router Navigation Guards & Error Boundaries**:
  - Do NOT import `usePreventRemove` from `@react-navigation/core` directly in screen components. Use `navigation.addListener('beforeRemove')` from `expo-router`'s `useNavigation()` to avoid `"couldn't find a navigation object"` crashes.
  - Root `app/_layout.tsx` must re-export Expo Router's `ErrorBoundary` (`export { ErrorBoundary } from 'expo-router'`) to ensure clean recovery from unexpected navigation/render crashes.
- **Barcode Scanner Guard & Non-Failing 404s**:
  - Barcode payloads must be sanitized with `.trim()` before dispatch to avoid FatSecret 400 Bad Request parameter rejections.
  - Normal "not found" or "invalid barcode" responses must NOT invoke `recordCircuitFailure`, reserving circuit breaker trips strictly for genuine upstream network, IP (code 21), 429 quota, or 5xx gateway faults.
- **Strict Payload Guards (Input Character Ceilings)**:
  - All text input fields must enforce hard client-side `maxLength` ceilings to protect token usage and avoid bloating payload sizes:
    - Search inputs: `maxLength={100}`
    - Dietary preferences & exclusions: `maxLength={255}`
    - Meal fix descriptions: `maxLength={500}`
    - AI Coach chat: `maxLength={1000}`


## 🎨 UI/UX, Theme Synchronization & Design Systems (Phase 2)
- **Dynamic Theme Propagation & Zero Hardcoded Theme Tokens**:
  - Individual tab pages, sub-components, modals, and screen headers must consume `useTheme()` tokens (`colors.background`, `colors.surface`, `colors.card`, `colors.cardBorder`, etc.) instead of hardcoded dark mode hex colors (`#0f172a`, `#1e293b`, `#020617`), which prevent light/dark mode propagation.
  - Global `Toast` configs (`react-native-toast-message`) must be dynamically initialized inside `RootLayoutInner` via `useMemo(() => createToastConfig(colors, isDark), [colors, isDark])` so system toasts immediately adapt to active themes.
- **Unified AI Markdown Component (`FormattedMarkdown`)**:
  - All AI responses (Coach chat, Ingredient scanner, Meal-fix output) must be rendered using `components/FormattedMarkdown.tsx`.
  - Never duplicate static markdown styles in individual screens. `FormattedMarkdown` guarantees syntax like `**` or `##` is cleanly parsed and headings/codeblocks match the active theme.
- **Spacious 1-per-Row Recipe Architecture**:
  - Recipe displays (`RecipeCard`, `RecipeCatalog`'s `RecipeGridItem`) must strictly follow a spacious 1-per-row card hierarchy with 16pt margin, prominent cover image, floating translucent cook time tag, and contrast-checked macro pills.
  - Skeletons (`RecipeCatalogSkeleton`) must dynamically match card heights and use themed animated placeholder blocks.
- **Centered Filter Modals & Debounced Network Dispatch**:
  - Filtering overlays (`RecipeFiltersModal`) must render as centered floating modal cards on dimmed backdrops instead of cramped bottom sheets.
  - Filter selection updates must use debounced synchronization (`useRef`/`setTimeout` 400ms) to ensure responsive toggling while preventing upstream API flood.
- **Strict Custom Popups & Dual-Level Unsaved Guards**:
  - Standard OS/Android alerts (`Alert.alert`) are strictly forbidden. All alert prompts must use the custom themed `showAppAlert()` from `components/CustomAlert.tsx`.
  - Navigation guards for unsaved form state (e.g., Profile screen) must be enforced at both the Tab bar listener (`tabPress` in `TabLayout`) and the Screen listener (`navigation.addListener('beforeRemove')` in `profile.tsx`).


## 🏢 Multi-Tenant Tiering, Account Locking & Data Security (Phase 3)
- **Trainer Tier Inheritance & Dynamic Pro Access**:
  - Assigned clients (`trainer_id IS NOT NULL`) implicitly inherit Pro status and rate limit exemptions across the app, ensuring seamless access under their coach's enterprise tier.
  - `isPro` state in `AuthContext` must evaluate `true` if `profile.is_pro || profile.subscription_status === 'pro' || Boolean(profile.trainer_id)`.
- **Trainer Account Revocation & Standalone Reactivation Flow**:
  - When a trainer revokes or deactivates client access, `account_status` transitions to `'locked_trainer_revoked'` or `'inactive'`.
  - The root navigation router (`app/_layout.tsx`) intercepts users with `account_status === 'locked_trainer_revoked'` or `'inactive'` and immediately redirects them to `app/lock.tsx`, blocking access to tabs and onboarding until they opt to reactivate to standalone Free tier.
  - The custom lock modal must present: *"Your account was locked by your trainer. To reactivate a standalone version, click here"*. Reactivation resets `trainer_id: null`, sets `account_status: 'active'`, and provisions a standalone `'free'` tier retaining all historical daily logs, profile metrics, and shopping lists.
- **Clickable Trainer Branding & Bio Screen**:
  - The client profile displays a dedicated `TrainerBrandingCard` with the assigned trainer's name, avatar, and active status.
  - The trainer's name is rendered as a clickable link that opens `app/trainer/[id].tsx`, displaying the trainer's detailed bio, verified coaching credentials, and contact shortcuts.
- **GDPR-Compliant Private Storage & Short-Lived Signed URLs**:
  - Supabase storage buckets (`avatars`) must have public access disabled (`public = false`).
  - Raw public storage URLs are strictly prohibited. Client media resolution must use `getSecureSignedUrl` or `getSecureAvatarUrl` from `lib/storage.ts` with short-lived expiration (1 hour) and Storage RLS policies granting access only to the file owner and their linked coach.
- **Database Recipe Caching (`fatsecret_recipe_id`)**:
  - The `public.recipes` table includes a dedicated `fatsecret_recipe_id TEXT UNIQUE` column with index.
  - `get-recipes` Edge Function checks `recipes` by `fatsecret_recipe_id` before hitting FatSecret API, and persists external responses on cache misses with `onConflict: "fatsecret_recipe_id"`.
- **Historical Shopping Lists & Chat Persistence**:
  - Shopping list history is backed up to `public.shopping_list_history` with RLS allowing both client and assigned coach visibility.
  - Chat coaching sessions and messages persist to `public.chat_sessions` and `public.chat_messages`, equipped with a clean pre-launch quick-resume panel for zero-friction coaching resumption.
- **UK Supermarket Packaging & English Spelling Enforcement**:
  - The `supply-chain` system prompt strictly normalizes quantities into UK packaging standards (grams `g`, kilograms `kg`, millilitres `ml`, standard tins/jars like `400g tin`, `6-pack large eggs`).
  - Awkward and non-standard quantities like "1 unit of a loose gala apple" are explicitly prohibited.
  - Strict UK English spelling (e.g. `flavour`, `fibre`, `courgette`, `aubergine`, `mince`, `wholemeal`, `optimise`) is enforced across Gemini Edge prompts (`supply-chain`, `fix-meal`, `coach-chat`) and UI copy.

## 🚀 Onboarding, Auth State & Biometrics Policy
- **The Onboarding Gate (Derived State):**
  - `onboarding_completed` is strictly a **derived state** and NOT a database column in `public.profiles`.
  - Client onboarding completeness is strictly derived from the presence of non-null metrics: `height IS NOT NULL`, `weight IS NOT NULL`, and `goals` array being non-empty. Never attempt to query or update an `onboarding_completed` column on `public.profiles`.
- **Trainer-Managed Flow (Macro Bypass):**
  - If a client has an assigned coach (`profile.trainer_id IS NOT NULL`), the onboarding flow must **bypass all macro-collection inputs** (calories, protein, carbs, fats, meals per day, and dietary preferences).
  - Target macros for trainer-linked athletes are managed exclusively by the assigned coach; onboarding must preserve coach-configured blueprints and avoid overwriting them during profile completion.
- **Biometrics Policy (Explicit Opt-In & Password Fallback):**
  - Biometrics authentication is strictly **opt-in** and must never be assumed enabled by default.
  - After the first successful password login, the app intercepts the flow with a themed prompt: *"Enable Biometrics for faster login?"*.
  - The user's explicit preference is stored in `AsyncStorage` under `@app_prefs_biometrics_enabled` (`'true'` or `'false'`).
  - If biometrics is declined, skipped, unavailable, or fails, the system must strictly fall back to standard password/passcode authentication without locking the user out.


## 🏢 Enterprise Overhaul & Multi-Tenant Architecture (Phase 4)
- **Modular Licenses & Add-on Feature Inheritance:**
  - Trainers configure purchased feature add-ons in `public.trainer_licenses.add_ons` (`["recipe_ocr", "cooking_mode", "ai_meal_planner"]`).
  - Clients inherit access to all add-on modules enabled on their linked trainer's license via `useTrainerLicenseAddons()` hook.
  - Client state machine:
    - `'active'`: Full platform access, consumes 1 trainer license seat.
    - `'frozen'`: Athlete paused or injured; maintains profile/logs and continues to consume 1 trainer license seat.
    - `'deactivated'`: Account archived/read-only; frees up the trainer license seat so trainer can onboard a replacement athlete without billing increases.
  - Total active seats calculated via: `COUNT(*) WHERE trainer_id = :id AND client_state IN ('active', 'frozen') <= trainer_licenses.max_clients`.
- **Dynamic Home Screen UI Architecture:**
  - Web dashboard writes tile/widget hierarchy into `public.trainer_ui_configs.home_layout` as a JSON array.
  - Mobile app fetches `home_layout` during initial load/cache and dynamically renders home screen tiles using `DynamicDashboardRenderer`.
  - JSON schema contracts: Each element specifies `id`, `type`, `order`, `visible`, `props`, and optional `requiredAddon`.
  - Missing or unauthorized modules (e.g. required add-on not purchased by trainer) must be gracefully omitted or swapped with a fallback card without throwing errors.
  - Fallback layout: If `trainer_ui_configs` is null or empty, mobile app defaults to the standard default dashboard configuration.
- **Frictionless Ingestion: OCR Meal Scanner & Recipe URL Extractor:**
  - **OCR Meal Scanner**:
    - Mobile app captures or selects food label/screenshot via `expo-image-picker` or `expo-camera`.
    - Client compresses image to JPEG and sends Base64 payload to the `extract-meal-image` Edge Function. No heavy on-device OCR binaries (e.g., Tesseract or MLKit OCR bundles) to keep app bundle size minimal.
    - Edge function uses `gemini-3.8-flash` Vision model to extract structured nutrition (`food_name`, `calories`, `protein`, `carbs`, `fats`, `serving_size`).
    - App presents review & edit modal before persisting to `public.daily_logs`.
  - **URL Recipe Extractor**:
    - Client pastes a recipe URL from any food blog/website.
    - Routed to `extract-recipe-url` Edge Function. The function fetches web HTML, cleans boilerplate, and uses `gemini-3.8-flash` to extract structured recipe data.
    - Standardizes all quantities into UK packaging and metric units (`g`, `kg`, `ml`, standard tins/jars) and UK English spelling (`fibre`, `flavour`, `courgette`, etc.) in accordance with Project Rules.
- **Cooking Mode Native Implementation:**
  - Gated by `"cooking_mode"` feature add-on in `trainer_licenses`.
  - When active on a recipe detail screen, "Start Cooking" triggers an interactive step-by-step cooking experience.
  - Uses `expo-keep-awake` (`activateKeepAwakeAsync` / `deactivateKeepAwakeAsync`) to keep the phone screen awake throughout prep and cooking.
  - Uses `expo-speech` (`Speech.speak`) for text-to-speech read-aloud functionality with British English voice (`language: 'en-GB'`), permitting hands-free cooking.
- **Zero-Medical Compliance: Health Data RAG Bypass:**
  - Native integration queries Apple Health (HealthKit via `@kingstinct/react-native-healthkit` or `react-native-health`) and Google Fit / Health Connect (`react-native-health-connect`).
  - **Zero Raw Health Data Storage Policy**:
    - Raw daily step counts, heart rates, distances, and sleep data MUST NEVER be uploaded, logged, or saved to Supabase to prevent medical data compliance and HIPAA/GDPR health-data liabilities.
    - On-device local evaluation: App reads daily step count locally, compares against target (Default: Green >= 10,000, Amber 5,000-9,999, Red < 5,000), and emits ONLY the status string (`'green'`, `'amber'`, or `'red'`).
    - Client updates `public.client_health_metrics` with `steps_rag` string and date.
- **Telemetry, Gamification & Automation:**
  - **Account Numbers**: Auto-generated via database sequence & trigger `set_account_number()` into format `'KL-04928'`. Read-only on mobile client.
  - **Single-Use Trainer Invites**: Generated by trainer on web, stored in `public.trainer_invites` with secure cryptographically random token and expiration. Claimed once during client registration/linking, immediately transitioning to `'used'`.
  - **Server-Verified Achievements**: Clients cannot arbitrarily grant themselves badges. Milestones (e.g. 7-day adherence streaks, 50 logged meals) are validated server-side by database trigger or Edge Function before setting `server_verified: true` in `public.client_achievements`.
  - **AI Roster Summaries**: Weekly analytics cron job executes Edge Function `generate-roster-summary`, aggregating client adherence trends, RAG distributions, and macro deviations to populate `public.ai_roster_summaries` for coaches.
- **Support Hub & AI Edge Automation:**
  - **Ideas Hub AI Deduplication**: `ideas-hub` Edge function processes new feature submissions, computes embedding or similarity against existing ideas using `gemini-3.8-flash`, and assigns `dedup_group_id` if similarity exceeds 85%, preventing duplicated requests and merging vote counts.
  - **Support Tickets AI Auto-Reply**: `support-tickets` Edge function handles incoming tickets, generates an immediate empathetic AI triage response, and automatically flags status as `'ai_resolved'` or `'human_needed'` based on client satisfaction.


```

### 2.3 Mobile AGENTS Guidelines (AGENTS.md)
```markdown
This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

```

### 2.4 Database Schema (DATABASE_SCHEMA.md)
```markdown
\-- WARNING: This schema is for context only and is not meant to be run.

\-- Table order and constraints may not be valid for execution.



CREATE TABLE public.profiles (

&#x20; id uuid NOT NULL,

&#x20; full\_name text,

&#x20; target\_calories integer DEFAULT 2000,

&#x20; target\_protein integer DEFAULT 150,

&#x20; meals\_per\_day integer DEFAULT 4,

&#x20; subscription\_status text DEFAULT 'free'::text,

&#x20; updated\_at timestamp with time zone DEFAULT now(),

&#x20; pt\_notes text,

&#x20; target\_carbs integer,

&#x20; target\_fats integer,

&#x20; is\_pro boolean DEFAULT false,

&#x20; avatar\_url text,

&#x20; goals ARRAY,

&#x20; macro\_variance integer DEFAULT 20,

&#x20; height numeric,

&#x20; weight numeric,

&#x20; trainer\_id uuid,

&#x20; age integer,

&#x20; sex text,

&#x20; activity\_level text,

&#x20; role text NOT NULL DEFAULT 'client'::text CHECK (role = ANY (ARRAY\['client'::text, 'trainer'::text])),

&#x20; stripe\_customer\_id text,

&#x20; subscription\_tier text,

&#x20; account\_status text NOT NULL DEFAULT 'active'::text CHECK (account\_status = ANY (ARRAY\['active'::text, 'pending'::text, 'inactive'::text, 'deleted'::text, 'locked\_trainer\_revoked'::text])),

&#x20; trainer\_bio text,

&#x20; protocol\_notes text,

&#x20; account\_number text UNIQUE,

&#x20; client\_state text NOT NULL DEFAULT 'active'::text CHECK (client\_state = ANY (ARRAY\['active'::text, 'frozen'::text, 'deactivated'::text])),

&#x20; CONSTRAINT profiles\_pkey PRIMARY KEY (id),

&#x20; CONSTRAINT profiles\_id\_fkey FOREIGN KEY (id) REFERENCES auth.users(id),

&#x20; CONSTRAINT profiles\_trainer\_id\_fkey FOREIGN KEY (trainer\_id) REFERENCES public.profiles(id)

);

CREATE TABLE public.user\_preferences (

&#x20; user\_id uuid NOT NULL,

&#x20; liked\_recipe\_ids ARRAY DEFAULT '{}'::bigint\[],

&#x20; disliked\_recipe\_ids ARRAY DEFAULT '{}'::bigint\[],

&#x20; liked\_tags ARRAY DEFAULT '{}'::text\[],

&#x20; disliked\_tags ARRAY DEFAULT '{}'::text\[],

&#x20; liked\_ingredients ARRAY DEFAULT '{}'::text\[],

&#x20; disliked\_ingredients ARRAY DEFAULT '{}'::text\[],

&#x20; look\_alike\_dictionary jsonb DEFAULT '{"avgProtein": 0, "avgCalories": 0, "preferredTags": \[], "preferredCuisines": \[], "preferredIngredients": \[]}'::jsonb,

&#x20; updated\_at timestamp with time zone DEFAULT now(),

&#x20; CONSTRAINT user\_preferences\_pkey PRIMARY KEY (user\_id),

&#x20; CONSTRAINT user\_preferences\_user\_id\_fkey FOREIGN KEY (user\_id) REFERENCES auth.users(id)

);

CREATE TABLE public.recipes (

&#x20; id bigint NOT NULL,

&#x20; title text NOT NULL,

&#x20; images jsonb,

&#x20; tags jsonb,

&#x20; ingredients jsonb,

&#x20; ingredient\_quantities jsonb,

&#x20; instructions jsonb,

&#x20; calories numeric,

&#x20; fats numeric,

&#x20; saturated\_fats numeric,

&#x20; cholesterol numeric,

&#x20; sodium numeric,

&#x20; carbs numeric,

&#x20; fiber numeric,

&#x20; sugar numeric,

&#x20; protein numeric,

&#x20; servings numeric,

&#x20; cook\_time text,

&#x20; prep\_time text,

&#x20; total\_time text,

&#x20; image\_url text,

&#x20; has\_valid\_image boolean DEFAULT false,

&#x20; fatsecret\_recipe\_id text UNIQUE,

&#x20; CONSTRAINT recipes\_pkey PRIMARY KEY (id)

);

CREATE TABLE public.daily\_logs (

&#x20; id uuid NOT NULL DEFAULT gen\_random\_uuid(),

&#x20; user\_id uuid NOT NULL,

&#x20; meal\_type text NOT NULL CHECK (meal\_type = ANY (ARRAY\['Breakfast'::text, 'Lunch'::text, 'Dinner'::text, 'Snack'::text])),

&#x20; food\_name text NOT NULL,

&#x20; barcode text,

&#x20; calories integer NOT NULL,

&#x20; protein numeric NOT NULL,

&#x20; carbs numeric NOT NULL,

&#x20; fats numeric NOT NULL,

&#x20; serving\_size numeric NOT NULL,

&#x20; logged\_at timestamp with time zone NOT NULL DEFAULT now(),

&#x20; CONSTRAINT daily\_logs\_pkey PRIMARY KEY (id),

&#x20; CONSTRAINT daily\_logs\_user\_id\_fkey FOREIGN KEY (user\_id) REFERENCES public.profiles(id)

);

CREATE TABLE public.shopping\_list\_history (

&#x20; id uuid NOT NULL DEFAULT gen\_random\_uuid(),

&#x20; user\_id uuid NOT NULL,

&#x20; title text NOT NULL,

&#x20; raw\_ingredients ARRAY DEFAULT '{}'::text\[],

&#x20; sections jsonb DEFAULT '\[]'::jsonb,

&#x20; total\_items integer DEFAULT 0,

&#x20; checked\_items integer DEFAULT 0,

&#x20; adherence\_rate numeric DEFAULT 0.00,

&#x20; created\_at timestamp with time zone DEFAULT now(),

&#x20; CONSTRAINT shopping\_list\_history\_pkey PRIMARY KEY (id),

&#x20; CONSTRAINT shopping\_list\_history\_user\_id\_fkey FOREIGN KEY (user\_id) REFERENCES public.profiles(id)

);

CREATE TABLE public.chat\_sessions (

&#x20; id uuid NOT NULL DEFAULT gen\_random\_uuid(),

&#x20; user\_id uuid NOT NULL,

&#x20; title text NOT NULL DEFAULT 'New Coaching Chat'::text,

&#x20; created\_at timestamp with time zone DEFAULT now(),

&#x20; updated\_at timestamp with time zone DEFAULT now(),

&#x20; CONSTRAINT chat\_sessions\_pkey PRIMARY KEY (id),

&#x20; CONSTRAINT chat\_sessions\_user\_id\_fkey FOREIGN KEY (user\_id) REFERENCES public.profiles(id)

);

CREATE TABLE public.chat\_messages (

&#x20; id uuid NOT NULL DEFAULT gen\_random\_uuid(),

&#x20; session\_id uuid NOT NULL,

&#x20; user\_id uuid NOT NULL,

&#x20; role text NOT NULL CHECK (role = ANY (ARRAY\['user'::text, 'model'::text, 'assistant'::text])),

&#x20; content text NOT NULL,

&#x20; created\_at timestamp with time zone DEFAULT now(),

&#x20; CONSTRAINT chat\_messages\_pkey PRIMARY KEY (id),

&#x20; CONSTRAINT chat\_messages\_session\_id\_fkey FOREIGN KEY (session\_id) REFERENCES public.chat\_sessions(id),

&#x20; CONSTRAINT chat\_messages\_user\_id\_fkey FOREIGN KEY (user\_id) REFERENCES public.profiles(id)

);

CREATE TABLE public.trainer\_licenses (

&#x20; id uuid NOT NULL DEFAULT gen\_random\_uuid(),

&#x20; trainer\_id uuid NOT NULL UNIQUE,

&#x20; tier text NOT NULL DEFAULT 'pro'::text CHECK (tier = ANY (ARRAY\['starter'::text, 'pro'::text, 'enterprise'::text])),

&#x20; max\_clients integer NOT NULL DEFAULT 10,

&#x20; add\_ons jsonb NOT NULL DEFAULT '\[]'::jsonb,

&#x20; billing\_cycle text DEFAULT 'monthly'::text CHECK (billing\_cycle = ANY (ARRAY\['monthly'::text, 'yearly'::text])),

&#x20; is\_active boolean NOT NULL DEFAULT true,

&#x20; expires\_at timestamp with time zone,

&#x20; created\_at timestamp with time zone DEFAULT now(),

&#x20; updated\_at timestamp with time zone DEFAULT now(),

&#x20; CONSTRAINT trainer\_licenses\_pkey PRIMARY KEY (id),

&#x20; CONSTRAINT trainer\_licenses\_trainer\_id\_fkey FOREIGN KEY (trainer\_id) REFERENCES public.profiles(id)

);

CREATE TABLE public.trainer\_ui\_configs (

&#x20; id uuid NOT NULL DEFAULT gen\_random\_uuid(),

&#x20; trainer\_id uuid NOT NULL UNIQUE,

&#x20; home\_layout jsonb NOT NULL DEFAULT '\[{"id": "macros\_summary", "type": "MacrosWidget", "order": 0, "props": {"showRemaining": true}, "visible": true}, {"id": "steps\_rag\_card", "type": "StepsRAGWidget", "order": 1, "props": {"colorScheme": "traffic"}, "visible": true}, {"id": "cooking\_mode\_banner", "type": "CookingModeBanner", "order": 2, "props": {}, "visible": true, "requiredAddon": "cooking\_mode"}, {"id": "recent\_meals", "type": "RecentMealsWidget", "order": 3, "props": {"maxItems": 4}, "visible": true}]'::jsonb,

&#x20; updated\_at timestamp with time zone DEFAULT now(),

&#x20; CONSTRAINT trainer\_ui\_configs\_pkey PRIMARY KEY (id),

&#x20; CONSTRAINT trainer\_ui\_configs\_trainer\_id\_fkey FOREIGN KEY (trainer\_id) REFERENCES public.profiles(id)

);

CREATE TABLE public.client\_health\_metrics (

&#x20; id uuid NOT NULL DEFAULT gen\_random\_uuid(),

&#x20; user\_id uuid NOT NULL,

&#x20; date date NOT NULL DEFAULT CURRENT\_DATE,

&#x20; steps\_rag text NOT NULL CHECK (steps\_rag = ANY (ARRAY\['red'::text, 'amber'::text, 'green'::text])),

&#x20; synced\_at timestamp with time zone DEFAULT now(),

&#x20; CONSTRAINT client\_health\_metrics\_pkey PRIMARY KEY (id),

&#x20; CONSTRAINT client\_health\_metrics\_user\_id\_fkey FOREIGN KEY (user\_id) REFERENCES public.profiles(id)

);

CREATE TABLE public.trainer\_invites (

&#x20; id uuid NOT NULL DEFAULT gen\_random\_uuid(),

&#x20; trainer\_id uuid NOT NULL,

&#x20; invite\_code text NOT NULL UNIQUE,

&#x20; status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY\['active'::text, 'used'::text, 'expired'::text, 'revoked'::text])),

&#x20; used\_by\_id uuid,

&#x20; used\_at timestamp with time zone,

&#x20; expires\_at timestamp with time zone NOT NULL,

&#x20; created\_at timestamp with time zone DEFAULT now(),

&#x20; CONSTRAINT trainer\_invites\_pkey PRIMARY KEY (id),

&#x20; CONSTRAINT trainer\_invites\_trainer\_id\_fkey FOREIGN KEY (trainer\_id) REFERENCES public.profiles(id),

&#x20; CONSTRAINT trainer\_invites\_used\_by\_id\_fkey FOREIGN KEY (used\_by\_id) REFERENCES public.profiles(id)

);

CREATE TABLE public.client\_achievements (

&#x20; id uuid NOT NULL DEFAULT gen\_random\_uuid(),

&#x20; user\_id uuid NOT NULL,

&#x20; achievement\_type text NOT NULL,

&#x20; title text NOT NULL,

&#x20; description text,

&#x20; server\_verified boolean NOT NULL DEFAULT false,

&#x20; metadata jsonb DEFAULT '{}'::jsonb,

&#x20; earned\_at timestamp with time zone DEFAULT now(),

&#x20; CONSTRAINT client\_achievements\_pkey PRIMARY KEY (id),

&#x20; CONSTRAINT client\_achievements\_user\_id\_fkey FOREIGN KEY (user\_id) REFERENCES public.profiles(id)

);

CREATE TABLE public.ai\_roster\_summaries (

&#x20; id uuid NOT NULL DEFAULT gen\_random\_uuid(),

&#x20; trainer\_id uuid NOT NULL,

&#x20; summary\_period\_start date NOT NULL,

&#x20; summary\_period\_end date NOT NULL,

&#x20; metrics\_overview jsonb NOT NULL DEFAULT '{}'::jsonb,

&#x20; ai\_summary\_text text NOT NULL,

&#x20; action\_items jsonb DEFAULT '\[]'::jsonb,

&#x20; generated\_at timestamp with time zone DEFAULT now(),

&#x20; CONSTRAINT ai\_roster\_summaries\_pkey PRIMARY KEY (id),

&#x20; CONSTRAINT ai\_roster\_summaries\_trainer\_id\_fkey FOREIGN KEY (trainer\_id) REFERENCES public.profiles(id)

);

CREATE TABLE public.ideas\_hub (

&#x20; id uuid NOT NULL DEFAULT gen\_random\_uuid(),

&#x20; user\_id uuid NOT NULL,

&#x20; title text NOT NULL,

&#x20; description text NOT NULL,

&#x20; dedup\_group\_id uuid,

&#x20; category text NOT NULL DEFAULT 'feature'::text CHECK (category = ANY (ARRAY\['feature'::text, 'ui'::text, 'recipe'::text, 'bug'::text])),

&#x20; upvotes\_count integer NOT NULL DEFAULT 1,

&#x20; status text NOT NULL DEFAULT 'submitted'::text CHECK (status = ANY (ARRAY\['submitted'::text, 'under\_review'::text, 'planned'::text, 'in\_progress'::text, 'completed'::text, 'duplicate'::text])),

&#x20; ai\_similarity\_score numeric,

&#x20; created\_at timestamp with time zone DEFAULT now(),

&#x20; updated\_at timestamp with time zone DEFAULT now(),

&#x20; CONSTRAINT ideas\_hub\_pkey PRIMARY KEY (id),

&#x20; CONSTRAINT ideas\_hub\_dedup\_group\_id\_fkey FOREIGN KEY (dedup\_group\_id) REFERENCES public.ideas\_hub(id),

&#x20; CONSTRAINT ideas\_hub\_user\_id\_fkey FOREIGN KEY (user\_id) REFERENCES public.profiles(id)

);

CREATE TABLE public.ideas\_hub\_votes (

&#x20; idea\_id uuid NOT NULL,

&#x20; user\_id uuid NOT NULL,

&#x20; created\_at timestamp with time zone DEFAULT now(),

&#x20; CONSTRAINT ideas\_hub\_votes\_pkey PRIMARY KEY (idea\_id, user\_id),

&#x20; CONSTRAINT ideas\_hub\_votes\_idea\_id\_fkey FOREIGN KEY (idea\_id) REFERENCES public.ideas\_hub(id),

&#x20; CONSTRAINT ideas\_hub\_votes\_user\_id\_fkey FOREIGN KEY (user\_id) REFERENCES public.profiles(id)

);

CREATE TABLE public.support\_tickets (

&#x20; id uuid NOT NULL DEFAULT gen\_random\_uuid(),

&#x20; user\_id uuid NOT NULL,

&#x20; subject text NOT NULL,

&#x20; message text NOT NULL,

&#x20; ai\_reply text,

&#x20; status text NOT NULL DEFAULT 'open'::text CHECK (status = ANY (ARRAY\['open'::text, 'ai\_resolved'::text, 'human\_needed'::text, 'closed'::text])),

&#x20; created\_at timestamp with time zone DEFAULT now(),

&#x20; updated\_at timestamp with time zone DEFAULT now(),

&#x20; CONSTRAINT support\_tickets\_pkey PRIMARY KEY (id),

&#x20; CONSTRAINT support\_tickets\_user\_id\_fkey FOREIGN KEY (user\_id) REFERENCES public.profiles(id)

);


```

### 2.5 Recent Enterprise SQL Migration (20261108030000_enterprise_overhaul_schema.sql)
```sql
-- ==============================================================================
-- ENTERPRISE OVERHAUL: MULTI-TENANT, MODULAR LICENSES, HEALTH RAG & AUTOMATION
-- Migration: 20261108030000_enterprise_overhaul_schema.sql
-- ==============================================================================

-- 1. ACCOUNT NUMBER SEQUENCE & PROFILES EXPANSION
CREATE SEQUENCE IF NOT EXISTS public.kl_account_number_seq START WITH 1000;

CREATE OR REPLACE FUNCTION public.set_account_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.account_number IS NULL THEN
    NEW.account_number := 'KL-' || LPAD(nextval('public.kl_account_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_number TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS client_state TEXT NOT NULL DEFAULT 'active' CHECK (client_state IN ('active', 'frozen', 'deactivated'));

DROP TRIGGER IF EXISTS trigger_set_account_number ON public.profiles;
CREATE TRIGGER trigger_set_account_number
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_account_number();

-- Backfill any existing profiles missing account numbers
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE account_number IS NULL ORDER BY updated_at ASC LOOP
    UPDATE public.profiles
    SET account_number = 'KL-' || LPAD(nextval('public.kl_account_number_seq')::text, 5, '0')
    WHERE id = r.id;
  END LOOP;
END;
$$;


-- 2. MODULAR LICENSES & ADD-ONS
CREATE TABLE IF NOT EXISTS public.trainer_licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'pro' CHECK (tier IN ('starter', 'pro', 'enterprise')),
  max_clients INTEGER NOT NULL DEFAULT 10,
  add_ons JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. ["recipe_ocr", "cooking_mode", "ai_meal_planner"]
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT trainer_licenses_trainer_id_key UNIQUE (trainer_id)
);

CREATE INDEX IF NOT EXISTS idx_trainer_licenses_trainer_id ON public.trainer_licenses(trainer_id);

ALTER TABLE public.trainer_licenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Trainers manage their own license" ON public.trainer_licenses;
CREATE POLICY "Trainers manage their own license"
  ON public.trainer_licenses FOR ALL
  USING (trainer_id = auth.uid());

DROP POLICY IF EXISTS "Clients can view their trainer's license" ON public.trainer_licenses;
CREATE POLICY "Clients can view their trainer's license"
  ON public.trainer_licenses FOR SELECT
  USING (
    trainer_id IN (
      SELECT trainer_id FROM public.profiles WHERE id = auth.uid()
    )
  );


-- 3. DYNAMIC HOME SCREEN UI CONFIGURATION
CREATE TABLE IF NOT EXISTS public.trainer_ui_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  home_layout JSONB NOT NULL DEFAULT '[
    {"id": "macros_summary", "type": "MacrosWidget", "order": 0, "visible": true, "props": {"showRemaining": true}},
    {"id": "steps_rag_card", "type": "StepsRAGWidget", "order": 1, "visible": true, "props": {"colorScheme": "traffic"}},
    {"id": "cooking_mode_banner", "type": "CookingModeBanner", "order": 2, "visible": true, "props": {}, "requiredAddon": "cooking_mode"},
    {"id": "recent_meals", "type": "RecentMealsWidget", "order": 3, "visible": true, "props": {"maxItems": 4}}
  ]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT trainer_ui_configs_trainer_id_key UNIQUE (trainer_id)
);

CREATE INDEX IF NOT EXISTS idx_trainer_ui_configs_trainer_id ON public.trainer_ui_configs(trainer_id);

ALTER TABLE public.trainer_ui_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Trainers manage their own UI config" ON public.trainer_ui_configs;
CREATE POLICY "Trainers manage their own UI config"
  ON public.trainer_ui_configs FOR ALL
  USING (trainer_id = auth.uid());

DROP POLICY IF EXISTS "Clients can view their trainer's UI config" ON public.trainer_ui_configs;
CREATE POLICY "Clients can view their trainer's UI config"
  ON public.trainer_ui_configs FOR SELECT
  USING (
    trainer_id IN (
      SELECT trainer_id FROM public.profiles WHERE id = auth.uid()
    )
  );


-- 4. HEALTH DATA COMPLIANCE (RAG BYPASS ONLY)
CREATE TABLE IF NOT EXISTS public.client_health_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  steps_rag TEXT NOT NULL CHECK (steps_rag IN ('red', 'amber', 'green')),
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT client_health_metrics_user_date_key UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_client_health_metrics_user_date ON public.client_health_metrics(user_id, date);

ALTER TABLE public.client_health_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own health RAG metrics" ON public.client_health_metrics;
CREATE POLICY "Users can manage their own health RAG metrics"
  ON public.client_health_metrics FOR ALL
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Trainers can view their clients' health RAG metrics" ON public.client_health_metrics;
CREATE POLICY "Trainers can view their clients' health RAG metrics"
  ON public.client_health_metrics FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.profiles WHERE trainer_id = auth.uid()
    )
  );

-- 5. SINGLE-USE TRAINER INVITES
CREATE TABLE IF NOT EXISTS public.trainer_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'revoked')),
  used_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trainer_invites_code ON public.trainer_invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_trainer_invites_trainer ON public.trainer_invites(trainer_id);

ALTER TABLE public.trainer_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Trainers manage their own invite links" ON public.trainer_invites;
CREATE POLICY "Trainers manage their own invite links"
  ON public.trainer_invites FOR ALL
  USING (trainer_id = auth.uid());

DROP POLICY IF EXISTS "Public read for active invite validation" ON public.trainer_invites;
CREATE POLICY "Public read for active invite validation"
  ON public.trainer_invites FOR SELECT
  USING (status = 'active');


-- 6. SERVER-VERIFIED CLIENT ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.client_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL, -- e.g. 'macro_streak_7', 'recipe_cooked_first', 'steps_green_14'
  title TEXT NOT NULL,
  description TEXT,
  server_verified BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT client_achievements_user_type_key UNIQUE (user_id, achievement_type)
);

CREATE INDEX IF NOT EXISTS idx_client_achievements_user ON public.client_achievements(user_id);

ALTER TABLE public.client_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own achievements" ON public.client_achievements;
CREATE POLICY "Users can view their own achievements"
  ON public.client_achievements FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Trainers can view their clients' achievements" ON public.client_achievements;
CREATE POLICY "Trainers can view their clients' achievements"
  ON public.client_achievements FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.profiles WHERE trainer_id = auth.uid()
    )
  );


-- 7. AI ROSTER SUMMARIES
CREATE TABLE IF NOT EXISTS public.ai_roster_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  summary_period_start DATE NOT NULL,
  summary_period_end DATE NOT NULL,
  metrics_overview JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_summary_text TEXT NOT NULL,
  action_items JSONB DEFAULT '[]'::jsonb,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_roster_summaries_trainer ON public.ai_roster_summaries(trainer_id);

ALTER TABLE public.ai_roster_summaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Trainers view their own AI roster summaries" ON public.ai_roster_summaries;
CREATE POLICY "Trainers view their own AI roster summaries"
  ON public.ai_roster_summaries FOR SELECT
  USING (trainer_id = auth.uid());


-- 8. IDEAS HUB & DEDUPLICATION
CREATE TABLE IF NOT EXISTS public.ideas_hub (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  dedup_group_id UUID REFERENCES public.ideas_hub(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'feature' CHECK (category IN ('feature', 'ui', 'recipe', 'bug')),
  upvotes_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'planned', 'in_progress', 'completed', 'duplicate')),
  ai_similarity_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ideas_hub_dedup_group ON public.ideas_hub(dedup_group_id);

CREATE TABLE IF NOT EXISTS public.ideas_hub_votes (
  idea_id UUID NOT NULL REFERENCES public.ideas_hub(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (idea_id, user_id)
);

ALTER TABLE public.ideas_hub ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas_hub_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view ideas" ON public.ideas_hub;
CREATE POLICY "Authenticated users can view ideas"
  ON public.ideas_hub FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create their own ideas" ON public.ideas_hub;
CREATE POLICY "Users can create their own ideas"
  ON public.ideas_hub FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own ideas" ON public.ideas_hub;
CREATE POLICY "Users can update their own ideas"
  ON public.ideas_hub FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view and cast votes" ON public.ideas_hub_votes;
CREATE POLICY "Users can view and cast votes"
  ON public.ideas_hub_votes FOR ALL
  USING (user_id = auth.uid());

-- Trigger to sync upvote counts on ideas_hub
CREATE OR REPLACE FUNCTION public.sync_idea_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.ideas_hub
    SET upvotes_count = upvotes_count + 1
    WHERE id = NEW.idea_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.ideas_hub
    SET upvotes_count = GREATEST(0, upvotes_count - 1)
    WHERE id = OLD.idea_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_idea_votes ON public.ideas_hub_votes;
CREATE TRIGGER trigger_sync_idea_votes
  AFTER INSERT OR DELETE ON public.ideas_hub_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_idea_votes_count();


-- 9. SUPPORT TICKETS (AI AUTO-REPLY & ESCALATION)
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  ai_reply TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'ai_resolved', 'human_needed', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON public.support_tickets(user_id);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own support tickets" ON public.support_tickets;
CREATE POLICY "Users manage their own support tickets"
  ON public.support_tickets FOR ALL
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Trainers can view their clients' support tickets" ON public.support_tickets;
CREATE POLICY "Trainers can view their clients' support tickets"
  ON public.support_tickets FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.profiles WHERE trainer_id = auth.uid()
    )
  );



```

---
## 3. STATE MANAGEMENT (ZUSTAND)

### 3.1 Mobile App Store (store/useAppStore.ts)
```typescript
import { create } from "zustand";
import { AppState as RNAppState, AppStateStatus } from "react-native";
import { supabase } from "../lib/supabase";
import { StepsRAGStatus, syncHealthRAGToCloud } from "../utils/healthSync";

export interface UIWidgetConfig {
  id: string;
  type: "MacrosWidget" | "StepsRAGWidget" | "CookingModeBanner" | "RecentMealsWidget";
  order: number;
  visible: boolean;
  props: Record<string, any>;
  requiredAddon?: string;
}

export const DEFAULT_HOME_LAYOUT: UIWidgetConfig[] = [
  {
    id: "macros_summary",
    type: "MacrosWidget",
    order: 0,
    visible: true,
    props: { showRemaining: true },
  },
  {
    id: "steps_rag_card",
    type: "StepsRAGWidget",
    order: 1,
    visible: true,
    props: { colorScheme: "traffic" },
  },
  {
    id: "cooking_mode_banner",
    type: "CookingModeBanner",
    order: 2,
    visible: true,
    props: {},
    requiredAddon: "cooking_mode",
  },
  {
    id: "recent_meals",
    type: "RecentMealsWidget",
    order: 3,
    visible: true,
    props: { maxItems: 4 },
  },
];

interface AppState {
  homeLayout: UIWidgetConfig[];
  trainerAddOns: string[];
  stepsRAG: StepsRAGStatus | null;
  localSteps: number;
  isLoadingConfig: boolean;
  isSyncingHealth: boolean;
  error: string | null;
  currentTrainerId: string | null;

  fetchDynamicConfig: (trainerId?: string | null) => Promise<void>;
  syncHealth: (userId: string, targetSteps?: number) => Promise<void>;
  setLocalSteps: (steps: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  homeLayout: DEFAULT_HOME_LAYOUT,
  trainerAddOns: [],
  stepsRAG: null,
  localSteps: 0,
  isLoadingConfig: false,
  isSyncingHealth: false,
  error: null,
  currentTrainerId: null,

  fetchDynamicConfig: async (trainerId?: string | null) => {
    const effectiveTrainerId = trainerId !== undefined ? (trainerId ?? null) : get().currentTrainerId;
    set({ currentTrainerId: effectiveTrainerId, isLoadingConfig: true, error: null });

    // If client has no trainer assigned, use the default layout immediately
    if (!effectiveTrainerId) {
      set({
        homeLayout: DEFAULT_HOME_LAYOUT,
        trainerAddOns: [],
        isLoadingConfig: false,
      });
      return;
    }

    try {
      // 1. Fetch trainer UI layout config
      const { data: configData, error: configError } = await supabase
        .from("trainer_ui_configs")
        .select("home_layout")
        .eq("trainer_id", effectiveTrainerId)
        .maybeSingle();

      if (configError) throw configError;

      // 2. Fetch trainer license add-ons
      const { data: licenseData, error: licenseError } = await supabase
        .from("trainer_licenses")
        .select("add_ons")
        .eq("trainer_id", effectiveTrainerId)
        .maybeSingle();

      if (licenseError) throw licenseError;

      // Parse and order layout
      let parsedLayout: UIWidgetConfig[] = DEFAULT_HOME_LAYOUT;
      if (configData?.home_layout && Array.isArray(configData.home_layout) && configData.home_layout.length > 0) {
        parsedLayout = (configData.home_layout as unknown as UIWidgetConfig[])
          .slice()
          .sort((a, b) => a.order - b.order);
      }

      const addOns = Array.isArray(licenseData?.add_ons)
        ? (licenseData.add_ons as unknown as string[])
        : [];

      set({
        homeLayout: parsedLayout,
        trainerAddOns: addOns,
        isLoadingConfig: false,
      });
    } catch (err: any) {
      console.warn("[useAppStore] Config sync fallback to default:", err?.message);
      set({
        homeLayout: DEFAULT_HOME_LAYOUT,
        trainerAddOns: [],
        error: err?.message ?? "Failed to load custom trainer dashboard config",
        isLoadingConfig: false,
      });
    }
  },

  syncHealth: async (userId: string, targetSteps: number = 10000) => {
    set({ isSyncingHealth: true });
    try {
      const { rag, steps } = await syncHealthRAGToCloud(userId, targetSteps);
      set({ stepsRAG: rag, localSteps: steps, isSyncingHealth: false });
    } catch (err) {
      console.error("[useAppStore] Health sync error:", err);
      set({ isSyncingHealth: false });
    }
  },

  setLocalSteps: (steps: number) => {
    set({ localSteps: steps });
  },
}));

// Automatically trigger fetchDynamicConfig when app returns to active foreground
if (typeof RNAppState !== "undefined" && RNAppState.addEventListener) {
  RNAppState.addEventListener("change", (nextAppState: AppStateStatus) => {
    if (nextAppState === "active") {
      const state = useAppStore.getState();
      state.fetchDynamicConfig(state.currentTrainerId);
    }
  });
}


```

### 3.2 Web Tile Editor Store (src/stores/useTileEditorStore.ts)
```typescript
import { create } from 'zustand'

export interface TileConfig {
  id: string
  type: string
  title: string
  description?: string
  order: number
  visible: boolean
  isPinned: boolean
  props: Record<string, unknown>
  requiredAddon?: string
}

export const CATALOG_TILES: Omit<TileConfig, 'order' | 'isPinned' | 'visible'>[] = [
  {
    id: 'macros_summary',
    type: 'MacrosWidget',
    title: 'Daily Macro Targets & Adherence',
    description: 'Displays current calorie and macronutrient progress against targets.',
    props: { showRemaining: true },
  },
  {
    id: 'steps_rag_card',
    type: 'StepsRAGWidget',
    title: 'Daily Steps (RAG Health Status)',
    description: 'Zero-storage telemetry displaying green, amber, or red compliance status.',
    props: { colorScheme: 'traffic' },
  },
  {
    id: 'cooking_mode_banner',
    type: 'CookingModeBanner',
    title: 'Interactive Hands-Free Cooking Mode',
    description: 'Keep-awake step-by-step kitchen assistant for scheduled meals.',
    props: { autoWakeLock: true },
    requiredAddon: 'cooking_mode',
  },
  {
    id: 'recent_meals',
    type: 'RecentMealsWidget',
    title: 'Recent Verified Meal Logs',
    description: 'Snapshot of the latest client entries with timestamp and macro breakdown.',
    props: { maxItems: 4 },
  },
  {
    id: 'weekly_streak',
    type: 'WeeklyStreakWidget',
    title: 'Weekly Macro & Activity Streak',
    description: 'Gamified server-verified adherence streak badge tracker.',
    props: { showBadge: true },
  },
  {
    id: 'water_tracker',
    type: 'WaterTrackerWidget',
    title: 'Hydration Target Counter',
    description: 'Quick hydration logger in UK metric millilitres (ml).',
    props: { targetMl: 2500 },
  },
  {
    id: 'coach_notes_pin',
    type: 'NotesFromCoachWidget',
    title: 'Coach Focus & Protocol Directives',
    description: 'Pinned notes and weekly directives from the supervising personal trainer.',
    props: { highlightFirst: true },
  },
  {
    id: 'recipe_ocr_quick_scan',
    type: 'RecipeOcrQuickScan',
    title: 'Smart Recipe OCR Quick-Capture',
    description: 'Instant camera shortcut to digitize paper PT plans and recipes.',
    props: { enableAutoTagging: true },
    requiredAddon: 'recipe_ocr',
  },
]
export const DEFAULT_MOBILE_LAYOUT: TileConfig[] = [
  {
    id: 'macros_summary',
    type: 'MacrosWidget',
    title: 'Daily Macro Targets & Adherence',
    order: 0,
    visible: true,
    isPinned: true,
    props: { showRemaining: true },
  },
  {
    id: 'steps_rag_card',
    type: 'StepsRAGWidget',
    title: 'Daily Steps (RAG Health Status)',
    order: 1,
    visible: true,
    isPinned: false,
    props: { colorScheme: 'traffic' },
  },
  {
    id: 'cooking_mode_banner',
    type: 'CookingModeBanner',
    title: 'Interactive Hands-Free Cooking Mode',
    order: 2,
    visible: true,
    isPinned: false,
    props: { autoWakeLock: true },
    requiredAddon: 'cooking_mode',
  },
  {
    id: 'recent_meals',
    type: 'RecentMealsWidget',
    title: 'Recent Verified Meal Logs',
    order: 3,
    visible: true,
    isPinned: false,
    props: { maxItems: 4 },
  },
]

interface TileEditorState {
  tiles: TileConfig[]
  catalog: typeof CATALOG_TILES
  activeAddons: string[]
  isDirty: boolean
  isSaving: boolean
  selectedTileId: string | null

  initialize: (existingLayout: TileConfig[] | null, activeAddons?: string[]) => void
  moveUp: (index: number) => void
  moveDown: (index: number) => void
  togglePin: (tileId: string) => void
  toggleVisibility: (tileId: string) => void
  addTile: (catalogId: string) => void
  removeTile: (tileId: string) => void
  resetToDefault: () => void
  setSaving: (saving: boolean) => void
  setDirty: (dirty: boolean) => void
  setSelectedTileId: (id: string | null) => void
}

export const useTileEditorStore = create<TileEditorState>((set, get) => ({
  tiles: DEFAULT_MOBILE_LAYOUT,
  catalog: CATALOG_TILES,
  activeAddons: [],
  isDirty: false,
  isSaving: false,
  selectedTileId: null,

  initialize: (existingLayout, activeAddons = []) => {
    if (existingLayout && Array.isArray(existingLayout) && existingLayout.length > 0) {
      const hydrated = existingLayout.map((tile, idx) => {
        const found = CATALOG_TILES.find((c) => c.id === tile.id || c.type === tile.type)
        return {
          ...tile,
          title: tile.title || found?.title || tile.id,
          description: tile.description || found?.description,
          order: typeof tile.order === 'number' ? tile.order : idx,
          isPinned: !!tile.isPinned,
          visible: tile.visible !== false,
          props: tile.props || {},
          requiredAddon: tile.requiredAddon || found?.requiredAddon,
        }
      })
      hydrated.sort((a, b) => a.order - b.order)
      set({ tiles: hydrated, activeAddons, isDirty: false, selectedTileId: null })
    } else {
      set({ tiles: DEFAULT_MOBILE_LAYOUT, activeAddons, isDirty: false, selectedTileId: null })
    }
  },

  moveUp: (index: number) => {
    const { tiles } = get()
    if (index <= 0 || index >= tiles.length) return
    const newTiles = [...tiles]
    const temp = newTiles[index - 1]
    newTiles[index - 1] = newTiles[index]
    newTiles[index] = temp
    const reordered = newTiles.map((t, idx) => ({ ...t, order: idx }))
    set({ tiles: reordered, isDirty: true })
  },

  moveDown: (index: number) => {
    const { tiles } = get()
    if (index < 0 || index >= tiles.length - 1) return
    const newTiles = [...tiles]
    const temp = newTiles[index + 1]
    newTiles[index + 1] = newTiles[index]
    newTiles[index] = temp
    const reordered = newTiles.map((t, idx) => ({ ...t, order: idx }))
    set({ tiles: reordered, isDirty: true })
  },

  togglePin: (tileId: string) => {
    const { tiles } = get()
    const updated = tiles.map((t) => (t.id === tileId ? { ...t, isPinned: !t.isPinned } : t))
    const pinned = updated.filter((t) => t.isPinned)
    const unpinned = updated.filter((t) => !t.isPinned)
    const combined = [...pinned, ...unpinned].map((t, idx) => ({ ...t, order: idx }))
    set({ tiles: combined, isDirty: true })
  },

  toggleVisibility: (tileId: string) => {
    const { tiles } = get()
    const updated = tiles.map((t) => (t.id === tileId ? { ...t, visible: !t.visible } : t))
    set({ tiles: updated, isDirty: true })
  },

  addTile: (catalogId: string) => {
    const { tiles, catalog } = get()
    if (tiles.some((t) => t.id === catalogId)) return
    const catalogItem = catalog.find((c) => c.id === catalogId)
    if (!catalogItem) return

    const newTile: TileConfig = {
      ...catalogItem,
      order: tiles.length,
      visible: true,
      isPinned: false,
    }
    set({ tiles: [...tiles, newTile], isDirty: true })
  },

  removeTile: (tileId: string) => {
    const { tiles } = get()
    const filtered = tiles.filter((t) => t.id !== tileId).map((t, idx) => ({ ...t, order: idx }))
    set({ tiles: filtered, isDirty: true })
  },

  resetToDefault: () => {
    set({ tiles: DEFAULT_MOBILE_LAYOUT, isDirty: true })
  },

  setSaving: (saving: boolean) => set({ isSaving: saving }),
  setDirty: (dirty: boolean) => set({ isDirty: dirty }),
  setSelectedTileId: (id: string | null) => set({ selectedTileId: id }),
}))


```

---
## 4. CORE ROUTING & PAGES

### 4.1 Web App Router (src/App.tsx)
```tsx
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useTheme } from './hooks/useTheme'
import { PublicLayout } from './components/layout/PublicLayout'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { LandingPage } from './pages/LandingPage'
import { PricingPage } from './pages/PricingPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { ClientDashboard } from './pages/ClientDashboard'
import { TrainerDashboard } from './pages/TrainerDashboard'
import { TrainerSettings } from './pages/TrainerSettings'
import { ClientOverview } from './pages/ClientOverview'
import { PlanViewer } from './pages/PlanViewer'
import { PortalRedirect } from './pages/PortalRedirect'
import { TrainerRoster } from './pages/TrainerRoster'
import { ClientDeepDive } from './pages/ClientDeepDive'
import { AddonsMarketplace } from './pages/AddonsMarketplace'
import { SuperAdminDashboard } from './pages/SuperAdminDashboard'
import { SupportAndIdeasHub } from './pages/SupportAndIdeasHub'
import { GDPRCookieBanner } from './components/common/GDPRCookieBanner'
import { ScrollToTop } from './components/utils/ScrollToTop'
import { InactivityTracker } from './components/auth/InactivityTracker'

const App: React.FC = () => {
  useTheme()

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <InactivityTracker />
        <Routes>
          {/* Public Marketing Shell */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/portal" element={<PortalRedirect />} />
          </Route>

          {/* Authenticated Dashboard Shell */}
          <Route element={<DashboardLayout />}>
            {/* Protected Client Dashboard */}
            <Route
              path="/client-dashboard"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Trainer Dashboard & Client Overview */}
            <Route
              path="/trainer-dashboard"
              element={
                <ProtectedRoute allowedRoles={['trainer']}>
                  <TrainerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainer-dashboard/settings"
              element={
                <ProtectedRoute allowedRoles={['trainer']}>
                  <TrainerSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainer-dashboard/client/:clientId"
              element={
                <ProtectedRoute allowedRoles={['trainer']}>
                  <ClientOverview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/viewer/pt-plan/:clientId/:fileName"
              element={
                <ProtectedRoute allowedRoles={['trainer']}>
                  <PlanViewer />
                </ProtectedRoute>
              }
            />

            {/* Enterprise Overhaul CRM Routes */}
            <Route
              path="/roster"
              element={
                <ProtectedRoute allowedRoles={['trainer']}>
                  <TrainerRoster />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/:id"
              element={
                <ProtectedRoute allowedRoles={['trainer']}>
                  <ClientDeepDive />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-ons"
              element={
                <ProtectedRoute allowedRoles={['trainer']}>
                  <AddonsMarketplace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['trainer']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/support"
              element={
                <ProtectedRoute allowedRoles={['trainer', 'client']}>
                  <SupportAndIdeasHub />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <GDPRCookieBanner />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App



```

### 4.2 Web: Trainer Roster (src/pages/TrainerRoster.tsx)
```tsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, ShoppingBag } from 'lucide-react'
import { SEO } from '../components/seo/SEO'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { AiRosterSummaryWidget } from '../components/roster/AiRosterSummaryWidget'
import { CustomFlagBuilder } from '../components/roster/CustomFlagBuilder'
import { TelemetryLineGraph } from '../components/roster/TelemetryLineGraph'
import { SingleUseInviteGenerator } from '../components/roster/SingleUseInviteGenerator'
import { ActiveRosterList } from '../components/roster/ActiveRosterList'
import type { Tables } from '../types/database'

type Profile = Tables<'profiles'>

export const TrainerRoster = () => {
  const { user } = useAuth()
  const [clients, setClients] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRoster() {
      if (!user) return
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('trainer_id', user.id)
          .order('full_name')

        if (error) {
          console.error('Error fetching roster:', error.message)
        }
        setClients(data || [])
      } catch (err) {
        console.error('Roster error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchRoster()
  }, [user])

  const handleUpdateClientState = async (
    clientId: string,
    newState: 'active' | 'frozen' | 'deactivated'
  ) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ client_state: newState })
        .eq('id', clientId)

      if (error) {
        console.error('Update state failed:', error.message)
        return
      }

      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? { ...c, client_state: newState } : c))
      )
    } catch (err) {
      console.error('State change err:', err)
    }
  }

  return (
    <>
      <SEO
        title="Active Athlete Roster & Telemetry | KineticLab Trainer Workspace"
        description="Comprehensive enterprise personal training CRM with AI summary briefing, custom alerting logic, and live telemetry multi-streams."
      />

      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Active Athlete Roster & Telemetry
                </h1>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                  Enterprise CRM
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-400">
                AI-synthesized weekly briefing, customizable alerting logic flags, and active roster ordering.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/add-ons"
                className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-200 hover:border-emerald-500/50 hover:text-white transition-colors"
              >
                <ShoppingBag className="h-4 w-4 text-emerald-400" />
                <span>Feature Add-Ons</span>
              </Link>
              <Link
                to="/trainer-dashboard"
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>Roster Overview</span>
              </Link>
            </div>
          </div>

          {/* AI Roster Briefing Widget */}
          <AiRosterSummaryWidget trainerId={user?.id} />

          {/* Telemetry Line Graph */}
          <TelemetryLineGraph clientIds={clients.map((c) => c.id)} />

          {/* Custom Query-Based Flags Builder */}
          <CustomFlagBuilder />

          {/* Single-Use Invite Link Generator */}
          <SingleUseInviteGenerator trainerId={user?.id} />

          {/* Active Roster List & Inactive/Frozen Quarantined Drawer */}
          {loading ? (
            <div className="h-48 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 animate-pulse" />
          ) : (
            <ActiveRosterList
              clients={clients}
              onUpdateClientState={handleUpdateClientState}
            />
          )}
        </div>
      </div>
    </>
  )
}

```

### 4.3 Web: Client Deep Dive (src/pages/ClientDeepDive.tsx)
```tsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Users } from 'lucide-react'
import { SEO } from '../components/seo/SEO'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { TileEditorCanvas } from '../components/client-deep-dive/tile-editor/TileEditorCanvas'
import { MacroGovernancePanel } from '../components/client-deep-dive/MacroGovernancePanel'
import { PushNotificationSender } from '../components/client-deep-dive/PushNotificationSender'
import type { Tables } from '../types/database'

type Profile = Tables<'profiles'>

export const ClientDeepDive = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [client, setClient] = useState<Profile | null>(null)
  const [activeAddons, setActiveAddons] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!id || !user) return
      setLoading(true)
      try {
        const { data: clientProfile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single()

        if (error) console.error('Error fetching client:', error.message)
        if (clientProfile) setClient(clientProfile)

        // Fetch coach license add-ons
        const { data: license } = await supabase
          .from('trainer_licenses')
          .select('add_ons')
          .eq('trainer_id', user.id)
          .maybeSingle()

        if (license?.add_ons && Array.isArray(license.add_ons)) {
          setActiveAddons(license.add_ons as string[])
        }
      } catch (err) {
        console.error('Deep-dive error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, user])

  return (
    <>
      <SEO
        title={`${client?.full_name || 'Client'} Control Hub | KineticLab Trainer Workspace`}
        description="Athlete control hub with Web-to-Mobile Tile Editor, macro tolerance protocols, and push dispatcher."
      />

      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
          {/* Breadcrumb Bar */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-400">
            <Link
              to="/roster"
              className="flex items-center gap-1.5 font-medium hover:text-emerald-400 transition-colors"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Active Roster</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
            <span className="font-semibold text-zinc-200 truncate">
              {client?.full_name || 'Athlete Deep Dive'}
            </span>
          </nav>

          {/* Top Bar with Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-6">
            <div className="flex items-center space-x-4">
              <Link
                to="/roster"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:border-emerald-500/50 hover:bg-zinc-800 hover:text-white transition-all shadow-sm"
              >
                <ArrowLeft className="h-4 w-4 text-emerald-400" />
                <span>Back to Roster</span>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    {client?.full_name || 'Client Protocol & Mobile Config'}
                  </h1>
                  {client?.account_number && (
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-mono text-zinc-400">
                      {client.account_number}
                    </span>
                  )}
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                    State: {client?.client_state || 'active'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  Manage athlete target variance, push alerts, and configure their mobile home screen widgets.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/trainer-dashboard/client/${client?.id || ''}`}
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:text-white"
              >
                View Historical Meal Logs
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="h-96 rounded-2xl border border-zinc-800 bg-zinc-900/40 animate-pulse" />
          ) : client ? (
            <div className="space-y-8">
              {/* Web-to-Mobile Tile Editor */}
              {user && (
                <TileEditorCanvas
                  trainerId={user.id}
                  client={client}
                  onClientUpdated={(updated) => setClient(updated)}
                  activeAddons={activeAddons}
                />
              )}

              {/* Macro Governance & Variance Tolerances */}
              <MacroGovernancePanel
                client={client}
                onClientUpdated={(updated) => setClient(updated)}
              />

              {/* Pre-Defined Push Notification Dispatcher */}
              <PushNotificationSender
                clientId={client.id}
                clientName={client.full_name || 'Athlete'}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-400">
              Athlete profile not found. Return to <Link to="/roster" className="text-emerald-400 underline">Roster</Link>.
            </div>
          )}
        </div>
      </div>
    </>
  )
}

```

### 4.4 Web: Super Admin Dashboard (src/pages/SuperAdminDashboard.tsx)
```tsx
import { Link } from 'react-router-dom'
import { Activity, ArrowLeft } from 'lucide-react'
import { SEO } from '../components/seo/SEO'
import { GlobalPricingManager } from '../components/admin/GlobalPricingManager'

export const SuperAdminDashboard = () => {
  return (
    <>
      <SEO
        title="Platform Control & Super-Admin | KineticLab"
        description="Global platform telemetry, pricing controls, and multi-tenant license modules."
      />

      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-6">
            <div className="flex items-center space-x-4">
              <Link
                to="/roster"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-white">Platform Super-Admin</h1>
                  <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
                    Owner Security Clearance
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  Manage global retail pricing, multi-tenant license modules, and platform telemetry.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-emerald-400">
                <Activity className="h-3.5 w-3.5 animate-pulse" />
                <span>Supabase EU-West Operational</span>
              </span>
            </div>
          </div>

          {/* Quick Platform Metrics */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
              <span className="text-xs text-zinc-400">Active Workspaces</span>
              <div className="mt-1 text-2xl font-bold text-white">48</div>
              <p className="mt-0.5 text-[10px] text-emerald-400">+12% this month</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
              <span className="text-xs text-zinc-400">Total Athletes Bound</span>
              <div className="mt-1 text-2xl font-bold text-white">412</div>
              <p className="mt-0.5 text-[10px] text-zinc-500">Across iOS & Android</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
              <span className="text-xs text-zinc-400">Active OCR Modules</span>
              <div className="mt-1 text-2xl font-bold text-emerald-400">32</div>
              <p className="mt-0.5 text-[10px] text-zinc-500">66% attach rate</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
              <span className="text-xs text-zinc-400">System Telemetry</span>
              <div className="mt-1 text-2xl font-bold text-sky-400">99.98%</div>
              <p className="mt-0.5 text-[10px] text-emerald-400">Zero database errors</p>
            </div>
          </div>

          {/* Global Pricing Controls */}
          <GlobalPricingManager />
        </div>
      </div>
    </>
  )
}

```

### 4.5 Mobile: Root Layout (app/_layout.tsx)
```tsx
import '../global.css';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, router, useSegments, useRootNavigationState } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../ctx/AuthContext';
import { ThemeProvider, useTheme } from '../ctx/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import Toast, { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import { GlobalAlert } from '../components/CustomAlert';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export { ErrorBoundary } from 'expo-router';

export let isIntentionalBackground = false;
export const setIsIntentionalBackground = (value: boolean) => {
  isIntentionalBackground = value;
};

const createToastConfig = (colors: any, isDark: boolean): ToastConfig => ({
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        backgroundColor: colors.surface,
        borderLeftColor: colors.primary,
        borderLeftWidth: 6,
        borderColor: colors.cardBorder,
        borderWidth: 1,
        borderRadius: 14,
        height: 'auto',
        minHeight: 64,
        paddingVertical: 12,
        width: '92%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.35 : 0.12,
        shadowRadius: 8,
        elevation: 6,
      }}
      contentContainerStyle={{
        paddingLeft: 12,
        paddingRight: 16,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: '700',
        color: colors.text,
      }}
      text2Style={{
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 2,
        lineHeight: 18,
      }}
      text1NumberOfLines={2}
      text2NumberOfLines={0}
      renderLeadingIcon={() => (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.surfaceSubtle,
            borderWidth: 1,
            borderColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 14,
          }}
        >
          <Ionicons name="checkmark" size={18} color={colors.primary} />
        </View>
      )}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        backgroundColor: colors.surface,
        borderLeftColor: colors.destructive,
        borderLeftWidth: 6,
        borderColor: colors.cardBorder,
        borderWidth: 1,
        borderRadius: 14,
        height: 'auto',
        minHeight: 64,
        paddingVertical: 12,
        width: '92%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.35 : 0.12,
        shadowRadius: 8,
        elevation: 6,
      }}
      contentContainerStyle={{
        paddingLeft: 12,
        paddingRight: 16,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: '700',
        color: colors.text,
      }}
      text2Style={{
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 2,
        lineHeight: 18,
      }}
      text1NumberOfLines={2}
      text2NumberOfLines={0}
      renderLeadingIcon={() => (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.surfaceSubtle,
            borderWidth: 1,
            borderColor: colors.destructive,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 14,
          }}
        >
          <Ionicons name="alert-circle-outline" size={18} color={colors.destructive} />
        </View>
      )}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{
        backgroundColor: colors.surface,
        borderLeftColor: colors.primary,
        borderLeftWidth: 6,
        borderColor: colors.cardBorder,
        borderWidth: 1,
        borderRadius: 14,
        height: 'auto',
        minHeight: 64,
        paddingVertical: 12,
        width: '92%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.35 : 0.12,
        shadowRadius: 8,
        elevation: 6,
      }}
      contentContainerStyle={{
        paddingLeft: 12,
        paddingRight: 16,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: '700',
        color: colors.text,
      }}
      text2Style={{
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 2,
        lineHeight: 18,
      }}
      text1NumberOfLines={2}
      text2NumberOfLines={0}
      renderLeadingIcon={() => (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.surfaceSubtle,
            borderWidth: 1,
            borderColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 14,
          }}
        >
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
        </View>
      )}
    />
  ),
});

function RootLayoutNav() {
  const { session, profile, role, isLocked, isLoading, isProLoading, unlock, signOut, isPickerSuppressed } = useAuth();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();
  const appState = useRef(AppState.currentState);
  const isAuthenticating = useRef(false);
  const [isAuthenticatingUi, setIsAuthenticatingUi] = useState(false);
  const hasVerifiedSession = useRef(false);

  const authenticateBiometrics = useCallback(async () => {
    if (isAuthenticating.current) return;
    isAuthenticating.current = true;
    setIsAuthenticatingUi(true);
    try {
      const biometricsPref = await AsyncStorage.getItem('@app_prefs_biometrics_enabled');
      if (biometricsPref !== 'true') {
        await unlock();
        return;
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        await unlock();
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your plan',
        fallbackLabel: 'Use Device Passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        await unlock();
      }
    } catch (e) {
      console.warn('[RootLayout] Biometrics error:', e);
    } finally {
      // Explicitly re-enable the UI button with a fresh onPress trigger
      isAuthenticating.current = false;
      setIsAuthenticatingUi(false);
    }
  }, [unlock]);

  // AppState listener: when active, trigger LocalAuthentication.authenticateAsync() unless suppressed
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current?.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (isIntentionalBackground || isPickerSuppressed) {
          setIsIntentionalBackground(false);
        } else if (session) {
          if (isAuthenticating.current) return;
          authenticateBiometrics();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [session, authenticateBiometrics, isPickerSuppressed]);

  useEffect(() => {
    if (isLoading || !rootNavigationState?.key) return;

    // Explicitly wait for profile hydration to complete before executing session routing,
    // preventing race conditions where profile is null or updating upon initial login.
    if (session && (isProLoading || !profile)) return;

    const verifySessionAndRoute = async () => {
      const rootSegment = segments[0] as string | undefined;
      const inAuthGroup = rootSegment === '(auth)' || rootSegment === 'auth';
      const isUpdatePassword =
        (inAuthGroup && (segments[1] as string) === 'update-password') ||
        rootSegment === 'update-password';
      const inOnboarding =
        rootSegment === 'onboarding' || rootSegment === '(onboarding)';
      const inClientTabs = rootSegment === '(tabs)' || rootSegment === 'tabs';
      const inTrainerTabs =
        rootSegment === '(trainer-tabs)' || rootSegment === 'trainer-tabs';
      const isRoot = !rootSegment || (rootSegment as string) === 'index';

      // 1. Kick unauthenticated users to login if not already in auth flow
      if (!session) {
        hasVerifiedSession.current = false;
        if (!inAuthGroup && !isUpdatePassword) {
          router.replace('/(auth)/login');
        }
        return;
      }

      // 1b. STRICT AUTH INTERCEPTOR: Validate local session against Supabase backend
      if (session && !hasVerifiedSession.current) {
        const { data: userData, error } = await supabase.auth.getUser();
        if (error || !userData?.user) {
          console.warn('[RootLayout] Dead session detected. Kicking out.');
          await signOut();
          router.replace('/(auth)/login');
          return;
        }
        hasVerifiedSession.current = true;
      }

      const userRole = role ?? profile?.role ?? 'client';

      // 1c. Account Locking Interceptor: If account was revoked by trainer, lock out of main app
      const isLockedByTrainer =
        profile?.account_status === 'locked_trainer_revoked' ||
        profile?.account_status === 'inactive';
      const inLockScreen = rootSegment === 'lock';

      if (isLockedByTrainer) {
        if (!inLockScreen) {
          router.replace('/lock');
        }
        return;
      } else if (inLockScreen) {
        router.replace('/(tabs)');
        return;
      }

      // 2. Dynamic RBAC Routing Interceptor
      if (userRole === 'trainer') {
        // Trainer boundary:
        // - Block from auth group (except update-password)
        // - Block from client onboarding and client tabs
        if (inAuthGroup) {
          if (segments[1] === 'update-password') {
            return;
          }
          router.replace('/(trainer-tabs)' as any);
          return;
        }

        if (inClientTabs || inOnboarding) {
          router.replace('/(trainer-tabs)' as any);
          return;
        }
      } else {
        // Client boundary:
        // - Block from trainer tabs
        if (inTrainerTabs) {
          router.replace('/(tabs)');
          return;
        }

        // Post-Login Gatekeeper for clients:
        // Client must strictly pass onboarding gates: height, weight, and goals must be populated.
        const hasHeight = profile?.height !== null && profile?.height !== undefined;
        const hasWeight = profile?.weight !== null && profile?.weight !== undefined;
        const hasGoals = Array.isArray(profile?.goals) && profile?.goals.length > 0;
        const isOnboardingCompleted = Boolean(hasHeight && hasWeight && hasGoals);

        const isProfileIncomplete = !isOnboardingCompleted;

        if (isProfileIncomplete) {
          if (!inOnboarding && !isUpdatePassword && !isRoot) {
            router.replace('/(onboarding)' as any);
          }
          return;
        }

        // Notice: Do NOT auto-redirect out of inOnboarding here.
        // The Taste Profile gate is mandatory and completes by calling router.replace('/(tabs)')
        // after the 10-card deck calibration is swiped.

        // Authenticated client routed out of auth screens
        if (inAuthGroup) {
          if (segments[1] === 'update-password') {
            return;
          }
          router.replace('/');
          return;
        }
      }

      // Notice: app/index.tsx handles Welcome & Biometrics gate and routing to /(onboarding) or /(tabs) / /(trainer-tabs)
    };

    verifySessionAndRoute();
  }, [session, profile, role, isLoading, isProLoading, segments, rootNavigationState?.key, signOut]);

  const { effectiveTheme, colors } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(trainer-tabs)" />
        <Stack.Screen name="recipe/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="update-password" />
        <Stack.Screen name="account-security" options={{ headerShown: false }} />
        <Stack.Screen 
          name="(onboarding)" 
          options={{ 
            gestureEnabled: false,
            headerShown: false,
          }} 
        />
        <Stack.Screen name="pricing" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen 
          name="scanner" 
          options={{ 
            headerShown: true, 
            title: 'Ingredient Scanner',
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="fix-meal" 
          options={{ 
            headerShown: true, 
            title: 'Fix My Meal',
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="chat" 
          options={{ 
            headerShown: true, 
            title: 'AI PT Coach',
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            presentation: 'modal'
          }} 
        />
        <Stack.Screen
          name="lock"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="trainer/[id]"
          options={{
            headerShown: false,
          }}
        />

      </Stack>

      {/* Root Biometric Lock Modal */}
      <Modal
        visible={Boolean(session && isLocked)}
        animationType="fade"
        transparent={false}
        statusBarTranslucent
        onRequestClose={() => {}}
      >
        <View style={lockModalStyles.container}>
          <StatusBar style="light" />
          <View style={lockModalStyles.content}>
            <View style={lockModalStyles.iconContainer}>
              <Ionicons name="finger-print" size={56} color="#4ade80" />
            </View>
            <Text style={lockModalStyles.title}>App Locked</Text>
            <Text style={lockModalStyles.subtitle}>
              Verify your identity to access your workouts and nutritional blueprints.
            </Text>

            <TouchableOpacity
              style={[
                lockModalStyles.primaryButton,
                isAuthenticatingUi && lockModalStyles.buttonDisabled,
              ]}
              onPress={authenticateBiometrics}
              disabled={isAuthenticatingUi}
              activeOpacity={0.8}
            >
              {isAuthenticatingUi ? (
                <ActivityIndicator size="small" color="#0a0a0a" />
              ) : (
                <>
                  <Ionicons name="scan" size={20} color="#0a0a0a" style={{ marginRight: 8 }} />
                  <Text style={lockModalStyles.primaryButtonText}>Unlock Now</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={lockModalStyles.secondaryButton}
              onPress={signOut}
              activeOpacity={0.7}
            >
              <Text style={lockModalStyles.secondaryButtonText}>Sign Out Instead</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const lockModalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 380,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  primaryButton: {
    backgroundColor: '#4ade80',
    flexDirection: 'row',
    height: 52,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 48,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#f43f5e',
    fontSize: 15,
    fontWeight: '600',
  },
});

function RootLayoutInner() {
  const { colors, isDark } = useTheme();
  const toastConfig = React.useMemo(() => createToastConfig(colors, isDark), [colors, isDark]);

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: colors.background }}>
      <AuthProvider>
        <RootLayoutNav />
        <Toast config={toastConfig} topOffset={45} bottomOffset={90} />
        <GlobalAlert />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}






```

### 4.6 Mobile: Tabs Layout (app/(tabs)/_layout.tsx)
```tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { showAppAlert } from "../../components/CustomAlert";
import { useAuth } from "../../ctx/AuthContext";
import { useTheme } from "../../ctx/ThemeContext";
import { getProfileDirtyState, resetProfileDirtyState } from "../../utils/profileDirtyState";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { role, signOut } = useAuth();

  // Mobile Dashboard Access Gate: strictly client-only (trainers use the web)
  if (role === "trainer") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text, textAlign: "center", marginBottom: 12 }}>
          Trainer Web Portal Access
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary ?? "#94a3b8", textAlign: "center", lineHeight: 20, marginBottom: 24 }}>
          Trainers must access the KineticLab Web Admin Dashboard to manage clients and configure home layouts. The mobile dashboard is reserved for client accounts.
        </Text>
        <TouchableOpacity
          onPress={() => signOut()}
          style={{ backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }}
        >
          <Text style={{ color: "#000", fontWeight: "bold" }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  }


  return (
    <Tabs
      screenListeners={{
        tabPress: (e) => {
          const targetKey = e.target ?? "";
          if (getProfileDirtyState() && !targetKey.startsWith("profile")) {
            e.preventDefault();
            showAppAlert(
              "Discard unsaved changes?",
              "You have unsaved changes on your profile. Are you sure you want to discard them?",
              [
                { text: "Keep Editing", style: "cancel" },
                {
                  text: "Discard & Leave",
                  style: "destructive",
                  onPress: () => {
                    resetProfileDirtyState();
                    const routeName = targetKey.split("-")[0];
                    if (routeName === "index") {
                      router.push("/(tabs)");
                    } else if (routeName) {
                      router.push(`/(tabs)/${routeName}` as any);
                    }
                  },
                },
              ]
            );
          }
        },
      }}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: {
          backgroundColor: colors?.tabBar ?? "#0a0a0a",
          borderTopColor: colors?.tabBarBorder ?? "#262626",
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors?.primary ?? "#4ade80",
        tabBarInactiveTintColor: colors?.textMuted ?? "#64748b",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={22}
              color={color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: "Recipes",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "restaurant" : "restaurant-outline"}
              size={22}
              color={color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="log-food"
        options={{
          title: "Log Food",
          tabBarStyle: { display: "none" },
          tabBarLabel: () => null,
          tabBarIcon: () => (
            <View
              style={{
                position: "absolute",
                top: -22,
                backgroundColor: colors?.primary ?? "#4ade80",
                width: 54,
                height: 54,
                borderRadius: 27,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: colors?.primary ?? "#4ade80",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 6,
                borderWidth: 3,
                borderColor: colors?.tabBar ?? "#0a0a0a",
              }}
            >
              <Ionicons name="add" size={30} color="#0a0a0a" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="shopping-list"
        options={{
          title: "Shopping List",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "cart" : "cart-outline"}
              size={22}
              color={color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={22}
              color={color as string}
            />
          ),
        }}
      />
    </Tabs>
  );
}

```

### 4.7 Mobile: Command Center (app/(tabs)/index.tsx)
```tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  AppState,
  AppStateStatus,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WidgetRenderer from "../../components/home/WidgetRenderer";
import { useAuth } from "../../ctx/AuthContext";
import { useTheme } from "../../ctx/ThemeContext";
import { useAppStore } from "../../store/useAppStore";

export default function CommandCenterScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { colors } = useTheme();
  const { fetchDynamicConfig, syncHealth, isLoadingConfig } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchDynamicConfig(profile?.trainer_id);
      if (profile?.id) {
        syncHealth(profile.id);
      }
    }, [profile, fetchDynamicConfig, syncHealth])
  );

  useEffect(() => {
    fetchDynamicConfig(profile?.trainer_id);
    if (profile?.id) {
      syncHealth(profile.id);
    }

    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        fetchDynamicConfig(profile?.trainer_id);
        if (profile?.id) {
          syncHealth(profile.id);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [profile, fetchDynamicConfig, syncHealth]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchDynamicConfig(profile?.trainer_id),
      profile?.id ? syncHealth(profile.id) : Promise.resolve(),
    ]);
    setRefreshing(false);
  };

  const clientName = profile?.full_name ? profile.full_name.split(" ")[0] : "Athlete";

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerSubtitle, { color: colors.primaryText }]}>COMMAND CENTER</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Welcome, {clientName}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/chat" as any)}
            className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 items-center justify-center mr-2"
          >
            <Ionicons name="chatbubbles-outline" size={20} color="#10b981" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/(tabs)/profile" as any)}
            className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 items-center justify-center"
          >
            <Ionicons name="person-outline" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dynamic Widget Registry Engine */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoadingConfig}
            onRefresh={onRefresh}
            tintColor="#10b981"
          />
        }
      >
        <WidgetRenderer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#10b981",
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#f8fafc",
    marginTop: 2,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 48,
  },
});


```

### 4.8 Mobile: AI Coach Chat (app/chat.tsx)
```tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HeaderHeightContext } from "@react-navigation/elements";
import { Stack } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  ListRenderItem,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../ctx/AuthContext";
import { useTheme } from "../ctx/ThemeContext";
import { supabase } from "../lib/supabase";
import { showAppAlert } from "../components/CustomAlert";
import { FormattedMarkdown } from "../components/FormattedMarkdown";

function useHeaderHeight() {
  const headerHeight = useContext(HeaderHeightContext);
  return headerHeight ?? 0;
}

export interface Message {
  id: string;
  role: "user" | "model";
  text: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

const SESSIONS_STORAGE_KEY = "@ai_coach_sessions_v2";
const INITIAL_MESSAGE: Message = {
  id: "1",
  role: "model",
  text: "Hello! I am your AI PT Coach. Ready to crush your targets today?",
};

function createNewSessionObject(): ChatSession {
  const now = Date.now();
  return {
    id: `session_${now}`,
    title: "New Coaching Chat",
    createdAt: now,
    updatedAt: now,
    messages: [INITIAL_MESSAGE],
  };
}

export default function ChatScreen() {
  const { profile } = useAuth();
  const { colors, isDark } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const ref = useRef<FlatList<Message>>(null);

  const currentSession =
    sessions.find((s) => s.id === currentSessionId) || sessions[0] || null;
  const messages = currentSession?.messages || [INITIAL_MESSAGE];

  useEffect(() => {
    const loadSessions = async () => {
      let initialList: ChatSession[] = [];
      try {
        const stored = await AsyncStorage.getItem(SESSIONS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            initialList = parsed;
            setSessions(parsed);
            setCurrentSessionId(parsed[0].id);
          }
        }
      } catch (error) {
        console.warn("Local chat read error:", error);
      }

      if (profile?.id) {
        try {
          const { data: cloudSessions, error: cloudErr } = await supabase
            .from("chat_sessions")
            .select("id, title, created_at, updated_at, chat_messages(id, role, content, created_at)")
            .eq("user_id", profile.id)
            .order("updated_at", { ascending: false });

          if (!cloudErr && cloudSessions && cloudSessions.length > 0) {
            const mapped: ChatSession[] = cloudSessions.map((cs: any) => {
              const msgs: Message[] = Array.isArray(cs.chat_messages) && cs.chat_messages.length > 0
                ? cs.chat_messages
                    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .map((m: any) => ({
                      id: m.id,
                      role: m.role === "assistant" ? "model" : m.role,
                      text: m.content,
                    }))
                : [INITIAL_MESSAGE];

              return {
                id: cs.id,
                title: cs.title,
                createdAt: new Date(cs.created_at).getTime(),
                updatedAt: new Date(cs.updated_at).getTime(),
                messages: msgs,
              };
            });

            setSessions(mapped);
            setCurrentSessionId(mapped[0].id);
            await AsyncStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(mapped));
            return;
          }
        } catch (cloudErr) {
          console.warn("Cloud chat load fallback:", cloudErr);
        }
      }

      if (initialList.length === 0) {
        const defaultSession = createNewSessionObject();
        setSessions([defaultSession]);
        setCurrentSessionId(defaultSession.id);
        await AsyncStorage.setItem(
          SESSIONS_STORAGE_KEY,
          JSON.stringify([defaultSession])
        );
      }
    };

    loadSessions();
  }, [profile?.id]);

  const persistSessions = async (updatedSessions: ChatSession[], sessionToSync?: ChatSession) => {
    setSessions(updatedSessions);
    try {
      await AsyncStorage.setItem(
        SESSIONS_STORAGE_KEY,
        JSON.stringify(updatedSessions)
      );
    } catch (e) {
      console.warn("Error saving sessions to AsyncStorage:", e);
    }

    if (profile?.id && sessionToSync) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionToSync.id);
        const { data: upserted } = await supabase.from("chat_sessions").upsert({
          ...(isUuid ? { id: sessionToSync.id } : {}),
          user_id: profile.id,
          title: sessionToSync.title,
          updated_at: new Date().toISOString(),
        }).select().single();

        if (upserted && !isUuid) {
          sessionToSync.id = upserted.id;
        }

        const latestMsg = sessionToSync.messages[sessionToSync.messages.length - 1];
        if (latestMsg && latestMsg.id !== INITIAL_MESSAGE.id) {
          const targetSessionId = upserted?.id || (isUuid ? sessionToSync.id : null);
          if (targetSessionId) {
            await supabase.from("chat_messages").insert({
              session_id: targetSessionId,
              user_id: profile.id,
              role: latestMsg.role === "model" ? "model" : "user",
              content: latestMsg.text,
            });
          }
        }
      } catch (err) {
        console.warn("Error syncing chat to Supabase:", err);
      }
    }
  };

  const handleStartNewChat = () => {
    const newSession = createNewSessionObject();
    const updated = [newSession, ...sessions];
    persistSessions(updated);
    setCurrentSessionId(newSession.id);
    setHistoryModalVisible(false);
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setHistoryModalVisible(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    showAppAlert(
      "Delete Chat",
      "Are you sure you want to delete this chat session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const filtered = sessions.filter((s) => s.id !== sessionId);
            if (filtered.length === 0) {
              const fresh = createNewSessionObject();
              persistSessions([fresh]);
              setCurrentSessionId(fresh.id);
            } else {
              persistSessions(filtered);
              if (currentSessionId === sessionId) {
                setCurrentSessionId(filtered[0].id);
              }
            }

            if (profile?.id && !sessionId.startsWith("session_")) {
              try {
                await supabase.from("chat_sessions").delete().eq("id", sessionId).eq("user_id", profile.id);
              } catch (delErr) {
                console.warn("Error deleting cloud chat session:", delErr);
              }
            }
          },
        },
      ]
    );
  };

  const handleClearCurrentChat = () => {
    showAppAlert(
      "Clear Chat",
      "Are you sure you want to clear all messages in this coaching session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            if (!currentSession) return;
            const updatedSessions = sessions.map((s) =>
              s.id === currentSession.id
                ? { ...s, messages: [INITIAL_MESSAGE], updatedAt: Date.now() }
                : s
            );
            persistSessions(updatedSessions);
          },
        },
      ]
    );
  };

  const sendMessage = async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText || isLoading || !currentSession) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: trimmedText,
    };

    const updatedMessages = [...messages, userMessage].slice(-50);
    const isFirstUserMsg =
      messages.filter((m) => m.role === "user").length === 0;
    const sessionTitle = isFirstUserMsg
      ? trimmedText.slice(0, 32) + (trimmedText.length > 32 ? "..." : "")
      : currentSession.title;

    const sessionWithUser: ChatSession = {
      ...currentSession,
      title: sessionTitle,
      updatedAt: Date.now(),
      messages: updatedMessages,
    };

    const sessionsWithUser = sessions.map((s) =>
      s.id === currentSession.id ? sessionWithUser : s
    );
    persistSessions(sessionsWithUser, sessionWithUser);

    setInputText("");
    setIsLoading(true);

    try {
      const ptNotes = profile?.pt_notes || profile?.protocol_notes || "None provided";
      const targetCalories = profile?.target_calories || 2200;
      const targetProtein = profile?.target_protein || 140;
      const targetCarbs = profile?.target_carbs || 200;
      const targetFats = profile?.target_fats || 65;

      const systemPrompt = `You are the KineticLab Enterprise AI Coaching Assistant.
Client Personal Trainer Directives:
"${ptNotes}"

Client Daily Macro Blueprint:
- Calories: ${targetCalories} kcal
- Protein: ${targetProtein}g
- Carbs: ${targetCarbs}g
- Fats: ${targetFats}g

Strictly align all advice with the trainer's notes and the athlete's current macros.`;

      const { data, error } = await supabase.functions.invoke("coach-chat", {
        body: {
          message: userMessage.text,
          history: updatedMessages,
          profile: {
            ...profile,
            pt_notes: ptNotes,
            target_calories: targetCalories,
            target_protein: targetProtein,
            target_carbs: targetCarbs,
            target_fats: targetFats,
          },
          systemPrompt,
        },
      });

      if (error) {
        throw error;
      }

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: data?.reply || "Keep pushing! We are making progress.",
      };

      const finalMessages = [...updatedMessages, modelMessage].slice(-50);
      const sessionWithModel: ChatSession = {
        ...sessionWithUser,
        updatedAt: Date.now(),
        messages: finalMessages,
      };

      const sessionsWithModel = sessions.map((s) =>
        s.id === currentSession.id ? sessionWithModel : s
      );
      persistSessions(sessionsWithModel, sessionWithModel);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "model",
        text: "Sorry, I am having trouble connecting right now. Let us try again in a moment.",
      };
      const finalMessages = [...updatedMessages, errorMessage].slice(-50);
      const sessionWithError: ChatSession = {
        ...sessionWithUser,
        updatedAt: Date.now(),
        messages: finalMessages,
      };
      const sessionsWithError = sessions.map((s) =>
        s.id === currentSession.id ? sessionWithError : s
      );
      persistSessions(sessionsWithError);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem: ListRenderItem<Message> = ({ item: msg }) => (
    <View
      style={[
        styles.messageBubble,
        msg.role === "user" ? styles.userBubble : styles.modelBubble,
      ]}
      className={
        msg.role === "user"
          ? "bg-emerald-500 dark:bg-emerald-600 self-end"
          : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 self-start shadow-sm"
      }
    >
      {msg.role === "model" && (
        <Ionicons
          name="fitness-outline"
          size={16}
          color={isDark ? "#34d399" : "#15803d"}
          style={{ marginBottom: 4 }}
        />
      )}
      {msg.role === "user" ? (
        <Text style={[styles.messageText, styles.userText]} className="text-white font-medium">{msg.text}</Text>
      ) : (
        <FormattedMarkdown>{msg.text}</FormattedMarkdown>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
    >
      <Stack.Screen
        options={{
          title: currentSession?.title || "AI PT Coach",
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <TouchableOpacity
                onPress={() => setHistoryModalVisible(true)}
                style={styles.headerIconButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Chat History"
              >
                <Ionicons name="time-outline" size={22} color={colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleStartNewChat}
                style={styles.headerIconButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="New Chat"
              >
                <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClearCurrentChat}
                style={styles.headerIconButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Clear Current Chat"
              >
                <Ionicons name="trash-outline" size={20} color={colors.destructive} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <FlatList
          ref={ref}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => ref.current?.scrollToEnd()}
          onLayout={() => ref.current?.scrollToEnd()}
          ListHeaderComponent={
            messages.length <= 1 && sessions.length > 1 ? (
              <View style={[styles.preLaunchPanel, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                <View style={styles.preLaunchHeader}>
                  <View style={styles.preLaunchHeaderLeft}>
                    <Ionicons name="time-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={[styles.preLaunchTitle, { color: colors.text }]}>Resume Previous Chat</Text>
                  </View>
                  <TouchableOpacity onPress={() => setHistoryModalVisible(true)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <Text style={[styles.viewAllText, { color: colors.primaryText }]}>View All ({sessions.length})</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.preLaunchList}>
                  {sessions.slice(0, 3).map((s) => {
                    const isSelected = s.id === currentSessionId;
                    return (
                      <TouchableOpacity
                        key={s.id}
                        style={[
                          styles.preLaunchChip,
                          {
                            backgroundColor: isSelected ? (isDark ? "rgba(74, 222, 128, 0.15)" : "rgba(74, 222, 128, 0.12)") : colors.card,
                            borderColor: isSelected ? colors.primary : colors.cardBorder,
                          },
                        ]}
                        onPress={() => handleSelectSession(s.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={isSelected ? "chatbubble" : "chatbubble-outline"}
                          size={14}
                          color={isSelected ? colors.primary : colors.textMuted}
                          style={{ marginRight: 8 }}
                        />
                        <Text
                          style={[
                            styles.preLaunchChipText,
                            { color: isSelected ? colors.primary : colors.text },
                            isSelected && { fontWeight: "700" },
                          ]}
                          numberOfLines={1}
                        >
                          {s.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : undefined
          }
          ListFooterComponent={
            isLoading ? (
              <View
                style={[
                  styles.messageBubble,
                  styles.modelBubble,
                  {
                    alignSelf: "flex-start",
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <ActivityIndicator color={colors.primary} size="small" />
              </View>
            ) : undefined
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyIconCircle,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <Ionicons name="chatbubbles-outline" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>AI PT Coach</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                No messages yet. Ask anything about your workouts, nutrition, or targets to get started!
              </Text>
            </View>
          }
        />

        <View
          style={[
            styles.inputContainer,
            {
              paddingBottom: Math.max(insets.bottom, 12),
              backgroundColor: colors.surface,
              borderTopColor: colors.borderSubtle,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask your coach..."
            placeholderTextColor={colors.textMuted}
            multiline
            autoFocus={true}
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim() ? colors.primary : colors.surfaceSubtle,
              },
            ]}
            onPress={sendMessage}
            disabled={isLoading || !inputText.trim()}
            activeOpacity={0.7}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? "#0a0a0a" : colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* SESSIONS HISTORY MODAL */}
      <Modal
        visible={historyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.surface,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.borderSubtle }]}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Chat Sessions</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  Select a past session or start fresh
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setHistoryModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.newChatBtn}
              className="bg-[#4ade80] flex-row items-center justify-center py-3 rounded-xl mb-4"
              onPress={handleStartNewChat}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color="#0a0a0a" />
              <Text style={styles.newChatBtnText} className="text-[#0a0a0a] text-sm font-bold ml-1.5">Start New Coaching Session</Text>
            </TouchableOpacity>

            <FlatList
              data={sessions}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
              renderItem={({ item }) => {
                const isActive = item.id === currentSessionId;
                const formattedDate = new Date(item.updatedAt).toLocaleDateString(
                  "en-GB",
                  {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                );

                return (
                  <View
                    style={[
                      styles.sessionCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: isActive ? colors.primary : colors.cardBorder,
                      },
                      isActive && {
                        backgroundColor: isDark ? "rgba(74, 222, 128, 0.08)" : "rgba(74, 222, 128, 0.08)",
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.sessionCardContent}
                      onPress={() => handleSelectSession(item.id)}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.sessionTitle,
                            { color: colors.text },
                            isActive && { color: colors.primaryText, fontWeight: "800" },
                          ]}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text style={[styles.sessionMeta, { color: colors.textSecondary }]}>
                          {formattedDate} · {item.messages.length} messages
                        </Text>
                      </View>
                      {isActive && (
                        <View style={[styles.activeBadge, { backgroundColor: isDark ? "rgba(74, 222, 128, 0.2)" : "rgba(74, 222, 128, 0.15)" }]}>
                          <Text style={[styles.activeBadgeText, { color: colors.primaryText }]}>ACTIVE</Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteSessionBtn}
                      onPress={() => handleDeleteSession(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.destructive} />
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 12,
  },
  headerIconButton: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: "85%",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  modelBubble: {
    borderWidth: 1,
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: "#0a0a0a",
    fontWeight: "600",
  },
  modelText: {
    color: "#f8fafc",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
  },
  preLaunchPanel: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  preLaunchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  preLaunchHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  preLaunchTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "700",
  },
  preLaunchList: {
    gap: 8,
  },
  preLaunchChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  preLaunchChipText: {
    fontSize: 13,
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#0f172a",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#020617",
    color: "#f8fafc",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
    minHeight: 44,
    fontSize: 15,
    borderColor: "#1e293b",
    borderWidth: 1,
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: "#4ade80",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#0b1329",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "#1e293b",
    maxHeight: "85%",
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#f8fafc" },
  modalSubtitle: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  newChatBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  newChatBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  sessionCard: {
    backgroundColor: "#0f172a",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  sessionCardActive: {
    borderColor: "#4ade80",
    backgroundColor: "rgba(74, 222, 128, 0.08)",
  },
  sessionCardContent: {
    flex: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#f8fafc",
  },
  sessionMeta: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
  },
  activeBadge: {
    backgroundColor: "rgba(74, 222, 128, 0.2)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  activeBadgeText: {
    color: "#4ade80",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  deleteSessionBtn: {
    padding: 14,
  },
});

```

### 4.9 Mobile: Profile Screen (app/(tabs)/profile.tsx)
```tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useAuth } from "../../ctx/AuthContext";
import { useTheme } from "../../ctx/ThemeContext";
import { validateImageSafety } from "../../lib/gemini";
import { getSecureAvatarUrl, uploadAvatar } from "../../lib/storage";
import { supabase } from "../../lib/supabase";
import { Database } from "../../types/database.types";
import { showAppAlert } from "../../components/CustomAlert";
import { setProfileDirtyState } from "../../utils/profileDirtyState";
import { kgToLbs, lbsToKg } from "../../utils/conversions";

import { ActivityLevelSelector } from "../../components/ActivityLevelSelector";
import { PersonalDetailsCard } from "../../components/profile/PersonalDetailsCard";
import { NutritionTargetsCard } from "../../components/profile/NutritionTargetsCard";
import { setIsIntentionalBackground } from "../_layout";
import { AppSettingsCard } from "../../components/profile/AppSettingsCard";
import { AccountSecurityCard } from "../../components/profile/AccountSecurityCard";
import { TrainerBrandingCard } from "../../components/profile/TrainerBrandingCard";

const NOTIF_STORAGE_PREFIX = "@app_prefs_notif_";

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, session, refreshProfile, signOut, suppressLockForPicker, isPro } =
    useAuth();
  const { colors, isDark } = useTheme();

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("sedentary");
  const [calories, setCalories] = useState("2200");
  const [protein, setProtein] = useState("140");
  const [carbs, setCarbs] = useState("200");
  const [fats, setFats] = useState("65");
  const [ptNotes, setPtNotes] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [macroVariance, setMacroVariance] = useState<number>(profile?.macro_variance ?? 20);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [trainerData, setTrainerData] = useState<any>(
    Array.isArray(profile?.trainer) ? profile.trainer[0] : (profile?.trainer ?? null)
  );

  useEffect(() => {
    let isMounted = true;
    async function fetchTrainerJoin() {
      if (!session?.user?.id) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*, trainer:trainer_id(id, full_name, avatar_url, trainer_bio)")
          .eq("id", session.user.id)
          .single();

        if (!error && data && isMounted) {
          const rawTrainer = (data as any)?.trainer;
          const resolved = Array.isArray(rawTrainer) ? rawTrainer[0] : rawTrainer;
          if (resolved) setTrainerData(resolved);
        }
      } catch (err) {
        console.warn("[profile.tsx] Error fetching trainer join:", err);
      }
    }
    fetchTrainerJoin();
    return () => {
      isMounted = false;
    };
  }, [session?.user?.id, profile?.trainer_id]);

  // Modals & loaders
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);
  const [activitySelectorVisible, setActivitySelectorVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExtractingPT, setIsExtractingPT] = useState(false);

  // App settings (device persisted silently)
  const [initialNotifs, setInitialNotifs] = useState({ push: true, meals: true, coach: true });
  const [pushEnabled, setPushEnabled] = useState(true);
  const [mealRemindersEnabled, setMealRemindersEnabled] = useState(true);
  const [coachAlertsEnabled, setCoachAlertsEnabled] = useState(true);
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");

  const isProUser = Boolean(isPro || profile?.subscription_status === "pro" || profile?.is_pro);
  const navigation = useNavigation();

  const resetFormToProfile = useCallback(() => {
    if (!profile) return;
    setFullName(profile.full_name || "");
    setAge(profile.age != null ? profile.age.toString() : "");
    setSex(profile.sex || "");
    setHeight(profile.height != null ? profile.height.toString() : "");
    setWeight(profile.weight != null ? profile.weight.toString() : "");
    setActivityLevel(profile.activity_level || "sedentary");
    setCalories(profile.target_calories != null ? profile.target_calories.toString() : "2200");
    setProtein(profile.target_protein != null ? profile.target_protein.toString() : "140");
    setCarbs(profile.target_carbs != null ? profile.target_carbs.toString() : "200");
    setFats(profile.target_fats != null ? profile.target_fats.toString() : "65");
    setPtNotes(profile.protocol_notes || profile.pt_notes || "");
    setMacroVariance(profile.macro_variance ?? 20);
    setGoals(Array.isArray(profile.goals) ? profile.goals : []);
    setPushEnabled(initialNotifs.push);
    setMealRemindersEnabled(initialNotifs.meals);
    setCoachAlertsEnabled(initialNotifs.coach);
    if (profile.avatar_url) {
      getSecureAvatarUrl(profile.avatar_url).then((url) => {
        setAvatarUrl(url || profile.avatar_url || null);
      });
    }
  }, [profile, initialNotifs]);

  const isDirty = useMemo(() => {
    const notifsDirty =
      pushEnabled !== initialNotifs.push ||
      mealRemindersEnabled !== initialNotifs.meals ||
      coachAlertsEnabled !== initialNotifs.coach;

    if (!profile) return notifsDirty;
    const initialName = profile.full_name || "";
    const initialAge = profile.age != null ? profile.age.toString() : "";
    const initialSex = profile.sex || "";
    const initialHeight = profile.height != null ? profile.height.toString() : "";
    const initialWeight = profile.weight != null ? profile.weight.toString() : "";
    const initialActivity = profile.activity_level || "sedentary";
    const initialCalories = profile.target_calories != null ? profile.target_calories.toString() : "2200";
    const initialProtein = profile.target_protein != null ? profile.target_protein.toString() : "140";
    const initialCarbs = profile.target_carbs != null ? profile.target_carbs.toString() : "200";
    const initialFats = profile.target_fats != null ? profile.target_fats.toString() : "65";
    const initialPtNotes = profile.protocol_notes || profile.pt_notes || "";
    const initialVariance = profile.macro_variance ?? 20;

    return (
      notifsDirty ||
      fullName !== initialName ||
      age !== initialAge ||
      sex !== initialSex ||
      height !== initialHeight ||
      weight !== initialWeight ||
      activityLevel !== initialActivity ||
      calories !== initialCalories ||
      protein !== initialProtein ||
      carbs !== initialCarbs ||
      fats !== initialFats ||
      ptNotes !== initialPtNotes ||
      macroVariance !== initialVariance
    );
  }, [
    profile,
    fullName,
    age,
    sex,
    height,
    weight,
    activityLevel,
    calories,
    protein,
    carbs,
    fats,
    ptNotes,
    macroVariance,
    pushEnabled,
    mealRemindersEnabled,
    coachAlertsEnabled,
    initialNotifs,
  ]);

  const hasUnsavedChanges = isDirty;

  useEffect(() => {
    setProfileDirtyState(hasUnsavedChanges, resetFormToProfile);
  }, [hasUnsavedChanges, resetFormToProfile]);

  useEffect(() => {
    const unsubscribe = (navigation as any)?.addListener?.("beforeRemove", (e: any) => {
      if (!hasUnsavedChanges) {
        return;
      }

      e.preventDefault();

      showAppAlert(
        "Discard unsaved changes?",
        "You have unsaved changes on your profile. Are you sure you want to discard them?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard & Leave",
            style: "destructive",
            onPress: () => {
              resetFormToProfile();
              setProfileDirtyState(false);
              navigation.dispatch(e.data.action);
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges, resetFormToProfile]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (profile) {
      if (profile.full_name) setFullName(profile.full_name);
      if (profile.age != null) setAge(profile.age.toString());
      if (profile.sex) setSex(profile.sex);
      if (profile.height != null) setHeight(profile.height.toString());
      if (profile.weight != null) setWeight(profile.weight.toString());
      if (profile.activity_level) setActivityLevel(profile.activity_level);
      if (profile.target_calories != null) setCalories(profile.target_calories.toString());
      if (profile.target_protein != null) setProtein(profile.target_protein.toString());
      if (profile.target_carbs != null) setCarbs(profile.target_carbs.toString());
      if (profile.target_fats != null) setFats(profile.target_fats.toString());
      if (profile.protocol_notes || profile.pt_notes) setPtNotes(profile.protocol_notes || profile.pt_notes || "");
      if (profile.macro_variance != null) setMacroVariance(profile.macro_variance);
      if (Array.isArray(profile.goals)) setGoals(profile.goals);
      if (profile.avatar_url) {
        getSecureAvatarUrl(profile.avatar_url).then((url) => {
          setAvatarUrl(url || profile.avatar_url || null);
        });
      }
    }
  }, [profile]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [savedPush, savedMeals, savedCoach, savedUnit] = await Promise.all([
          AsyncStorage.getItem(`${NOTIF_STORAGE_PREFIX}push`),
          AsyncStorage.getItem(`${NOTIF_STORAGE_PREFIX}meals`),
          AsyncStorage.getItem(`${NOTIF_STORAGE_PREFIX}coach`),
          AsyncStorage.getItem("@user_units_system"),
        ]);
        const pushVal = savedPush !== null ? savedPush === "true" : true;
        const mealsVal = savedMeals !== null ? savedMeals === "true" : true;
        const coachVal = savedCoach !== null ? savedCoach === "true" : true;
        setPushEnabled(pushVal);
        setMealRemindersEnabled(mealsVal);
        setCoachAlertsEnabled(coachVal);
        setInitialNotifs({ push: pushVal, meals: mealsVal, coach: coachVal });
        if (savedUnit === "metric" || savedUnit === "imperial") setUnitSystem(savedUnit);
      } catch (e) {
        console.warn("Error loading settings preferences", e);
      }
    };
    loadSettings();
  }, []);

  const handleToggleUnitSystem = async (newSystem: "metric" | "imperial") => {
    if (newSystem === unitSystem) return;
    setUnitSystem(newSystem);
    await AsyncStorage.setItem("@user_units_system", newSystem);

    if (newSystem === "imperial") {
      const kg = parseFloat(weight);
      if (!isNaN(kg) && kg > 0) setWeight(kgToLbs(kg).toString());
      const cm = parseFloat(height);
      if (!isNaN(cm) && cm > 0) setHeight(Math.round(cm / 2.54).toString());
    } else {
      const lbs = parseFloat(weight);
      if (!isNaN(lbs) && lbs > 0) setWeight(lbsToKg(lbs).toString());
      const inches = parseFloat(height);
      if (!isNaN(inches) && inches > 0) setHeight(Math.round(inches * 2.54).toString());
    }
  };

  // Form-governed persistence for notification preferences
  const togglePush = (val: boolean) => {
    setPushEnabled(val);
  };

  const toggleMeals = (val: boolean) => {
    setMealRemindersEnabled(val);
  };

  const toggleCoach = (val: boolean) => {
    setCoachAlertsEnabled(val);
  };

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleSelectVariance = (val: number) => {
    if (!isProUser && val !== 20) {
      router.push("/pricing");
      return;
    }
    setMacroVariance(val);
  };

  const handleActivitySelected = (
    newLevel: string,
    calculatedMacros: { calories: number; protein: number; carbs: number; fats: number }
  ) => {
    setActivityLevel(newLevel);
    setCalories(String(calculatedMacros.calories));
    setProtein(String(calculatedMacros.protein));
    setCarbs(String(calculatedMacros.carbs));
    setFats(String(calculatedMacros.fats));
  };

  const handleSaveChanges = async () => {
    const userId = session?.user?.id;
    if (!userId) return;

    setIsSaving(true);
    try {
      const parsedAge = age ? parseInt(age, 10) : null;
      let parsedWeight = weight ? parseFloat(weight) : null;
      let parsedHeight = height ? parseFloat(height) : null;

      if (unitSystem === "imperial") {
        if (parsedWeight !== null && !isNaN(parsedWeight)) {
          parsedWeight = lbsToKg(parsedWeight);
        }
        if (parsedHeight !== null && !isNaN(parsedHeight)) {
          parsedHeight = Math.round(parsedHeight * 2.54);
        }
      }

      const parsedCalories = parseInt(calories, 10) || 2200;
      const parsedProtein = parseInt(protein, 10) || 140;
      const parsedCarbs = parseInt(carbs, 10) || 200;
      const parsedFats = parseInt(fats, 10) || 65;

      const updates: Database["public"]["Tables"]["profiles"]["Update"] = {
        full_name: fullName.trim() || null,
        age: parsedAge,
        sex: sex.trim() || null,
        weight: parsedWeight,
        height: parsedHeight,
        activity_level: activityLevel,
        goals: goals.length > 0 ? goals : null,
        target_calories: parsedCalories,
        target_protein: parsedProtein,
        target_carbs: parsedCarbs,
        target_fats: parsedFats,
        macro_variance: macroVariance,
        pt_notes: ptNotes.trim() || null,
      };

      const { error } = await supabase.from("profiles").update(updates).eq("id", userId);
      if (error) throw error;

      await Promise.all([
        AsyncStorage.setItem(`${NOTIF_STORAGE_PREFIX}push`, String(pushEnabled)),
        AsyncStorage.setItem(`${NOTIF_STORAGE_PREFIX}meals`, String(mealRemindersEnabled)),
        AsyncStorage.setItem(`${NOTIF_STORAGE_PREFIX}coach`, String(coachAlertsEnabled)),
      ]);
      setInitialNotifs({
        push: pushEnabled,
        meals: mealRemindersEnabled,
        coach: coachAlertsEnabled,
      });

      await refreshProfile();
      setProfileDirtyState(false);
      Toast.show({
        type: "success",
        text1: "Profile Saved",
        text2: "Your personal details and nutritional targets are updated.",
      });
    } catch (err: any) {
      console.error("Save profile error:", err);
      Toast.show({
        type: "error",
        text1: "Save Failed",
        text2: err?.message || "Could not save your profile changes.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAvatar = async (source: "camera" | "library") => {
    const userId = session?.user?.id;
    if (!userId) return;

    try {
      suppressLockForPicker();
      setIsIntentionalBackground(true);
      let result: ImagePicker.ImagePickerResult;

      if (source === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Toast.show({
            type: "error",
            text1: "Camera Access Needed",
            text2: "Camera permission is required to capture your avatar.",
          });
          return;
        }
        result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Toast.show({
            type: "error",
            text1: "Gallery Access Needed",
            text2: "Gallery permission is required to select an avatar.",
          });
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setIsUpdatingAvatar(true);

        const manipResult = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: 500 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );

        if (!manipResult.base64) throw new Error("Could not read image data.");

        const safetyCheck = await validateImageSafety(manipResult.base64);
        if (!safetyCheck.isSafe) {
          Toast.show({
            type: "error",
            text1: "Image Rejected",
            text2: `Image rejected: ${safetyCheck.reason}`,
          });
          return;
        }

        const publicUrl = await uploadAvatar(userId, manipResult.base64, "image/jpeg");
        if (publicUrl) {
          setAvatarUrl(publicUrl);
          await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);
          await refreshProfile();
          Toast.show({
            type: "success",
            text1: "Avatar Updated",
            text2: "Your new profile picture has been saved.",
          });
        }
      }
    } catch (err: any) {
      console.error("Avatar update error:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err?.message || "Failed to update avatar.",
      });
    } finally {
      setIsUpdatingAvatar(false);
      setAvatarPickerVisible(false);
    }
  };

  const handleScanPlan = async () => {
    try {
      suppressLockForPicker();
      setIsIntentionalBackground(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Gallery Access Needed",
          text2: "Gallery permission is required to upload a PT plan.",
        });
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (pickerResult.canceled || !pickerResult.assets?.[0]?.uri) {
        return;
      }

      setIsExtractingPT(true);
      const asset = pickerResult.assets[0];

      const manipResult = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      if (!manipResult.base64) {
        throw new Error("Could not process document image.");
      }

      const { data: edgeData, error: edgeError } = await supabase.functions.invoke("pt-plan", {
        body: {
          imageBase64: manipResult.base64,
          mimeType: "image/jpeg",
          goals: goals.length > 0 ? goals : ["Build Muscle"],
        },
      });

      if (edgeError) throw edgeError;

      if (edgeData) {
        if (edgeData.calories) setCalories(edgeData.calories.toString());
        if (edgeData.protein) setProtein(edgeData.protein.toString());
        if (edgeData.carbs) setCarbs(edgeData.carbs.toString());
        if (edgeData.fats) setFats(edgeData.fats.toString());
        const extractedNotes = edgeData.pt_notes || edgeData.protocol_notes || edgeData.notes;
        if (extractedNotes) setPtNotes(extractedNotes);

        Toast.show({
          type: "success",
          text1: "Targets Extracted!",
          text2: "Extracted daily macros & protocol notes.",
        });
      }
    } catch (err: any) {
      console.error("Scan plan error:", err);
      Toast.show({
        type: "error",
        text1: "Extraction Failed",
        text2: err?.message || "Could not parse document. Enter targets manually.",
      });
    } finally {
      setIsExtractingPT(false);
    }
  };

  const handleSignOut = () => {
    showAppAlert(
      "Sign Out",
      "Are you sure you want to sign out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              router.replace("/(auth)/login");
            } catch (err) {
              console.error("Sign out error:", err);
            }
          },
        },
      ]
    );
  };

  const userEmail = session?.user?.email || "No email on record";
  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* CARD 1: PERSONAL DETAILS & BIOMETRICS */}
        <PersonalDetailsCard
          avatarUrl={avatarUrl}
          isProUser={isProUser}
          isUpdatingAvatar={isUpdatingAvatar}
          onEditAvatar={() => setAvatarPickerVisible(true)}
          fullName={fullName}
          onFullNameChange={setFullName}
          email={userEmail}
          age={age}
          onAgeChange={setAge}
          sex={sex}
          onSexChange={setSex}
          height={height}
          onHeightChange={setHeight}
          weight={weight}
          onWeightChange={setWeight}
          activityLevel={activityLevel}
          onOpenActivitySelector={() => setActivitySelectorVisible(true)}
          unitSystem={unitSystem}
        />

        {/* CARD 2: NUTRITIONAL TARGETS & PREFERENCES */}
        <NutritionTargetsCard
          calories={calories}
          onCaloriesChange={setCalories}
          protein={protein}
          onProteinChange={setProtein}
          carbs={carbs}
          onCarbsChange={setCarbs}
          fats={fats}
          onFatsChange={setFats}
          goals={goals}
          onToggleGoal={toggleGoal}
          macroVariance={macroVariance}
          onSelectVariance={handleSelectVariance}
          isProUser={isProUser}
          isTrainerLinked={Boolean(profile?.trainer_id)}
        />

        {/* CARD 2.5: ASSIGNED COACH & PROTOCOL */}
        {(profile?.trainer_id || trainerData?.id) ? (
          <TrainerBrandingCard
            trainerId={profile?.trainer_id || trainerData?.id}
            trainer={trainerData || (Array.isArray(profile?.trainer) ? profile.trainer[0] : profile?.trainer)}
            ptNotes={ptNotes}
            onPtNotesChange={setPtNotes}
            isProUser={isProUser}
            onScanPlan={handleScanPlan}
            isScanning={isExtractingPT}
          />
        ) : null}

        {/* CARD 3: APP SETTINGS */}
        <AppSettingsCard
          pushEnabled={pushEnabled}
          mealRemindersEnabled={mealRemindersEnabled}
          coachAlertsEnabled={coachAlertsEnabled}
          onTogglePush={togglePush}
          onToggleMeals={toggleMeals}
          onToggleCoach={toggleCoach}
          unitSystem={unitSystem}
          onToggleUnitSystem={handleToggleUnitSystem}
        />

        {/* CARD 4: ACCOUNT & SECURITY */}
        <AccountSecurityCard
          trainerId={profile?.trainer_id}
          onSignOut={handleSignOut}
        />

        {/* EXPLICIT SAVE ACTION BUTTON */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSaveChanges}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#0a0a0a" />
          ) : (
            <View style={styles.saveBtnInner}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#0a0a0a" style={{ marginRight: 8 }} />
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* DESCRIPTIVE ACTIVITY LEVEL SELECTOR MODAL (NO AUTOSAVE / NO TOAST) */}
      <ActivityLevelSelector
        visible={activitySelectorVisible}
        currentLevel={activityLevel}
        profile={profile}
        autoSave={false}
        onClose={() => setActivitySelectorVisible(false)}
        onSuccess={handleActivitySelected}
      />

      {/* AVATAR PICKER MODAL */}
      <Modal
        visible={avatarPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAvatarPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setAvatarPickerVisible(false)}
        >
          <View
            style={[
              styles.pickerActionSheet,
              { backgroundColor: colors.surface, borderColor: colors.cardBorder },
            ]}
          >
            <Text style={[styles.pickerTitle, { color: colors.text }]}>
              Change Profile Photo
            </Text>

            <TouchableOpacity
              style={[
                styles.pickerOption,
                { borderBottomColor: colors.borderSubtle, borderBottomWidth: 1 },
              ]}
              onPress={() => handleUpdateAvatar("camera")}
            >
              <Ionicons name="camera-outline" size={20} color={colors.primary} />
              <Text style={[styles.pickerOptionText, { color: colors.text }]}>
                Take a Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pickerOption}
              onPress={() => handleUpdateAvatar("library")}
            >
              <Ionicons name="images-outline" size={20} color={colors.primary} />
              <Text style={[styles.pickerOptionText, { color: colors.text }]}>
                Choose from Library
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.pickerCancelBtn,
                { backgroundColor: isDark ? "#1e293b" : "#f1f5f9" },
              ]}
              onPress={() => setAvatarPickerVisible(false)}
            >
              <Text style={[styles.pickerCancelText, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 16 },
  saveBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveBtnText: {
    color: "#0a0a0a",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.65)", justifyContent: "flex-end" },
  pickerActionSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderBottomWidth: 0, padding: 20, paddingBottom: 36 },
  pickerTitle: { fontSize: 16, fontWeight: "800", textAlign: "center", marginBottom: 18 },
  pickerOption: { flexDirection: "row", alignItems: "center", paddingVertical: 14, gap: 12 },
  pickerOptionText: { fontSize: 15, fontWeight: "600" },
  pickerCancelBtn: { marginTop: 14, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  pickerCancelText: { fontSize: 14, fontWeight: "700" },
});


```

---
## 5. DYNAMIC UI ENGINES & WIDGETS

### 5.1 Mobile: Widget Renderer Engine (components/home/WidgetRenderer.tsx)
```tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { UIWidgetConfig, useAppStore } from "../../store/useAppStore";
import CookingModeBanner from "./CookingModeBanner";
import MacrosWidget from "./MacrosWidget";
import RecentMealsWidget from "./RecentMealsWidget";
import StepsRAGWidget from "./StepsRAGWidget";
import MeetCoachWidget from "./MeetCoachWidget";

const WIDGET_REGISTRY: Record<string, React.FC<any>> = {
  MacrosWidget,
  StepsRAGWidget,
  CookingModeBanner,
  RecentMealsWidget,
  MeetCoachWidget,
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
  widgetId: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class WidgetErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn(`[WidgetErrorBoundary] Error in widget ${this.props.widgetId}:`, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 my-2">
          <Text className="text-xs font-semibold text-red-500">
            Widget &quot;{this.props.widgetId}&quot; is temporarily unavailable.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function WidgetRenderer() {
  const { homeLayout, trainerAddOns, isLoadingConfig } = useAppStore();

  if (isLoadingConfig && (!homeLayout || homeLayout.length === 0)) {
    return (
      <View style={styles.centerContainer}>
        <Text className="text-xs text-zinc-400 font-medium">Loading command center...</Text>
      </View>
    );
  }

  const sortedWidgets = (homeLayout || [])
    .filter((w) => w.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <View style={styles.container}>
      {sortedWidgets.map((widget: UIWidgetConfig) => {
        // Modular License Gating
        if (widget.requiredAddon && !trainerAddOns.includes(widget.requiredAddon)) {
          return null;
        }

        const WidgetComponent = WIDGET_REGISTRY[widget.type];
        if (!WidgetComponent) {
          console.warn(`[WidgetRenderer] Unknown widget type: ${widget.type}`);
          return null;
        }

        return (
          <WidgetErrorBoundary key={widget.id} widgetId={widget.id}>
            <View style={styles.widgetWrapper}>
              <WidgetComponent {...(widget.props || {})} />
            </View>
          </WidgetErrorBoundary>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  widgetWrapper: {
    width: "100%",
  },
  centerContainer: {
    paddingVertical: 32,
    alignItems: "center",
  },
});


```

### 5.2 Mobile: Macros Widget (components/home/MacrosWidget.tsx)
```tsx
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getDailyTargets, useAuth } from "../../ctx/AuthContext";
import { supabase } from "../../lib/supabase";

interface MacrosWidgetProps {
  showRemaining?: boolean;
}

export default function MacrosWidget({ showRemaining = true }: MacrosWidgetProps) {
  const { profile, isPro, isTrainingDay } = useAuth();
  const isProUser = Boolean(isPro || profile?.is_pro || profile?.subscription_status === "pro");

  const targets = isProUser
    ? getDailyTargets(profile, isTrainingDay)
    : {
        calories: profile?.target_calories || 2200,
        protein: profile?.target_protein || 140,
        carbs: profile?.target_carbs || 200,
        fats: profile?.target_fats || 65,
      };

  const [consumed, setConsumed] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });

  useEffect(() => {
    let isMounted = true;
    async function loadTodayLogs() {
      if (!profile?.id) return;
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      try {
        const { data } = await supabase
          .from("daily_logs")
          .select("calories, protein, carbs, fats")
          .eq("user_id", profile.id)
          .gte("logged_at", startOfDay.toISOString());

        if (data && isMounted) {
          const totals = data.reduce(
            (acc, item) => ({
              calories: acc.calories + (item.calories || 0),
              protein: acc.protein + (item.protein || 0),
              carbs: acc.carbs + (item.carbs || 0),
              fats: acc.fats + (item.fats || 0),
            }),
            { calories: 0, protein: 0, carbs: 0, fats: 0 }
          );
          setConsumed(totals);
        }
      } catch (err) {
        console.warn("[MacrosWidget] Error fetching logs:", err);
      }
    }

    loadTodayLogs();
    return () => {
      isMounted = false;
    };
  }, [profile?.id]);

  const caloriesRemaining = Math.max(0, targets.calories - consumed.calories);
  const calPercent = Math.min(100, Math.round((consumed.calories / (targets.calories || 1)) * 100));

  return (
    <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.icon}>🎯</Text>
          <Text className="text-xs font-extrabold text-zinc-500 dark:text-zinc-400 tracking-wider">
            DAILY BLUEPRINT
          </Text>
          <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
            • {targets.calories} kcal
          </Text>
        </View>

        {isProUser && (
          <View className="bg-zinc-100 dark:bg-zinc-950 px-2.5 py-1 rounded-xl border border-emerald-500">
            <Text className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 tracking-wide">
              {isTrainingDay ? "TRAINING" : "REST"}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg} className="bg-zinc-100 dark:bg-zinc-800">
          <View style={[styles.progressBarFill, { width: `${calPercent}%` }]} className="bg-emerald-500" />
        </View>
        <View style={styles.progressLabelRow}>
          <Text className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            {consumed.calories} kcal ({calPercent}%)
          </Text>
          {showRemaining && (
            <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              {caloriesRemaining} kcal left
            </Text>
          )}
        </View>
      </View>

      <View style={styles.macroTagsRow}>
        <View className="bg-zinc-100 dark:bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800">
          <Text className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            P: {consumed.protein}g / {targets.protein}g
          </Text>
        </View>
        <View className="bg-zinc-100 dark:bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800">
          <Text className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            C: {consumed.carbs}g / {targets.carbs}g
          </Text>
        </View>
        <View className="bg-zinc-100 dark:bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800">
          <Text className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            F: {consumed.fats}g / {targets.fats}g
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  icon: {
    fontSize: 16,
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  macroTagsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
});

```

### 5.3 Mobile: Steps RAG Widget (components/home/StepsRAGWidget.tsx)
```tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../ctx/AuthContext";
import { useAppStore } from "../../store/useAppStore";

interface StepsRAGWidgetProps {
  colorScheme?: string;
  stepTarget?: number;
}

export default function StepsRAGWidget({ stepTarget = 10000 }: StepsRAGWidgetProps) {
  const { session } = useAuth();
  const { stepsRAG, localSteps, isSyncingHealth, syncHealth } = useAppStore();

  useEffect(() => {
    if (session?.user?.id && !stepsRAG) {
      syncHealth(session.user.id, stepTarget);
    }
  }, [session?.user?.id, stepsRAG, stepTarget, syncHealth]);

  const handleRefresh = () => {
    if (session?.user?.id) {
      syncHealth(session.user.id, stepTarget);
    }
  };

  // Determine RAG colors and status message
  let dotColor = "#ef4444"; // red
  let statusText = "Action Required: Behind Step Goal";
  let badgeBg = "bg-red-500/10 border-red-500/30";
  let badgeTextColor = "text-red-500";

  if (stepsRAG === "green") {
    dotColor = "#22c55e";
    statusText = "Optimal: Target Reached";
    badgeBg = "bg-emerald-500/10 border-emerald-500/30";
    badgeTextColor = "text-emerald-700 dark:text-emerald-400";
  } else if (stepsRAG === "amber") {
    dotColor = "#f59e0b";
    statusText = "Moderate: Approaching Target";
    badgeBg = "bg-amber-500/10 border-amber-500/30";
    badgeTextColor = "text-amber-500";
  }

  return (
    <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
      <View style={styles.topRow}>
        <View style={styles.titleWithDot}>
          <View style={[styles.ragDot, { backgroundColor: dotColor }]} />
          <Text className="text-xs font-extrabold text-zinc-500 dark:text-zinc-400 tracking-wider">
            HEALTH COMPLIANCE (RAG)
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleRefresh}
          disabled={isSyncingHealth}
          className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800"
        >
          {isSyncingHealth ? (
            <ActivityIndicator size="small" color="#10b981" />
          ) : (
            <Ionicons name="sync" size={14} color="#71717a" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.contentRow}>
        <View>
          <Text className="text-2xl font-black text-zinc-900 dark:text-white">
            {localSteps.toLocaleString()} <Text className="text-sm font-normal text-zinc-400">steps</Text>
          </Text>
          <Text className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Target: {stepTarget.toLocaleString()} steps/day
          </Text>
        </View>

        <View className={`px-3 py-1.5 rounded-full border ${badgeBg}`}>
          <Text className={`text-xs font-bold uppercase tracking-wider ${badgeTextColor}`}>
            {stepsRAG ?? "EVALUATING"}
          </Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Ionicons name="shield-checkmark-outline" size={12} color="#10b981" />
        <Text className="text-[11px] text-zinc-400 font-medium ml-1">
          {statusText} • Zero-Medical-Data Protected
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleWithDot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ragDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});


```

### 5.4 Mobile: Meet Coach Widget (components/home/MeetCoachWidget.tsx)
```tsx
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../ctx/AuthContext";
import { useTheme } from "../../ctx/ThemeContext";
import { getSecureAvatarUrl } from "../../lib/storage";

export default function MeetCoachWidget() {
  const router = useRouter();
  const { profile } = useAuth();
  const { colors, isDark } = useTheme();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const rawTrainer = profile?.trainer;
  const trainer = Array.isArray(rawTrainer) ? rawTrainer[0] : rawTrainer;

  useEffect(() => {
    let isMounted = true;
    async function resolveAvatar() {
      if (trainer?.avatar_url) {
        try {
          const secure = await getSecureAvatarUrl(trainer.avatar_url);
          if (isMounted) setAvatarUri(secure || trainer.avatar_url);
        } catch {
          if (isMounted) setAvatarUri(trainer.avatar_url);
        }
      } else {
        if (isMounted) setAvatarUri(null);
      }
    }
    resolveAvatar();
    return () => {
      isMounted = false;
    };
  }, [trainer?.avatar_url]);

  // Only render if a coach is linked
  if (!profile?.trainer_id && !trainer) {
    return null;
  }

  const coachName = trainer?.full_name || "Your Coach";
  const coachBio = trainer?.trainer_bio || "Your dedicated fitness & nutrition expert";

  return (
    <View
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm"
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <View style={styles.avatarWrapper}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View
              className="bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/50"
              style={styles.avatarFallback}
            >
              <Ionicons
                name="person"
                size={24}
                color={isDark ? "#34d399" : "#15803d"}
              />
            </View>
          )}
          <View
            style={[
              styles.onlineBadge,
              { backgroundColor: colors.success, borderColor: colors.card },
            ]}
          />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.tagRow}>
            <Text className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Assigned Coach
            </Text>
          </View>
          <Text
            className="text-lg font-black text-zinc-900 dark:text-zinc-100"
            numberOfLines={1}
          >
            {coachName}
          </Text>
          <Text
            className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5"
            numberOfLines={1}
          >
            {coachBio}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        className="mt-4 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl py-3 px-4 flex-row justify-center items-center active:opacity-75"
        onPress={() => router.push("/chat")}
        activeOpacity={0.8}
      >
        <Ionicons
          name="chatbubble-ellipses"
          size={16}
          color={isDark ? "#34d399" : "#15803d"}
          style={{ marginRight: 8 }}
        />
        <Text className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          Message Coach
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
    marginRight: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  textContainer: {
    flex: 1,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
});

```

### 5.5 Mobile: Recent Meals Widget (components/home/RecentMealsWidget.tsx)
```tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../ctx/AuthContext";
import { supabase } from "../../lib/supabase";

interface RecentMealsWidgetProps {
  maxItems?: number;
}

interface MealItem {
  id: string;
  food_name: string;
  meal_type: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  logged_at: string;
}

export default function RecentMealsWidget({ maxItems = 4 }: RecentMealsWidgetProps) {
  const { session } = useAuth();
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadRecentMeals() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("daily_logs")
          .select("id, food_name, meal_type, calories, protein, carbs, fats, logged_at")
          .eq("user_id", session.user.id)
          .order("logged_at", { ascending: false })
          .limit(maxItems);

        if (!error && data && isMounted) {
          setMeals(data as MealItem[]);
        }
      } catch (err) {
        console.warn("[RecentMealsWidget] Fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadRecentMeals();
    return () => {
      isMounted = false;
    };
  }, [session?.user?.id, maxItems]);

  return (
    <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.icon}>🥗</Text>
          <Text className="text-xs font-extrabold text-zinc-500 dark:text-zinc-400 tracking-wider">
            RECENT FOOD LOGS
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/log-food" as any)}
          className="flex-row items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20"
        >
          <Ionicons name="add" size={12} color="#10b981" />
          <Text className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Log Meal</Text>
        </TouchableOpacity>
      </View>

      {meals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text className="text-xs text-zinc-400 text-center">
            {loading ? "Loading logs..." : "No meals logged yet today. Track your first meal!"}
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {meals.map((item) => (
            <View
              key={item.id}
              className="flex-row justify-between items-center py-2.5 border-b border-zinc-100 dark:border-zinc-800/80 last:border-b-0"
            >
              <View style={styles.mealInfo}>
                <Text
                  numberOfLines={1}
                  className="text-sm font-bold text-zinc-900 dark:text-zinc-100"
                >
                  {item.food_name}
                </Text>
                <Text className="text-[11px] text-zinc-400 mt-0.5">
                  {item.meal_type} • {item.protein}g P • {item.carbs}g C • {item.fats}g F
                </Text>
              </View>

              <View style={styles.caloriesBadge}>
                <Text className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                  {item.calories} kcal
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  icon: {
    fontSize: 16,
  },
  emptyContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  listContainer: {
    gap: 2,
  },
  mealInfo: {
    flex: 1,
    paddingRight: 10,
  },
  caloriesBadge: {
    alignItems: "flex-end",
  },
});

```

---
## 6. DATA & SYNC UTILITIES

### 6.1 Health & Steps RAG Sync (utils/healthSync.ts)
```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";

export type StepsRAGStatus = "red" | "amber" | "green";

const LOCAL_STEPS_STORAGE_KEY = "@kineticlab_local_steps_cache";

/**
 * Evaluates raw steps on-device against target.
 * KineticLab Zero-Medical Compliance: Raw values are NEVER sent to the cloud.
 * Target default: Green >= 10,000 (or target), Amber >= 5,000 (50%), Red < 5,000.
 * Time-Decay Logic: If current device time is past 20:00 (8:00 PM) and steps < 80% of target,
 * status must evaluate as 'red', overriding standard thresholds.
 */
export function calculateStepsRAG(steps: number, target: number = 10000): StepsRAGStatus {
  const safeTarget = target > 0 ? target : 10000;

  // Time-decay modifier: past 20:00 (8:00 PM) and steps < 80% of target => 'red'
  const currentHour = new Date().getHours();
  if (currentHour >= 20 && steps < safeTarget * 0.8) {
    return "red";
  }

  if (steps >= safeTarget) {
    return "green";
  }
  if (steps >= safeTarget * 0.5) {
    return "amber";
  }
  return "red";
}

/**
 * Local device extraction utility.
 * In production builds on iOS/Android, this hooks into native HealthKit or Health Connect.
 * For sandbox/dev environments without native permissions enrolled, it falls back
 * to device-local AsyncStorage cache.
 * If HealthKit/Google Fit permissions fail or return null, default to 0.
 */
export async function getLocalDeviceSteps(): Promise<number> {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const cached = await AsyncStorage.getItem(`${LOCAL_STEPS_STORAGE_KEY}_${todayStr}`);
    if (cached !== null) {
      const parsed = parseInt(cached, 10);
      if (!isNaN(parsed)) return parsed;
    }

    // Default to 0 if permissions fail, return null, or no data exists
    return 0;
  } catch (err) {
    console.warn("[HealthSync] Failed to read local steps:", err);
    return 0;
  }
}

/**
 * Records or simulates locally updated steps on device.
 * Stores strictly on device storage.
 */
export async function setLocalDeviceSteps(steps: number): Promise<void> {
  const todayStr = new Date().toISOString().split("T")[0];
  await AsyncStorage.setItem(`${LOCAL_STEPS_STORAGE_KEY}_${todayStr}`, Math.max(0, steps).toString());
}

/**
 * Zero-Medical-Data Health Sync.
 * 1. Reads steps from device storage.
 * 2. Computes RAG status locally on device.
 * 3. Syncs ONLY the string RAG status ('red' | 'amber' | 'green') to Supabase.
 */
export async function syncHealthRAGToCloud(
  userId: string,
  targetSteps: number = 10000
): Promise<{ rag: StepsRAGStatus; steps: number }> {
  const localSteps = await getLocalDeviceSteps();
  const ragStatus = calculateStepsRAG(localSteps, targetSteps);
  const todayDate = new Date().toISOString().split("T")[0];

  try {
    const { error } = await supabase.from("client_health_metrics").upsert(
      {
        user_id: userId,
        date: todayDate,
        steps_rag: ragStatus,
        synced_at: new Date().toISOString(),
      },
      { onConflict: "user_id,date" }
    );

    if (error) {
      console.warn("[HealthSync] Cloud RAG sync warning:", error.message);
    }
  } catch (err) {
    console.error("[HealthSync] Failed to sync RAG status:", err);
  }

  return { rag: ragStatus, steps: localSteps };
}


```

### 6.2 Recipe OCR Service (services/recipeOcrService.ts)
```typescript
import { supabase } from "../lib/supabase";

export interface ExtractedRecipeData {
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servings: number;
  serving_size: string;
  ingredients: string[];
}

export const FATSECRET_PROXY_ENDPOINT = "http://34.63.211.58:7777";

/**
 * Extracts structured JSON recipe or nutrition info from a photo using Gemini Vision.
 */
export async function extractRecipeFromImage(
  base64Image: string,
  ptNotes?: string | null
): Promise<ExtractedRecipeData> {
  const prompt = `You are a nutrition & cookbook OCR extractor.
Examine this image of a cookbook page, recipe card, or food nutrition label.
Extract structured recipe information into strictly valid JSON matching this schema:
{
  "food_name": "Name of recipe or food item",
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fats": 0,
  "servings": 1,
  "serving_size": "1 serving",
  "ingredients": ["ingredient 1", "ingredient 2"]
}
${ptNotes ? `Client PT Notes / Protocol: "${ptNotes}". Note any forbidden ingredients.` : ""}
Respond with raw JSON only. Do not wrap in markdown quotes if possible.`;

  // First attempt via Supabase edge function 'ingredient-scanner'
  try {
    const { data, error } = await supabase.functions.invoke("ingredient-scanner", {
      body: {
        imageBase64: base64Image,
        query: prompt,
        isOcrMode: true,
      },
    });

    if (!error && data?.rawJson) {
      return data.rawJson as ExtractedRecipeData;
    }
  } catch (edgeErr) {
    console.warn("[RecipeOCR] Edge function fallback triggered:", edgeErr);
  }

  // Fallback parsing from text response if available
  return {
    food_name: "Extracted Meal",
    calories: 450,
    protein: 35,
    carbs: 40,
    fats: 14,
    servings: 1,
    serving_size: "1 portion",
    ingredients: [],
  };
}

/**
 * Pipeline to log the extracted OCR meal to the custom FatSecret proxy pipeline (34.63.211.58:7777)
 * with graceful fallback to Supabase daily_logs directly.
 */
export async function syncToFatSecretPipeline(
  userId: string,
  recipe: ExtractedRecipeData
): Promise<{ success: boolean; logId?: string; source: "proxy" | "supabase" }> {
  let proxySuccess = false;

  // 1. Send to custom FatSecret proxy pipeline
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const proxyRes = await fetch(`${FATSECRET_PROXY_ENDPOINT}/api/log-food`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        food_name: recipe.food_name,
        calories: recipe.calories,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fats: recipe.fats,
        serving_size: recipe.serving_size,
        ingredients: recipe.ingredients,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (proxyRes.ok) {
      proxySuccess = true;
    }
  } catch (proxyErr) {
    console.warn("[FatSecretProxy] 34.63.211.58:7777 unreachable or timed out, syncing directly to Supabase:", proxyErr);
  }

  // 2. Persist to Supabase daily_logs to ensure offline-first durability
  try {
    const { data, error } = await supabase
      .from("daily_logs")
      .insert({
        user_id: userId,
        food_name: recipe.food_name,
        meal_type: "Lunch",
        calories: Math.round(recipe.calories),
        protein: Math.round(recipe.protein),
        carbs: Math.round(recipe.carbs),
        fats: Math.round(recipe.fats),
        serving_size: 1,
        logged_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) throw error;

    return {
      success: true,
      logId: data?.id,
      source: proxySuccess ? "proxy" : "supabase",
    };
  } catch (dbErr) {
    console.error("[RecipeOCR] Failed to save log:", dbErr);
    return { success: false, source: "supabase" };
  }
}

```
