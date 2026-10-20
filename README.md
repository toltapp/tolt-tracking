# @tolt/tracking

Client-side tracking for [Tolt](https://tolt.com) affiliate programs. A typed wrapper around `tolt.js` that loads the script for you and gives you a clean API (plus a React component and hook) instead of reaching for `window`.

## Install

```bash
npm install @tolt/tracking
```

## React

Render `<ToltTracking />` once near the root of your app with your **public organization key** (Settings → Integrations):

```tsx
import { ToltTracking } from "@tolt/tracking/react";

export default function App() {
  return (
    <>
      <ToltTracking publicKey="YOUR_PUBLIC_ORG_KEY" />
      {/* your app */}
    </>
  );
}
```

Then track a signup wherever a referred visitor becomes a user:

```tsx
import { useEffect, useState } from "react";
import { useTolt } from "@tolt/tracking/react";

function SignUpForm() {
  const { ready, signup } = useTolt();
  const [newUserId, setNewUserId] = useState(null);

  // ready = tolt.js loaded and this visit's click recorded
  useEffect(() => {
    if (!ready || !newUserId) return;
    setNewUserId(null);
    signup(newUserId).then((result) => {
      // no customer_id when the visitor wasn't referred
      if (result?.customer_id) saveToltCustomerId(result.customer_id); // send this cus_ id with their payments
    });
  }, [ready, newUserId, signup]);

  function onSignedUp(user) {
    setNewUserId(user.id);
  }
  // ...
}
```

## Vanilla

```ts
import { init, getData, signup } from "@tolt/tracking";

await init({ publicKey: "YOUR_PUBLIC_ORG_KEY" }); // resolves once the click is recorded

const data = getData(); // ToltData | null
if (data && !data.customer_id) {
  const result = await signup("user@example.com");
  if (result?.customer_id) saveToltCustomerId(result.customer_id); // send this cus_ id with their payments
}
```

## API

| Export | Description |
| --- | --- |
| `init(options)` | Inject `tolt.js`. Resolves once this visit's click is recorded. Idempotent, no-op on the server. |
| `ready()` | Resolves with the referral (`ToltData` or `null`) once tolt.js has recorded the click. |
| `getData()` | The current referred visit (`ToltData`) or `null`. |
| `isReferred()` | `true` if this visit came from a partner link. |
| `signup(identifier)` | Convert the referred visitor into a customer. |
| `ToltTracking` (`/react`) | Component that loads the script. Renders nothing. |
| `useTolt()` (`/react`) | `{ data, ready, signup }`. `ready` turns `true` once the click is recorded. |

Payments are recorded server-side. See the [server-side tracking guide](https://docs.tolt.com/tracking/server-side).

## License

Apache-2.0
