# Desk Application

A modern Vue 3 + TypeScript + Vite desktop application with Socket.IO realtime integration and Frappe locals system.

## ✨ Key Features

- 🚀 **Vue 3** with Composition API and `<script setup>`
- 📘 **TypeScript** for type safety
- ⚡ **Vite** for fast development and builds
- 🏪 **Pinia** for state management
- 💾 **Locals System** - In-memory document storage (Frappe-like)
- 🔄 **Socket.IO Realtime** - Document & list updates in real-time
- 📦 **Document Management** - Full CRUD operations for documents
- 🔌 **API Proxy** - Seamless Frappe backend integration
- 🎨 **Reactive UI** - Automatic updates when data changes

## 📂 Project Structure

```
desk/
├── src/
│   ├── stores/           # Pinia stores (locals, user, session)
│   ├── types/            # TypeScript type definitions
│   ├── utils/
│   │   ├── socketio/     # Socket.IO client & composables ⭐ NEW
│   │   ├── sync/         # Server sync utilities
│   │   └── ...
│   ├── components/       # Vue components
│   ├── views/            # Page components
│   ├── router/           # Vue Router configuration
│   ├── App.vue           # Root component
│   └── main.ts           # Entry point
├── public/               # Static assets
├── vite.config.ts        # Vite configuration (with proxies) ⭐ 
├── index.html            # Entry HTML with boot data
└── package.json          # Dependencies (socket.io-client added)
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd /home/erp/bench15/apps/desktop/desk
yarn install
```

### 2. Start Services (3 terminals)

**Terminal 1: Frappe Backend**
```bash
cd /home/erp/bench15
bench serve                    # :8000
```

**Terminal 2: Frontend Dev**
```bash
cd /home/erp/bench15/apps/desktop/desk
yarn dev                       # :5173
```

**Terminal 3: Redis (for realtime)**
```bash
redis-server config/redis_cache.conf
```

### 3. Open Application
```
http://localhost:5173
```

## 🔌 What's New: Socket.IO Realtime Integration

### Automatic Features
- ✅ Document updates sync in real-time across tabs
- ✅ List updates when other users make changes
- ✅ Form viewer tracking (see who's editing)
- ✅ Task progress notifications
- ✅ Global msgprint and progress handling

### Usage in Components

```typescript
// Document realtime subscription
import { useDocRealtime } from '@/utils/socketio'

useDocRealtime(
  () => doctype,
  () => docname,
  (data) => {
    console.log('Document updated:', data)
  }
)

// List realtime subscription
import { useListRealtime } from '@/utils/socketio'

useListRealtime(
  () => doctype,
  (data) => {
    console.log('List updated:', data)
  }
)
```

See **SOCKETIO_QUICK_REFERENCE.md** for more examples.

## 🔧 Configuration

### Vite Proxy Setup

All requests are properly routed:
- Development: `localhost:5173` → Proxies to `localhost:8000` (Frappe)
- Production: Served directly from `localhost:8000/assets/desktop/dashboard/`
- Socket.IO: Proxied to `localhost:9000` for realtime

**Proxied Routes**:
- `/api/*` → Frappe API
- `/method/*` → RPC calls
- `/assets/*` → Static files
- `/upload_file` → File uploads
- `/socket.io/*` → WebSocket realtime

See **VITE_PROXY_CONFIG.md** for detailed configuration.

### Environment

Create `.env` file if needed:

```env
VITE_APP_NAME=Desk
NODE_ENV=development
```

## 📚 Documentation

### Setup & Development
- **[DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md)** ⭐ START HERE - Complete development guide
- **[VITE_SETUP_COMPLETE.md](./VITE_SETUP_COMPLETE.md)** - Vite configuration summary

### Socket.IO Realtime
- **[SOCKETIO_INTEGRATION.md](./SOCKETIO_INTEGRATION.md)** - Complete Socket.IO API reference
- **[SOCKETIO_QUICK_REFERENCE.md](./SOCKETIO_QUICK_REFERENCE.md)** - Quick code examples

### Proxy & Networking
- **[VITE_PROXY_CONFIG.md](./VITE_PROXY_CONFIG.md)** - Detailed proxy configuration

### Locals System (Legacy)
- **[SETUP.md](./SETUP.md)** - Installation guide
- **[QUICK_START.md](./QUICK_START.md)** - Quick examples
- **[LOCALS_DOCUMENTATION.md](./LOCALS_DOCUMENTATION.md)** - Complete API reference

## 💻 Development Commands

### Install Dependencies
```bash
yarn install
```

### Run Development Server
```bash
yarn dev
# Runs on http://localhost:5173
# With hot reload and proxy to :8000
```

### Build for Production
```bash
yarn build
# Output: ../../desktop/desktop/public/dashboard/
```

### Preview Production Build
```bash
yarn preview
```

### Type Check
```bash
yarn type-check
```

## 🏗️ Architecture

### Development Server Flow
```
Browser :5173
    ↓
Vite Dev Server (hot reload)
    ├─ Serves frontend code
    ├─ Proxies /api → :8000
    ├─ Proxies /socket.io → :9000
    └─ Reloads on file changes
```

### Production Flow
```
Browser
    ↓
Frappe :8000
    ├─ Serves built assets from /assets/desktop/dashboard/
    ├─ Handles /api calls
    └─ Socket.IO connects to :9000
```

## 🎯 Real-time Features

### Document Subscriptions
```typescript
realtime.docSubscribe(doctype, docname, callback)
realtime.docOpen(doctype, docname)          // Track viewers
realtime.docClose(doctype, docname)         // Stop tracking
```

### List Subscriptions
```typescript
realtime.doctypeSubscribe(doctype, callback)
```

### Task Progress
```typescript
realtime.taskSubscribe(taskId, callback)
```

### Global Events
```typescript
realtime.on('msgprint', (data) => {})
realtime.on('progress', (data) => {})
realtime.on('doc_update', (data) => {})
realtime.on('list_update', (data) => {})
```

See **SOCKETIO_QUICK_REFERENCE.md** for complete API.

## 🔍 Debugging

### Check Services
```bash
# Frappe backend
curl http://localhost:8000

# Frontend dev
curl http://localhost:5173

# Socket.IO
curl http://localhost:9000/socket.io
```

### Browser Console
```javascript
// Check realtime connection
console.log('Connected:', window.dash.realtime?.isConnected?.())

// View boot data
console.log(window.dash.boot)

// Manual event test
window.dash.realtime?.on('doc_update', console.log)
```

### View Logs
```bash
# Frappe logs
tail -f /home/erp/bench15/logs/frappe.log

# Dev server console (Terminal 2)
# Shows Vite messages and proxy activity
```

## 📦 Technologies

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Typed JavaScript
- **Vite** - Next generation frontend tooling

- **Pinia** - State management (Vue 3)
- **Vue Router** - Official router for Vue

## Learning Resources

1. [Vue 3 Documentation](https://vuejs.org/)
2. [TypeScript Documentation](https://www.typescriptlang.org/docs/)
3. [Vite Documentation](https://vitejs.dev/)
4. [Pinia Documentation](https://pinia.vuejs.org/)
5. Local documentation files (SETUP.md, LOCALS_DOCUMENTATION.md, etc.)

## Getting Started

### New to this project?
1. Read [SETUP.md](./SETUP.md) for installation
2. Read [QUICK_START.md](./QUICK_START.md) for quick examples
3. Check [src/components/LocalsDemoComponent.vue](./src/components/LocalsDemoComponent.vue) for a working example
4. Review [LOCALS_DOCUMENTATION.md](./LOCALS_DOCUMENTATION.md) for complete API

### Want to add a feature?
1. Understand the locals system
2. Create your component using composables
3. Integrate with server APIs as needed

## API Examples

### Create a New Document
```typescript
import { useLocalsStore } from "@/stores/locals";

const store = useLocalsStore();
store.addToLocals({
  doctype: "Customer",
  name: "CUST-NEW",
  title: "New Customer",
  __islocal: true
});
```

### Search Documents
```typescript
import { searchDocuments } from "@/utils/localsAdvanced";

const results = searchDocuments("Customer", "ABC", ["name", "title"]);
```

### Get Statistics
```typescript
import { getDocTypeStats } from "@/utils/localsAdvanced";

const stats = getDocTypeStats("Customer");
// { total: 10, unsaved: 2, local: 1, needsRefresh: 0 }
```

### Batch Operations
```typescript
import { batchAddToLocals } from "@/utils/localsAdvanced";

const customers = [
  { doctype: "Customer", name: "C1", title: "Customer 1" },
  { doctype: "Customer", name: "C2", title: "Customer 2" }
];
batchAddToLocals(customers);
```

## File Structure Details

### Core Locals System
- `src/stores/locals.ts` - Pinia store (100+ lines)
- `src/types/locals.ts` - Type definitions (60+ lines)
- `src/utils/sync.ts` - Sync utilities (180+ lines)
- `src/utils/model.ts` - Model utilities (200+ lines)
- `src/utils/localsGlobal.ts` - Global accessor (70+ lines)
- `src/utils/useLocals.ts` - Vue composables (200+ lines)
- `src/utils/localsAdvanced.ts` - Advanced utilities (350+ lines)

### Example & Tests
- `src/components/LocalsDemoComponent.vue` - Full working example
- `src/utils/localsTests.ts` - Test suite

### Global Types
- `src/types/global.d.ts` - Type declarations for window.locals

## Status

✅ **Complete and Ready to Use**

All files created and integrated:
- ✅ Core locals system implemented
- ✅ Vue 3 composables created
- ✅ TypeScript types defined
- ✅ Global accessor configured
- ✅ Documentation complete
- ✅ Example component included
- ✅ Test suite available

## Notes

- This template uses Vue 3 `<script setup>` SFCs
- All new code is TypeScript by default
- Locals system is reactive and production-ready
- See individual documentation files for detailed guides

## Support & Documentation

- 📖 [SETUP.md](./SETUP.md) - Start here
- ⚡ [QUICK_START.md](./QUICK_START.md) - Quick examples
- 📚 [LOCALS_DOCUMENTATION.md](./LOCALS_DOCUMENTATION.md) - Complete reference
- 📋 [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Implementation details

---

Happy coding! 🚀
