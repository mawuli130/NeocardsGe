import { auth, db } from '../firebase-config.js';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const History = {
  template: `
    <div class="min-h-screen bg-background flex flex-col md:flex-row">
      <!-- Sidebar -->
      <aside v-if="isSidebarOpen" class="w-full md:w-64 bg-card border-r border-border p-6 flex flex-col shrink-0">
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
          <a href="#/history" class="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg bg-accent text-accent-foreground transition-colors">
             History
          </a>
          <a href="#/profile" class="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent text-muted-foreground transition-colors">
             Profile
          </a>
        </nav>

        <div class="pt-4 border-t border-border mt-auto">
          <button @click="logout" class="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
            Logout
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header class="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
          <div class="flex items-center gap-4">
            <button @click="toggleSidebar" class="p-2 hover:bg-accent rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 class="font-semibold">Recent Messages</h1>
          </div>
        </header>

        <main class="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/20">
          <div class="max-w-5xl mx-auto space-y-6">
            <!-- Table Container -->
            <div class="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <table class="w-full text-left border-collapse">
                <thead class="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th class="px-6 py-4">Status</th>
                    <th class="px-6 py-4">Prompt</th>
                    <th class="px-6 py-4">Response Preview</th>
                    <th class="px-6 py-4">Date</th>
                    <th class="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  <tr v-for="item in filteredHistory" :key="item.id" class="group hover:bg-muted/30 transition-colors">
                    <td class="px-6 py-4">
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                        Completed
                      </span>
                    </td>
                    <td class="px-6 py-4 max-w-xs truncate font-medium text-foreground">
                      {{ item.prompt }}
                    </td>
                    <td class="px-6 py-4 max-w-md truncate text-muted-foreground text-sm italic">
                      {{ item.response }}
                    </td>
                    <td class="px-6 py-4 text-sm text-muted-foreground">
                      {{ formatDate(item.timestamp) }}
                    </td>
                    <td class="px-6 py-4 text-right">
                      <button @click="remove(item.id)" class="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="history.length === 0" class="p-12 text-center text-muted-foreground">
                No recent messages.
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  data() {
    return { history: [], isSidebarOpen: true };
  },
  computed: {
    filteredHistory() { return this.history; }
  },
  methods: {
    formatDate(ts) {
      if (!ts) return '...';
      return new Date(ts).toLocaleString();
    },
    async loadHistory() {
      const user = auth.currentUser;
      if (!user) return;
      const q = query(collection(db, "chatHistory"), where("userId", "==", user.uid), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      this.history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async remove(id) {
      if (confirm('Delete this message?')) {
        await deleteDoc(doc(db, "chatHistory", id));
        this.history = this.history.filter(item => item.id !== id);
      }
    },
    async logout() {
      await signOut(auth);
      window.location.hash = '#/auth';
    },
    toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  },
  mounted() {
    onAuthStateChanged(auth, (user) => {
      if (user) this.loadHistory();
      else window.location.hash = '#/auth';
    });
  }
};
export default History;
