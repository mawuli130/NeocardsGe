import { auth } from '../firebase-config.js';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';

const Profile = {
  template: `
    <div class="min-h-screen bg-background flex">
      <!-- Sidebar -->
      <aside v-if="isSidebarOpen" class="w-64 bg-card border-r border-border p-6 flex flex-col shrink-0">
        <div class="flex items-center gap-2 mb-8 px-2">
          <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span class="text-xl font-bold tracking-tight">AI Assistant</span>
        </div>
        
        <nav class="space-y-1 flex-1">
          <a href="#/" class="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent text-muted-foreground transition-colors">
            Chat
          </a>
          <a href="#/history" class="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent text-muted-foreground transition-colors">
            History
          </a>
          <a href="#/profile" class="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg bg-accent text-accent-foreground transition-colors">
            Profile
          </a>
        </nav>

        <div class="pt-4 border-t border-border mt-auto">
          <button @click="logout" class="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
            Logout
          </button>
        </div>
      </aside>

      <div class="flex-1 flex flex-col h-screen overflow-hidden">
        <header class="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
          <div class="flex items-center gap-4">
            <button @click="isSidebarOpen = !isSidebarOpen" class="p-2 hover:bg-accent rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 class="font-semibold">User Profile</h1>
          </div>
        </header>

        <main class="flex-1 overflow-y-auto p-8 bg-muted/20">
          <div class="max-w-2xl mx-auto">
            <div class="bg-card rounded-xl border border-border shadow-sm p-8 space-y-6">
              <div class="flex items-center gap-6">
                <div class="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                  {{ userInitial }}
                </div>
                <div>
                  <h2 class="text-2xl font-bold">{{ user?.displayName || 'Adventurer' }}</h2>
                  <p class="text-muted-foreground">{{ user?.email }}</p>
                </div>
              </div>

              <div class="grid gap-4 pt-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium leading-none">Display Name</label>
                  <div class="flex gap-2">
                    <input v-model="newName" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                    <button @click="updateName" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                      Update
                    </button>
                  </div>
                </div>

                <div class="p-4 bg-muted/50 rounded-lg border border-border">
                  <h3 class="font-medium mb-1">Account Security</h3>
                  <p class="text-sm text-muted-foreground">You are currently logged in via email and password.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  data() {
    return {
      user: null,
      newName: '',
      isSidebarOpen: true
    };
  },
  computed: {
    userInitial() {
      return (this.user?.displayName?.[0] || this.user?.email?.[0] || '?').toUpperCase();
    }
  },
  methods: {
    async updateName() {
      try {
        await updateProfile(auth.currentUser, { displayName: this.newName });
        alert('Profile updated!');
        this.user = { ...auth.currentUser };
      } catch (e) {
        console.error(e);
      }
    },
    async logout() {
      await signOut(auth);
      window.location.hash = '#/auth';
    }
  },
  mounted() {
    onAuthStateChanged(auth, (u) => {
      if (u) {
        this.user = u;
        this.newName = u.displayName || '';
      } else {
        window.location.hash = '#/auth';
      }
    });
  }
};
export default Profile;
