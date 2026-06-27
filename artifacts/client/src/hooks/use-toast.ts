type ToastMsg = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

type Listener = (msg: ToastMsg) => void
let _listeners: Listener[] = []

export function toast(msg: ToastMsg) {
  _listeners.forEach((l) => l(msg))
}

export function _subscribeToast(fn: Listener) {
  _listeners.push(fn)
  return () => {
    _listeners = _listeners.filter((l) => l !== fn)
  }
}

export function useToast() {
  return { toast }
}
