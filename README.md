# CarMilan — Group Car Buying Platform

> **Engineered by ShriiTech Pvt Ltd**  
> *“Buy Together. Negotiate Better.”*

CarMilan is India's premier collective car buying web application that allows prospective car buyers seeking the same car model and variant in Indian cities to pool their demand into buyer groups. By combining retail demand into institutional fleet volumes, groups invite competing quotations from verified, authorized OEM car dealerships to unlock substantial savings on their dream car with zero purchase obligation.

---

## 🌟 Key Capabilities & Features

### 1. 👤 Buyer Experience
- **Browse Indian Car Catalog**: Filter top models (Hyundai Creta, Tata Nexon, Mahindra XUV700, Mahindra Thar 4x4, etc.) by Brand, Body Type, Fuel Type, and Budget.
- **Form & Join Buyer Groups**:
  - Configurable target sizes and minimum thresholds (e.g. Creta SX Petrol in Mumbai: 14/20 buyers joined).
  - Concurrency-safe enrollment preventing duplicate memberships or exceeding group capacity.
  - 100% free with zero advance payment and no purchase commitment.
- **Privacy Shield**:
  - Private phone numbers and emails are never disclosed to other group members or sold to third-party telecallers.
  - Participants are displayed with privacy-safe anonymized initials (e.g. *"R.S. from Mumbai"*).
- **Dealership Quotations & Price Comparison**:
  - Side-by-side comparison cards and comprehensive comparative table.
  - Transparent itemized price breakdown:
    $$\text{Final On-Road Price} = (\text{Ex-Showroom} - \text{Dealer Discount}) + \text{RTO} + \text{Insurance} + \text{Mandatory Fees} + \text{Accessories}$$
  - Clear reference price benchmarks with estimated savings and percentage reductions.
  - Sort offers by Lowest On-Road Price, Highest Dealer Discount, or Fastest Delivery Time.
- **Saved Wishlist & Personal Profile**: Save preferred cars, track active groups, and configure preferred contact channels (WhatsApp, Phone, Email).

---

### 2. 🏢 Dealership Experience
- **Dedicated Dealership Hub**: View incoming RFQs from pre-qualified, high-intent buyer pools in the dealership's territory.
- **Zero CAC Customer Acquisition**: Close 10 to 30 vehicle deliveries in single transactions without digital ad spend.
- **Itemized Quotation Submission**:
  - Real-time calculator computing ex-showroom price, dealer group discount, state RTO, insurance, mandatory charges, and accessories.
  - Configure estimated vehicle delivery time and quotation validity expiration.
  - Withdraw or update submitted offers before final acceptance.
- **Business Verification**:
  - Submit GSTIN, municipal trade license, showroom address, and authorized OEM brands (Hyundai, Tata, Mahindra, Maruti, Kia, Toyota) for platform accreditation.

---

### 3. 🛡️ Administrator Console
- **Platform Oversight Counters**: Total Registered Buyers, Total Dealerships, Pending Verifications, Active Groups, Open RFQs, Total Offers Sent.
- **Dealership Verification Workflow**: Review submitted GSTINs and dealership credentials, with one-click **Approve** or **Reject** (with recorded audit reason).
- **Group Management**: Monitor group participation progress, enforce capacity limits, and close or extend deadlines.
- **Automotive Catalog Management**: Add new car models, brands, variants, and ex-showroom price benchmarks.
- **Immutable Audit Trail**: Chronological event stream logging actor actions, entity types, and timestamps.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + TypeScript + Vite |
| **Styling** | Tailwind CSS v4 + Vanilla CSS Design System |
| **Icons & UI** | Lucide React |
| **Animations** | Canvas Confetti (celebration on group target / enrollment) |
| **Testing** | Vitest (Automated unit tests for calculations & concurrency) |
| **Backend / DB** | PostgreSQL / Supabase |
| **Authentication** | Supabase Auth + Dual-Mode Local Persona Switcher |
| **Dual-Mode** | Instant Demo Mode with realistic Indian automotive data, or Live Supabase connection |

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js (v18 or higher; tested on Node v22)
- npm (v9 or higher)

### 2. Installation
```bash
# Clone the repository and enter the directory
git clone https://github.com/ShriiTech/CarMilan.git
cd CarMilan

# Install project dependencies
npm install
```

### 3. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Running Unit Tests
```bash
npx vitest run
```
Executes all unit tests covering on-road pricing formulas, savings percentages, group capacity limits, duplicate membership prevention, and status transitions.

### 5. Building for Production
```bash
npm run build
```
Generates optimized static client assets in `dist/`.

---

## ⚙️ Supabase Backend & Database Setup

The application features a complete PostgreSQL relational database schema located at:
`supabase/migrations/20261026_carmilan_schema.sql`

### Tables Included:
1. `profiles` — User account details, phone, city, preferred contact method
2. `user_roles` — Role-based access control (`buyer`, `dealer`, `admin`)
3. `dealerships` — Dealership profiles, GSTIN, showroom address, verification status
4. `dealership_verifications` — Document metadata and administrative reviews
5. `car_brands` — Automobile manufacturers (Hyundai, Tata, Mahindra, Maruti Suzuki, Kia, etc.)
6. `car_models` — Car models, images, body types, starting prices
7. `car_variants` — Specific trims, fuel types, transmissions, standard on-road benchmarks
8. `buyer_groups` — Group target sizes, current participant counts, deadlines, status transitions
9. `group_memberships` — Concurrency-safe unique memberships with user privacy protection
10. `quotation_requests` — RFQs broadcasted to dealerships
11. `dealer_offers` — Itemized price bids, discounts, delivery commitments
12. `offer_line_items` — Itemized charges, RTO, insurance, accessories
13. `saved_cars` — Buyer wishlist
14. `notifications` — Milestones and quotation updates
15. `audit_logs` — Platform compliance log

### Connecting Live Supabase:
1. Create a project at [Supabase](https://supabase.com).
2. Open the **SQL Editor** in Supabase and execute `supabase/migrations/20261026_carmilan_schema.sql`.
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Set your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
5. Restart the dev server (`npm run dev`).

---

## 🔒 Complete User Authentication & Role-Based Access Control (RBAC)

### 1. Initial Visitor Experience
- **Zero Auto-Login**: Visitors opening CarMilan for the first time see clean public navigation with **Log In** and **Register** options. No fake persona, avatar, or default account is ever displayed.
- **Switch Persona Removed**: The public demo persona switching banner has been permanently removed from production.
- **Route Guards**: Protected paths (`/dashboard`, `/buyer/*`, `/dealer/*`, `/profile`, `/groups/new`) automatically redirect unauthenticated users to `/login`. Admin paths (`/admin/*`) redirect unauthenticated visitors to `/admin/login`.

### 2. User Registration (`/register`)
- **Account Types**: Direct toggle between **Car Buyer** and **Dealership Principal / Sales Lead**.
- **Validated Input Fields**: Full legal name, email, mobile phone, city, state, password, confirm password, and Terms & Privacy acceptance.
- **Dealership Registration**: Requires trade name, 15-character Indian GSTIN, municipal trade license number, showroom address, and authorized OEM brands. Dealerships are registered with `verificationStatus: 'pending'` and `isVerified: false` until administrator audit.
- **Security Protections**:
  - Prohibits self-registering administrator accounts.
  - Prevents duplicate account creation for existing emails.
  - Enforces salted SHA-256 cryptographic hashing (`crypto.subtle`) before backend database persistence. Plaintext passwords are never stored.

### 3. User Login & Session Handling (`/login`)
- Real credential validation against persisted user records.
- Generic error messages (`"Invalid email or password. Please verify your credentials."`) to prevent credential sniffing.
- Show / Hide password toggles.
- **Remember Me** toggle saving persistent tokens to `localStorage` (or `sessionStorage` if unselected).
- On page reload, active session is verified and restored from backend storage.
- Clean **Sign Out** clears active tokens and revokes access to protected routes.

### 4. Password Recovery (`/forgot-password`)
- Secure recovery email dispatch.
- Uniform generic confirmation message preventing email address enumeration.

### 5. Cross-Buyer Privacy & Role Isolation
- **Data Isolation**: Other buyers inspecting a member's profile receive privacy-masked contact info (`phone: PROTECTED_CONTACT`, `email: PROTECTED_EMAIL`).
- **Profile Updates**: Users can only modify their own profile data. Cross-user modification attempts and self-assigned role changes are strictly rejected with authorization errors.
- **Dealership Protection**: Non-dealers attempting to submit quotations or access the dealership portal are denied access.

---

## 🧪 Comprehensive Automated Test Suites (37 Tests Passed)

Execute all project unit and security test suites with Vitest:

```bash
npx vitest run
```

### 16 Core Authentication & Authorization Scenarios (`auth.test.ts`):
1. **First-time visitor opens website** → No user is automatically logged in (`user === null`).
2. **Unauthenticated visitor tries to access `/dashboard`** → Redirected to `/login`.
3. **New user registers successfully** → Account and profile are persisted to backend storage.
4. **Duplicate registration with existing email** → Creation prevented with validation error.
5. **Incorrect login credentials** → Access denied with generic error message.
6. **Registered user logs in** → Correct profile and role-based dashboard retrieved.
7. **Logged-in user refreshes browser** → Active session restored from persistent storage.
8. **User logs out** → Session tokens revoked and protected pages rendered inaccessible.
9. **Same user logs in again** → Saved profile, preferences, and saved cars are restored.
10. **Buyer attempts dealer-only functionality** → Access denied.
11. **Buyer or Dealer attempts admin console** → Access denied.
12. **Role self-escalation attempt via registration or API** → Operation rejected.
13. **Cross-buyer data access and modification** → Confidential contacts masked; cross-updates rejected.
14. **Dealer registration verification state** → Defaults to `pending` until administrative approval.
15. **Demo mode bypass attempt** → Mock tokens and hardcoded IDs cannot bypass backend authentication.
16. **Password recovery flow** → Generic confirmation message prevents user enumeration.

---

## 🔑 Administrative Provisioning & Credentials

Platform administrators cannot be created through the public registration form. They must be provisioned through a trusted administrative procedure:

```bash
# Provision a verified administrator account
node scripts/provision-admin.js --email="admin@carmilan.in" --name="Anita Roy" --secret="CarMilan#AdminSetup2026"
```

Default credentials in local development / standalone mode:
- **Admin Portal**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
- **Email**: `admin@carmilan.in`
- **Password**: `Admin@CarMilan2026`

Seed testing credentials:
- **Buyer**: `rahul.sharma@example.com` / `Buyer@CarMilan2026`
- **Dealer**: `contact@apexhyundai.in` / `Dealer@CarMilan2026`

---

## 📄 Legal & Compliance Notice

CarMilan is a collective bargaining platform. Joining a group does not constitute a booking, financial transaction, or purchase obligation. Dealership quotations and estimated savings are submitted by authorized dealerships based on bulk volume demand. Final vehicle booking, registration, and manufacturer invoicing are contracted directly at the physical dealership showroom.

---

© 2026 CarMilan Technologies Pvt Ltd • **ShriiTech Pvt Ltd**. All rights reserved.
