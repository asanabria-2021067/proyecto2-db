import Swal from 'sweetalert2'

const swalTheme = {
  background: 'var(--card)',
  color: 'var(--card-foreground)',
  confirmButtonColor: 'oklch(0.45 0.18 265)',
  cancelButtonColor: 'oklch(0.50 0.01 75)',
}

const swalClasses = {
  popup: 'swal-popup',
  title: 'swal-title',
  htmlContainer: 'swal-text',
  icon: 'swal-icon',
  confirmButton: 'swal-confirm',
  cancelButton: 'swal-cancel',
}

export function useConfirm(opts: {
  title: string
  text?: string
  confirmText?: string
  cancelText?: string
  icon?: 'warning' | 'question' | 'info'
}) {
  return Swal.fire({
    title: opts.title,
    text: opts.text,
    icon: opts.icon ?? 'warning',
    showCancelButton: true,
    confirmButtonText: opts.confirmText ?? 'Si, continuar',
    cancelButtonText: opts.cancelText ?? 'Cancelar',
    reverseButtons: true,
    buttonsStyling: false,
    customClass: swalClasses,
    ...swalTheme,
  })
}

export function useSuccess(title: string, text?: string) {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    timer: 2000,
    showConfirmButton: false,
    customClass: swalClasses,
    ...swalTheme,
  })
}

export function useError(title: string, text?: string) {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'Entendido',
    buttonsStyling: false,
    customClass: swalClasses,
    ...swalTheme,
  })
}
