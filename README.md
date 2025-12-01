# MBG Dapur Management System

A modern, full-stack kitchen management application built with Next.js 15, designed as a prototype using localStorage that's ready to migrate to a production database.

## 🚀 Features

### Core Functionality
- **Dashboard Analytics** - Real-time metrics for orders, revenue, inventory, and meals
- **Menu Management** - Complete CRUD operations for menu items with categories and availability
- **Inventory Tracking** - Stock monitoring with low-stock alerts and restock functionality
- **Order Management** - Full order workflow: Pending → Preparing → Ready → Delivered
- **Responsive Design** - Mobile-first design with sidebar navigation

### Key Highlights
- ✅ **LocalStorage Prototype** - Fully functional without a database
- ✅ **Production-Ready Architecture** - Easy migration to PostgreSQL/MySQL with Prisma
- ✅ **TypeScript First** - Full type safety with interfaces mirroring future database schema
- ✅ **Real-time Updates** - Automatic data refresh across components
- ✅ **Modern UI/UX** - Built with Shadcn/UI components

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/UI + Radix UI
- **Icons:** Lucide React
- **Data Layer:** LocalStorage (prototype) → Ready for Prisma ORM

## 📦 Installation

```bash
# Install dependencies
bun install
# or
npm install

# Run development server
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
mbg-dapur/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── dashboard/            # Dashboard pages
│   │   │   ├── page.tsx         # Main dashboard
│   │   │   ├── menu/            # Menu management
│   │   │   ├── inventory/       # Inventory tracking
│   │   │   └── orders/          # Order management
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Homepage with login UI
│   ├── components/
│   │   ├── dashboard/           # Dashboard-specific components
│   │   │   ├── DashboardLayout.tsx  # Sidebar layout
│   │   │   └── MetricCard.tsx       # Metric display card
│   │   └── ui/                  # Shadcn/UI components
│   ├── lib/
│   │   ├── services/            # Data service layer
│   │   │   ├── storage.ts       # Base storage abstraction
│   │   │   ├── menuService.ts   # Menu operations
│   │   │   ├── inventoryService.ts  # Inventory operations
│   │   │   ├── orderService.ts      # Order operations
│   │   │   └── dashboardService.ts  # Dashboard metrics
│   │   └── types/               # TypeScript interfaces
│   │       └── index.ts         # Core data models
│   └── hooks/                   # Custom React hooks
└── public/                      # Static assets
```

## 🎯 Usage

### Homepage
- View app introduction and features
- Mock login interface (any credentials work in prototype mode)
- Direct navigation to dashboard

### Dashboard (`/dashboard`)
- **Overview Page** - Key metrics and recent activity
  - Today's revenue
  - Pending orders count
  - Low stock alerts
  - Meal preparation statistics

### Menu Management (`/dashboard/menu`)
- Add new menu items with categories
- Edit existing items
- Toggle availability status
- View categorized menu items
- Image URLs for visual presentation

### Inventory Management (`/dashboard/inventory`)
- Add inventory items with quantity and units
- Set minimum stock thresholds
- Restock functionality
- Automatic status updates (In Stock / Low Stock / Out of Stock)
- Low stock alert notifications

### Order Management (`/dashboard/orders`)
- Create new orders with multiple items
- Track order status workflow
- Filter orders by status (tabs)
- View detailed order information
- Calculate totals automatically
- Customer information tracking

## 🔄 Migration Path to Production

### Current Architecture (Prototype)
```typescript
// Service Layer (src/lib/services/storage.ts)
class StorageService<T> {
  getAll(): T[] { /* localStorage */ }
  create(item: T): T { /* localStorage */ }
  update(id: string, updates: Partial<T>): T | null { /* localStorage */ }
  delete(id: string): boolean { /* localStorage */ }
}
```

### Migration Steps

#### 1. **Add Prisma to Project**
```bash
npm install prisma @prisma/client
npx prisma init
```

#### 2. **Convert TypeScript Interfaces to Prisma Schema**
The interfaces in `src/lib/types/index.ts` are already designed to mirror Prisma models:

```prisma
// schema.prisma example
model MenuItem {
  id              String    @id @default(cuid())
  name            String
  category        String
  description     String
  price           Float
  imageUrl        String?
  isAvailable     Boolean   @default(true)
  preparationTime Int
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

#### 3. **Create API Routes**
```typescript
// app/api/menu/route.ts
import { prisma } from '@/lib/prisma';

export async function GET() {
  const menuItems = await prisma.menuItem.findMany();
  return Response.json(menuItems);
}
```

#### 4. **Update Service Layer**
Replace localStorage calls with API calls:
```typescript
// Before (localStorage)
getAll(): MenuItem[] {
  return JSON.parse(localStorage.getItem('menu_items') || '[]');
}

// After (API)
async getAll(): Promise<MenuItem[]> {
  const response = await fetch('/api/menu');
  return response.json();
}
```

#### 5. **Add Authentication**
- Implement NextAuth.js or similar
- Protect dashboard routes
- Add user management

## 🎨 Sample Data

The application comes with pre-seeded sample data:

### Menu Items
- Nasi Goreng Spesial
- Soto Ayam
- Gado-Gado
- Es Teh Manis
- Nasi Uduk

### Inventory Items
- Beras (Rice)
- Ayam (Chicken)
- Sayuran Campuran (Mixed Vegetables)
- Minyak Goreng (Cooking Oil)
- And more...

### Sample Orders
- Multiple order statuses for demonstration
- Various order amounts and items

## 🔐 Security Considerations

**Prototype Mode:**
- No authentication required
- Data stored in browser localStorage
- All data is client-side only

**Production Recommendations:**
- Implement proper authentication (NextAuth.js, Auth0, etc.)
- Add authorization and role-based access control
- Use server-side API routes for data operations
- Implement input validation and sanitization
- Add rate limiting and CSRF protection
- Use environment variables for sensitive data

## 🚧 Future Enhancements

- [ ] Add real authentication system
- [ ] Implement reporting and analytics
- [ ] Add kitchen schedule management
- [ ] Multi-branch/location support
- [ ] Staff management system
- [ ] Customer loyalty program
- [ ] QR code order system
- [ ] Receipt printing functionality
- [ ] Export data to CSV/PDF
- [ ] Advanced inventory forecasting
- [ ] Integration with payment gateways
- [ ] Mobile app version

## 📝 Notes

### Why LocalStorage First?
1. **Rapid Prototyping** - Get features working quickly without database setup
2. **Easy Testing** - No need for database migrations during development
3. **Demonstration** - Perfect for showcasing functionality
4. **Smooth Migration** - Abstracted service layer makes transition seamless

### Data Persistence
- Data is stored in browser localStorage
- Data persists across page refreshes
- Data is specific to each browser/device
- Clear browser data will reset the application

## 👨‍💻 Developer Notes

### Key Design Decisions
1. **Service Layer Abstraction** - All data operations go through service classes, making it easy to swap localStorage for API calls
2. **TypeScript Interfaces** - Defined upfront to match future database schema
3. **Component Modularity** - Reusable components for easy maintenance
4. **Real-time Updates** - Components refresh data periodically to catch changes
5. **Responsive First** - Mobile-friendly from the start

### Code Quality
- Full TypeScript coverage
- Consistent component patterns
- Clean separation of concerns
- Reusable UI components from Shadcn/UI

---

**Built with ❤️ using Next.js 15, TypeScript, Tailwind CSS & Shadcn/UI**