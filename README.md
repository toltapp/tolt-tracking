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
import { useTolt } from "@tolt/tracking/react";

function SignUpForm() {
  const { data, signup } = useTolt();

  async function onSubmit(user) {
    // only referred visitors have data; don't sign the same one up twice
    if (data && !data.customer_id) {
      await signup(user.id); // use the SAME id you'll send with their payments
    }
  }
  // ...
}
```

## Vanilla

```ts
import { init, getData, signup } from "@tolt/tracking";

await init({ publicKey: "YOUR_PUBLIC_ORG_KEY" });

const data = getData(); // ToltData | null
if (data && !data.customer_id) {
  await signup("user@example.com");
}
```

## API

| Export | Description |
| --- | --- |
| `init(options)` | Inject `tolt.js`. Idempotent, no-op on the server. |
| `getData()` | The current referred visit (`ToltData`) or `null`. |
| `isReferred()` | `true` if this visit came from a partner link. |
| `signup(identifier)` | Convert the referred visitor into a customer. |
| `ToltTracking` (`/react`) | Component that loads the script. Renders nothing. |
| `useTolt()` (`/react`) | `{ data, ready, signup }`. |

Payments are recorded server-side. See the [server-side tracking guide](https://docs.tolt.com/tracking/server-side).

## License

Apache-2.0
