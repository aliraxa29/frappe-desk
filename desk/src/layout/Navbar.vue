<template>
	<nav
		class="sticky top-0 z-40 flex items-center justify-between gap-6 px-6 py-1 bg-background/90 backdrop-blur border-b border-border text-foreground transition-colors"
	>
		<div class="flex items-center gap-3">
			<button
				@click="goHome"
				class="text-foreground w-26 flex items-center text-center gap-3 px-2 py-3 rounded-lg hover:bg-muted dark:hover:bg-secondary cursor-pointer transition"
			>
				<Grid class="w-7 h-7 text-foreground shrink-0" />
				<span class="hidden sm:inline text-lg font-semibold">{{ __("Apps") }}</span>
			</button>

			<!-- Breadcrumbs -->
			<div
				class="w-56 sm:w-64 md:w-80 lg:w-96 shrink-0 overflow-hidden whitespace-nowrap text-ellipsis"
			>
				<Breadcrumbs />
			</div>
		</div>
		<div class="hidden md:flex flex-1 max-w-sm mx-auto">
			<div class="relative w-full cursor-pointer" @click="openCommandDialog">
				<Search
					class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
				/>

				<input
					type="text"
					:placeholder="__('Search or type command... (Ctrl+K)')"
					readonly
					@focus="openCommandDialog"
					class="w-full rounded-lg bg-muted border border-border pl-10 pr-14 py-1 text-foreground placeholder-slate-500 dark:placeholder-white focus:outline-none focus:ring-1 focus:ring-ring focus:border-blue-500 transition"
				/>
				<span
					class="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-mono text-muted-foreground bg-muted border border-border rounded"
				>
					⌘K
				</span>
			</div>
		</div>

		<!-- Right - User -->
		<div class="relative user-profile-menu">
			<button
				@click="toggleUserMenu"
				:title="`${userFullName} (${userEmail})`"
				class="user-profile-button flex items-center p-1 rounded-full text-foreground hover:bg-muted dark:hover:bg-secondary transition cursor-pointer"
			>
				<img
					v-if="userImage"
					:src="userImage"
					:alt="userFullName"
					class="w-9 h-9 rounded-full object-cover border border-border"
				/>
				<div
					v-else
					class="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 bg-linear-to-br from-blue-500 to-purple-500"
				>
					<User class="w-5 h-5" />
				</div>
			</button>

			<!-- Dropdown -->
			<transition name="fade">
				<div
					v-if="showUserMenu"
					class="user-menu absolute right-0 mt-2 w-64 z-50 bg-background"
				>
					<div class="flex items-center gap-3 px-4 py-3">
						<img
							v-if="userImage"
							:src="userImage"
							:alt="userFullName"
							class="w-12 h-12 rounded-full object-cover border border-border"
						/>
						<div
							v-else
							class="w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 bg-linear-to-br from-blue-500 to-purple-500"
						>
							<User class="w-6 h-6" />
						</div>

						<div class="min-w-0 flex-1">
							<div class="font-semibold text-foreground truncate">
								{{ userFullName }}
							</div>
							<div class="text-sm text-muted-foreground truncate">
								{{ userEmail }}
							</div>
						</div>
					</div>

					<div class="h-px bg-muted my-2"></div>

					<button
						@click="themeStore.toggleTheme()"
						class="w-full flex items-center gap-3 px-4 py-2 rounded-md text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-muted dark:hover:bg-muted transition cursor-pointer"
					>
						<Sun v-if="isDark" class="w-4 h-4 shrink-0" />
						<Moon v-else class="w-4 h-4 shrink-0" />
						{{ isDark ? __("Switch to light mode") : __("Switch to dark mode") }}
					</button>

					<button
						@click="reloadApp"
						class="w-full flex items-center gap-3 px-4 py-2 rounded-md text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-muted dark:hover:bg-muted transition cursor-pointer"
					>
						<ArrowsClockwise class="w-4 h-4 shrink-0" />
						{{ __("Reload app") }}
					</button>

					<button
						@click="clearCacheAndReload"
						class="w-full flex items-center gap-3 px-4 py-2 rounded-md text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-muted dark:hover:bg-muted transition cursor-pointer"
					>
						<Trash class="w-4 h-4 shrink-0" />
						{{ __("Clear cache and reload") }}
					</button>

					<button
						@click="handleLogout"
						class="w-full flex items-center gap-3 px-4 py-2 rounded-md text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-muted dark:hover:bg-muted transition cursor-pointer"
					>
						<Logout class="w-4 h-4 shrink-0" />
						{{ __("Logout") }}
					</button>
				</div>
			</transition>
		</div>
		<CommandDialog ref="commandDialogRef" @close="showUserMenu = false" />
	</nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { user } from "../utils/user";
import { useAuthStore } from "../stores/auth";
import { useThemeStore } from "../stores/theme";
import { router } from "../router";
import { useRoute } from "vue-router";
import CommandDialog from "../components/CommandDialog.vue";
import Breadcrumbs from "../components/Breadcrumbs.vue";
import { __ } from "../utils/translate";
import Grid from "../assets/icons/Grid.vue";
import User from "../assets/icons/User.vue";
import Sun from "../assets/icons/Sun.vue";
import Moon from "../assets/icons/Moon.vue";
import ArrowsClockwise from "../assets/icons/ArrowsClockwise.vue";
import Trash from "../assets/icons/Trash.vue";
import Logout from "../assets/icons/Logout.vue";
import Search from "../assets/icons/Search.vue";

const showUserMenu = ref(false);
const userFullName = ref("User");
const userEmail = ref("user@example.com");
const userImage = ref("");
const commandDialogRef = ref<InstanceType<typeof CommandDialog>>();
const authStore = useAuthStore();
const themeStore = useThemeStore();

const route = useRoute();

const isDark = computed(() => themeStore.getEffectiveTheme() === "dark");

const openCommandDialog = () => {
	commandDialogRef.value?.open();
};

const handleKeyDown = (e: KeyboardEvent) => {
	// Cmd+K or Ctrl+K
	if ((e.metaKey || e.ctrlKey) && e.key === "k") {
		e.preventDefault();
		openCommandDialog();
	}
};

const handleClickOutside = (e: Event) => {
	const target = e.target as HTMLElement;
	// Check if click is outside the user profile menu
	if (!target.closest(".user-profile-menu")) {
		showUserMenu.value = false;
	}
};

onMounted(() => {
	try {
		userFullName.value = user.get_user_full_name() || user.get_full_name();
		userEmail.value = user.get_email();
		userImage.value = user.get_user_image();
	} catch (e) {
		console.warn("Could not load user info:", e);
	}

	document.addEventListener("keydown", handleKeyDown);
	document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
	document.removeEventListener("keydown", handleKeyDown);
	document.removeEventListener("click", handleClickOutside);
});

const goHome = () => {
	if (route.name !== "Desk") {
		router.push({ name: "Desk" });
	}
};

const toggleUserMenu = () => {
	showUserMenu.value = !showUserMenu.value;
};

const handleLogout = async () => {
	showUserMenu.value = false;

	try {
		await authStore.logout();
		router.push({ name: "Login" });
	} catch (err) {
		console.error("Logout failed:", err);
		window.location.href = "/login";
	}
};

const reloadApp = () => {
	showUserMenu.value = false;
	window.location.reload();
};

const clearCacheAndReload = async () => {
	showUserMenu.value = false;
	try {
		window.localStorage.clear();
		window.sessionStorage.clear();
		if ("caches" in window) {
			const cacheKeys = await caches.keys();
			await Promise.all(cacheKeys.map((key) => caches.delete(key)));
		}
	} catch (e) {
		console.warn("Cache clear failed:", e);
	} finally {
		window.location.reload();
	}
};
</script>

<style scoped></style>
