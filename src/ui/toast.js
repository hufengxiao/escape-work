/**
 * Toast Notification system following modern web guidance (popover="manual" with progressive enhancement)
 */

class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    if (!document.getElementById('toast-container')) {
      const container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
      this.container = container;
    } else {
      this.container = document.getElementById('toast-container');
    }
  }

  show(message, type = 'info', duration = 3200) {
    if (!this.container) this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Modern Popover manual if supported
    if ('popover' in HTMLElement.prototype) {
      toast.setAttribute('popover', 'manual');
    }

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
        if (toast.hidePopover && toast.hasAttribute('popover')) {
          try { toast.hidePopover(); } catch {}
        }
        toast.remove();
      }, 250);
    };

    closeBtn.addEventListener('click', dismiss);

    this.container.appendChild(toast);

    if (toast.showPopover && toast.hasAttribute('popover')) {
      try { toast.showPopover(); } catch {}
    }

    // Auto dismiss
    setTimeout(dismiss, duration);
  }
}

export const toast = new ToastManager();
