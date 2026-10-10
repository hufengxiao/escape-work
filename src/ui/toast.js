/**
 * Toast Notification system following modern web guidance (popover="manual" with progressive enhancement)
 */

class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    if (typeof document === 'undefined') return;
    if (!document.getElementById('toast-container')) {
      const container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      if ('popover' in HTMLElement.prototype) {
        container.setAttribute('popover', 'manual');
      }
      document.body.appendChild(container);
      this.container = container;
      if (container.showPopover && container.hasAttribute('popover')) {
        try { container.showPopover(); } catch {}
      }
    } else {
      this.container = document.getElementById('toast-container');
    }
  }

  show(message, type = 'info', duration = 3200) {
    if (typeof document === 'undefined') return;
    if (!this.container) this.init();
    if (!this.container) return;

    if (this.container.showPopover && this.container.hasAttribute('popover')) {
      try { this.container.showPopover(); } catch {}
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconMap = {
      info: '📢',
      success: '🎉',
      warning: '⚠️',
      alert: '🚨',
      item: '🎒',
      achievement: '🏆'
    };

    const icon = iconMap[type] || '💬';

    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${icon}</span>
        <span class="toast-text">${message}</span>
      </div>
      <button class="toast-close" aria-label="关闭">&times;</button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    const dismiss = () => {
      toast.classList.add('toast-exit');
      setTimeout(() => {
        toast.remove();
      }, 250);
    };

    closeBtn.addEventListener('click', dismiss);

    this.container.appendChild(toast);

    // Auto dismiss
    setTimeout(dismiss, duration);
  }
}

export const toast = new ToastManager();
