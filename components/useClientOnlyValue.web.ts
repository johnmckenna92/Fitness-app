import { useSyncExternalStore } from 'react';

function emptySubscribe() {
  return () => {};
}

// `useSyncExternalStore` uses getServerSnapshot during SSR and getSnapshot on client,
// avoiding cascading render warnings.
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  return useSyncExternalStore<S | C>(
    emptySubscribe,
    () => client,
    () => server,
  );
}
