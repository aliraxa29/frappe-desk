# Desk Application

A modern Vue 3 + TypeScript + Vite desktop application with an integrated locals system for document management.

## Features

- 🚀 **Vue 3** with Composition API and `<script setup>`
- 📘 **TypeScript** for type safety
- ⚡ **Vite** for fast development and builds
- 🏪 **Pinia** for state management
- 💾 **Locals System** - In-memory document storage (Frappe-like)
- 📦 **Document Management** - Full CRUD operations for documents
- 🔄 **Server Sync** - Easy integration with backend APIs
- 🎨 **Reactive UI** - Automatic updates when data changes

## Project Structure

```
desk/
├── src/
│   ├── stores/          # Pinia stores (locals, user, session)
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utilities (sync, model, composables)
│   ├── components/      # Vue components
│   ├── views/           # Page components
│   ├── router/          # Vue Router configuration
│   ├── App.vue          # Root component
│   └── main.ts          # Entry point
├── public/              # Static assets
├── SETUP.md             # Installation guide
├── QUICK_START.md       # Quick examples
├── LOCALS_DOCUMENTATION.md  # Complete API reference
└── package.json         # Dependencies
```

## Locals System

The **locals** system is a powerful in-memory document store similar to Frappe's locals pattern, but with full Vue 3 reactivity and TypeScript support.

### Quick Example

```vue
<script setup>
import { useDoc } from "@/utils/useLocals";

const { doc, isDirty, save } = useDoc("Customer", "CUST-001");
</script>

<template>
  <div v-if="doc">
    <h1>{{ doc.title }}</h1>
    <button @click="save" :disabled="!isDirty">Save</button>
  </div>
</template>
```

### Key Files

- `src/stores/locals.ts` - Pinia store for document storage
- `src/utils/sync.ts` - Server synchronization utilities
- `src/utils/model.ts` - Document manipulation utilities
- `src/utils/useLocals.ts` - Vue composables for components
- `src/utils/localsAdvanced.ts` - Advanced operations (search, pagination, etc.)

### Documentation

- **[SETUP.md](./SETUP.md)** - Installation and setup guide
- **[QUICK_START.md](./QUICK_START.md)** - Quick examples and patterns (5-minute read)
- **[LOCALS_DOCUMENTATION.md](./LOCALS_DOCUMENTATION.md)** - Complete API reference
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What was implemented

### Common Tasks

#### Display a Document
```typescript
import { useDoc } from "@/utils/useLocals";

const { doc } = useDoc("Customer", "CUST-001");
```

#### List Documents
```typescript
import { useDocType } from "@/utils/useLocals";

const { docs } = useDocType("Customer");
```

#### Sync from Server
```typescript
import { syncDocuments } from "@/utils/sync";

const response = await fetch("/api/resource/Customer/CUST-001");
const data = await response.json();
syncDocuments({ docs: [data] });
```

#### Save Changes
```typescript
const { doc, save } = useDoc("Customer", "CUST-001");
doc.title = "New Name";
await save();
```

## Development

### Install Dependencies
```bash
yarn install
# or
npm install
```

### Run Development Server
```bash
yarn dev
# or
npm run dev
```

### Build for Production
```bash
yarn build
# or
npm run build
```

### Type Check
```bash
yarn type-check
# or
npm run type-check
```

## Technologies

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
