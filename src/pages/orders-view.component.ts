
import { Component, ChangeDetectionStrategy, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, BadgeComponent, BtnComponent, IconComponent } from '../components/ui/primitives';

type Status = 'ACTIVE' | 'PENDING' | 'CONTACTED' | 'LEAD' | 'WON' | 'CANCELLED';

interface Row {
  id: string;
  name: string;
  company: string;
  status: Status;
  source: string;
  lastActivity: string;
}

@Component({
  selector: 'app-orders-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CardComponent, BadgeComponent, BtnComponent, IconComponent],
  template: `
    <div class="flex h-full relative">
      
      <!-- Secondary Sidebar -->
      <aside class="hidden lg:block w-64 bg-slate-50/50 border-r border-slate-200 flex-shrink-0 flex flex-col h-full">
        <!-- Added Search Input as requested -->
        <div class="p-6 pb-2">
           <div class="relative group">
             <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <app-icon name="search" [size]="5" class="text-slate-400"></app-icon>
             </div>
             <!-- Changed background to bg-slate-200 (darker) as requested -->
             <input type="text" placeholder="Search Orders" class="pl-10 pr-4 py-2 bg-slate-200 border border-transparent hover:bg-slate-300/50 hover:border-slate-300 rounded-lg text-sm w-full transition-all placeholder-slate-500 text-slate-700 focus:outline-none focus:ring-0">
           </div>
        </div>

        <div class="p-6 pt-2">
          
          <div class="space-y-6">
            <!-- Group -->
            <div>
              <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Payments</h3>
              <ul class="space-y-0.5">
                @for (item of secondaryNav.payments; track item.label) {
                  <li>
                    <button class="w-full flex items-center justify-between px-2 py-1.5 text-sm text-slate-600 rounded-md hover:bg-slate-100 transition-colors group">
                      <span>{{ item.label }}</span>
                      <span class="text-slate-400 text-xs font-medium group-hover:text-slate-600">{{ item.count }}</span>
                    </button>
                  </li>
                }
              </ul>
            </div>

            <!-- Group -->
            <div>
              <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Customers</h3>
              <ul class="space-y-0.5">
                @for (item of secondaryNav.customers; track item.label) {
                  <li>
                    <button 
                      class="w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors group"
                      [class.bg-slate-100]="item.active"
                      [class.text-slate-900]="item.active"
                      [class.font-medium]="item.active"
                      [class.text-slate-600]="!item.active"
                      [class.hover:bg-slate-100]="!item.active">
                      <span>{{ item.label }}</span>
                      <span class="text-slate-400 text-xs font-medium group-hover:text-slate-600">{{ item.count }}</span>
                    </button>
                  </li>
                }
              </ul>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 bg-white h-full relative">
        
        <!-- Header Section -->
        <div class="px-8 py-6 pb-2">
          
          <!-- Top Row -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
             <!-- Tabs -->
             <div class="flex items-center gap-6">
               @for (tab of tabs; track tab) {
                 <button 
                   (click)="activeTab.set(tab)"
                   class="pb-2 text-lg font-medium transition-all relative"
                   [class.text-blue-600]="activeTab() === tab"
                   [class.text-slate-500]="activeTab() !== tab"
                   [class.hover:text-slate-700]="activeTab() !== tab">
                   {{ tab }}
                   @if (activeTab() === tab) {
                     <span class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>
                   }
                 </button>
               }
             </div>

             <!-- Actions -->
             <div class="flex items-center gap-3">
                <button 
                  (click)="toggleSort()"
                  class="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                   Sort: Date
                   <app-icon name="chevronDown" [size]="3"></app-icon>
                </button>

                <button 
                  (click)="toggleFilterDrawer()"
                  class="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                   <app-icon name="filter" [size]="4"></app-icon>
                   Filter
                </button>

                <button class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm shadow-blue-500/20">
                   <app-icon name="plus" [size]="4"></app-icon>
                   Create
                </button>
             </div>
          </div>
        </div>

        <!-- Table Container -->
        <div class="flex-1 overflow-auto px-8 pb-4">
           <div class="min-w-full inline-block align-middle">
             <div class="border border-slate-200 rounded-lg overflow-hidden">
                <table class="min-w-full divide-y divide-slate-200">
                   <thead class="bg-slate-50">
                      <tr>
                         <th scope="col" class="px-4 py-3 w-4">
                            <input type="checkbox" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4">
                         </th>
                         <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                         <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                         <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                         <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Source</th>
                         <th scope="col" class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Activity</th>
                         <th scope="col" class="px-6 py-3 w-10"></th>
                      </tr>
                   </thead>
                   <tbody class="bg-white divide-y divide-slate-200">
                      @for (row of filteredRows(); track row.id) {
                         <tr class="hover:bg-slate-50 transition-colors group">
                            <td class="px-4 py-4 whitespace-nowrap">
                               <input type="checkbox" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4">
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                               <div class="text-sm font-medium text-slate-900">{{ row.name }}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                               <div class="text-sm text-slate-500">{{ row.company }}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                               <!-- Custom Badge Style -->
                               <span [class]="getBadgeClasses(row.status)">
                                  {{ row.status }}
                               </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                               <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                  {{ row.source }}
                               </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-500">
                               {{ row.lastActivity }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right">
                               <button class="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors">
                                  <app-icon name="moreVertical" [size]="4"></app-icon>
                               </button>
                            </td>
                         </tr>
                      }
                   </tbody>
                </table>
                
                <!-- Pagination -->
                <div class="bg-white px-4 py-3 border-t border-slate-200 flex items-center justify-between sm:px-6">
                   <div class="text-sm text-slate-500">
                      0 of {{ rows().length }} row(s) selected.
                   </div>
                   <div class="flex items-center gap-2">
                      <button class="flex items-center gap-1 px-3 py-1 text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50">
                         <app-icon name="chevronLeft" [size]="4" class="hidden"></app-icon> 
                         <span class="mr-1">&lsaquo;</span> Previous
                      </button>
                      
                      <div class="hidden sm:flex gap-1">
                         <button class="w-8 h-8 flex items-center justify-center text-sm font-medium rounded-md bg-white border border-slate-200 text-slate-900 shadow-sm">1</button>
                         <button class="w-8 h-8 flex items-center justify-center text-sm font-medium rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-700">2</button>
                         <button class="w-8 h-8 flex items-center justify-center text-sm font-medium rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-700">3</button>
                         <span class="w-8 h-8 flex items-center justify-center text-slate-400">...</span>
                      </div>

                      <button class="flex items-center gap-1 px-3 py-1 text-sm font-medium text-slate-500 hover:text-slate-700">
                         Next <span class="ml-1">&rsaquo;</span>
                      </button>
                   </div>
                </div>
             </div>
           </div>
        </div>

      </div>

      <!-- Filter Drawer Overlay -->
      @if (filterDrawerOpen()) {
         <div class="absolute inset-0 z-50 overflow-hidden">
            <div class="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" (click)="toggleFilterDrawer()"></div>
            
            <div class="absolute inset-y-0 right-0 max-w-sm w-full bg-white shadow-2xl border-l border-slate-200 transform transition-transform animate-slide-in-right flex flex-col">
               <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 class="text-lg font-bold text-slate-900">Filters</h2>
                  <button (click)="toggleFilterDrawer()" class="text-slate-400 hover:text-slate-600">
                     <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
               </div>
               
               <div class="flex-1 overflow-y-auto p-6 space-y-6">
                  <div>
                     <label class="block text-sm font-medium text-slate-700 mb-2">Status</label>
                     <div class="space-y-2">
                        <label class="flex items-center gap-2">
                           <input type="checkbox" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500">
                           <span class="text-sm text-slate-600">Active</span>
                        </label>
                        <label class="flex items-center gap-2">
                           <input type="checkbox" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500">
                           <span class="text-sm text-slate-600">Pending</span>
                        </label>
                        <label class="flex items-center gap-2">
                           <input type="checkbox" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500">
                           <span class="text-sm text-slate-600">Won</span>
                        </label>
                     </div>
                  </div>

                  <div>
                     <label class="block text-sm font-medium text-slate-700 mb-2">Source</label>
                     <select class="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
                        <option>All Sources</option>
                        <option>Website</option>
                        <option>Referral</option>
                        <option>Conference</option>
                     </select>
                  </div>
               </div>

               <div class="p-6 border-t border-slate-100 bg-slate-50">
                  <div class="flex gap-3">
                     <button class="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-white transition-colors" (click)="toggleFilterDrawer()">Reset</button>
                     <button class="flex-1 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors" (click)="toggleFilterDrawer()">Apply</button>
                  </div>
               </div>
            </div>
         </div>
      }

    </div>
  `,
  styles: [`
    @keyframes slide-in-right {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    .animate-slide-in-right {
      animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class OrdersViewComponent {
  activeTab = signal<'Pending' | 'Completed' | 'Archive'>('Pending');
  tabs = ['Pending', 'Completed', 'Archive'];
  filterDrawerOpen = signal(false);

  // Mock Secondary Nav Data (Ecommerce/Stripe style)
  secondaryNav = {
    payments: [
      { label: 'All payments', count: 89 },
      { label: 'Succeeded', count: 23 },
      { label: 'Refunded', count: 12 },
      { label: 'Uncaptured', count: 2 }
    ],
    customers: [
      { label: 'All customers', count: 24, active: false },
      { label: 'Top spenders', count: 45, active: false },
      { label: 'Repeat buyers', count: 12, active: true },
      { label: 'Recent', count: 89, active: false },
      { label: 'Abandoned', count: 64, active: false },
    ]
  };

  rows = signal<Row[]>([
    { id: '1', name: 'Guillermo Rauch', company: 'Vercel', status: 'ACTIVE', source: 'Website', lastActivity: '30m ago' },
    { id: '2', name: 'Lee Robinson', company: 'Vercel', status: 'ACTIVE', source: 'Referral', lastActivity: '2h ago' },
    { id: '3', name: 'Sam Altman', company: 'OpenAI', status: 'LEAD', source: 'Social Media', lastActivity: '4h ago' },
    { id: '4', name: 'Michael Andreuzza', company: 'Lexington', status: 'CONTACTED', source: 'Conference', lastActivity: '5h ago' },
    { id: '5', name: 'Skyleen', company: 'Animate UI', status: 'CONTACTED', source: 'Referral', lastActivity: '7h ago' },
    { id: '6', name: 'Sahaj', company: 'Tweakcn', status: 'LEAD', source: 'Website', lastActivity: '8h ago' },
    { id: '7', name: 'Arham Khan', company: 'Weblabs Studio', status: 'WON', source: 'Website', lastActivity: '1d ago' },
    { id: '8', name: 'Sarah Drasner', company: 'Netlify', status: 'ACTIVE', source: 'Referral', lastActivity: '1d ago' },
    { id: '9', name: 'Brian Lovin', company: 'GitHub', status: 'LEAD', source: 'Social Media', lastActivity: '2d ago' },
    { id: '10', name: 'Adam Wathan', company: 'Tailwind Labs', status: 'WON', source: 'Website', lastActivity: '2d ago' },
    { id: '11', name: 'Steve Schoger', company: 'Tailwind Labs', status: 'ACTIVE', source: 'Referral', lastActivity: '3d ago' },
    { id: '12', name: 'Dan Abramov', company: 'Meta', status: 'CONTACTED', source: 'Conference', lastActivity: '3d ago' },
    { id: '13', name: 'Evan You', company: 'Vue.js', status: 'ACTIVE', source: 'Website', lastActivity: '4d ago' },
    { id: '14', name: 'Rich Harris', company: 'Vercel', status: 'LEAD', source: 'Social Media', lastActivity: '5d ago' },
    { id: '15', name: 'Cassidy Williams', company: 'Netlify', status: 'WON', source: 'Referral', lastActivity: '5d ago' },
  ]);

  filteredRows = computed(() => this.rows());

  toggleFilterDrawer() {
    this.filterDrawerOpen.update(v => !v);
  }

  toggleSort() {
    // Placeholder
  }

  getBadgeClasses(status: Status): string {
    const base = "inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide";
    switch (status) {
      case 'ACTIVE': return `${base} bg-emerald-100 text-emerald-800`;
      case 'LEAD': return `${base} bg-amber-100 text-amber-800`;
      case 'CONTACTED': return `${base} bg-blue-100 text-blue-800`;
      case 'WON': return `${base} bg-purple-100 text-purple-800`;
      case 'PENDING': return `${base} bg-yellow-100 text-yellow-800`;
      case 'CANCELLED': return `${base} bg-red-100 text-red-800`;
      default: return `${base} bg-gray-100 text-gray-800`;
    }
  }
}
