// How messages travel. A transport only ever delivers messages from the verified other side: for windows that
// means the sender is exactly the window and the origin we expect, and we only post to that exact origin.
export type Transport = {
  post(message: unknown): void
  listen(handler: (data: unknown) => void): () => void
}

type Messenger = { postMessage(message: unknown, targetOrigin: string): void }
type MessageSource = { addEventListener(type: 'message', listener: (event: MessageEvent) => void): void; removeEventListener(type: 'message', listener: (event: MessageEvent) => void): void }

export function windowTransport(self: MessageSource, other: Messenger, otherOrigin: string): Transport {
  return {
    post: (message) => other.postMessage(message, otherOrigin),
    listen(handler) {
      const listener = (event: MessageEvent) => {
        if (event.source === other && event.origin === otherOrigin) handler(event.data)
      }
      self.addEventListener('message', listener)
      return () => self.removeEventListener('message', listener)
    },
  }
}

// The course learns who embeds it from its own URL fragment (`#ck-host=<origin>&ck-protocol=1`): a self-hosted
// host is not known at build time. Anything that is not a plain http(s) origin is ignored.
export function embeddingOrigin(hash: string): string | undefined {
  const value = new URLSearchParams(hash.replace(/^#/, '')).get('ck-host')
  if (!value) return undefined
  try {
    const url = new URL(value)
    return (url.protocol === 'https:' || url.protocol === 'http:') && url.origin === value ? value : undefined
  } catch {
    return undefined
  }
}

export const embeddingFragment = (hostOrigin: string, protocol: number) => `#ck-host=${encodeURIComponent(hostOrigin)}&ck-protocol=${protocol}`
