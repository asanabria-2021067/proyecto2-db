import Swal from 'sweetalert2'

const swalDefaults = {
  background: 'var(--card)',
  color: 'var(--card-foreground)',
  confirmButtonColor: 'oklch(0.45 0.18 265)',
  cancelButtonColor: 'oklch(0.50 0.01 75)',
  customClass: {
    popup: 'swal-popup',
    title: 'swal-title',
    htmlContainer: 'swal-text',
    icon: 'swal-icon',
    confirmButton: 'swal-confirm',
    cancelButton: 'swal-cancel',
  },
}

export function useConfirm(opts: {
  title: string
  text?: string
  confirmText?: string
  cancelText?: string
  icon?: 'warning' | 'question' | 'info'
}) {
  return Swal.fire({
    ...swalDefaults,
    title: opts.title,
    text: opts.text,
    icon: opts.icon ?? 'warning',
    iconColor: 'var(--primary)',
    showCancelButton: true,
    confirmButtonText: opts.confirmText ?? 'Si, continuar',
    cancelButtonText: opts.cancelText ?? 'Cancelar',
    reverseButtons: true,
    buttonsStyling: false,
    showClass: { popup: 'swal2-show', backdrop: 'swal2-backdrop-show' },
    hideClass: { popup: 'swal2-hide', backdrop: 'swal2-backdrop-hide' },
  })
}

export function useSuccess(title: string, text?: string) {
  return Swal.fire({
    ...swalDefaults,
    title,
    text,
    icon: 'success',
    iconColor: 'oklch(0.65 0.2 145)',
    timer: 1800,
    timerProgressBar: true,
    showConfirmButton: false,
    showClass: { popup: 'swal2-show' },
  })
}

export function useError(title: string, text?: string) {
  return Swal.fire({
    ...swalDefaults,
    title,
    text,
    icon: 'error',
    iconColor: 'var(--destructive)',
    confirmButtonText: 'Entendido',
    buttonsStyling: false,
  })
}
