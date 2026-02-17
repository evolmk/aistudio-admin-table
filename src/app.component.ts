
import { Component, signal, ChangeDetectionStrategy, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconService } from './services/icon.service';
import { IconComponent, BtnComponent } from './components/ui/primitives';
import { DashboardViewComponent } from './pages/dashboard-view.component';
import { OrdersViewComponent } from './pages/orders-view.component';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent, BtnComponent, DashboardViewComponent, OrdersViewComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  private iconService = inject(IconService);
  
  // Set default to 'orders' to show the requested table UI immediately
  currentView = signal<'dashboard' | 'orders'>('orders');
  
  // Default to Collapsed (true) as requested for this subpage
  sidebarCollapsed = signal<boolean>(true); 
  
  profileOpen = signal<boolean>(false);
  searchOpen = signal<boolean>(false);
  breadcrumbOpen = signal<boolean>(false);

  // Menu Definition
  menuGroups = [
    {
      title: null, // No header for the first item
      items: [
        { label: 'Dashboard', icon: 'dashboard', id: 'dashboard' }
      ]
    },
    {
      title: 'Commercial',
      items: [
        { label: 'Orders', icon: 'orders', id: 'orders' },
        { label: 'Quotes', icon: 'quotes', id: 'quotes' },
        { label: 'Customers', icon: 'customers', id: 'customers' },
        { label: 'Vendors', icon: 'vendors', id: 'vendors' }
      ]
    },
    {
      title: 'Inventory',
      items: [
        { label: 'Parts', icon: 'parts', id: 'parts' },
        { label: 'Machines', icon: 'machines', id: 'machines' }
      ]
    },
    {
      title: 'Assets',
      items: [
        { label: 'Media', icon: 'media', id: 'media' },
        { label: 'Drawings', icon: 'drawings', id: 'drawings' }
      ]
    }
  ];

  @HostListener('window:keydown.meta.k', ['$event'])
  @HostListener('window:keydown.ctrl.k', ['$event'])
  handleSearchShortcut(event: KeyboardEvent) {
    event.preventDefault();
    this.toggleSearch();
  }

  @HostListener('window:keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent) {
    if (this.searchOpen()) {
      this.searchOpen.set(false);
    }
    if (this.breadcrumbOpen()) {
      this.breadcrumbOpen.set(false);
    }
  }

  setView(view: string) {
    // Basic navigation simulation
    if (view === 'dashboard' || view === 'orders') {
       this.currentView.set(view as any);
    } else {
       // Fallback for demo
       this.currentView.set('orders');
    }
    
    // On mobile, close sidebar after navigation
    if (window.innerWidth < 1024) {
      this.sidebarCollapsed.set(true);
    }
  }

  selectView(view: string) {
    this.setView(view);
    this.breadcrumbOpen.set(false);
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }

  toggleProfile() {
    this.profileOpen.update(v => !v);
  }

  toggleSearch() {
    this.searchOpen.update(v => !v);
  }

  toggleBreadcrumb() {
    this.breadcrumbOpen.update(v => !v);
  }
}
