# lit.js (Local Lit HTML & LitElement Bundle)

This is a **locally hosted bundle** of `lit-html` and `lit-element` version **2.8.0 / 3.3.3**, stored at:

```
/home/homeassistant/.homeassistant/www/vendor/lit/lit.js
```

It is used to patch frontend custom cards that normally import `lit-html` from external CDNs like `unpkg.com`, which is **blocked by CORS** in Home Assistant’s frontend (running under `http://localhost` or `http://rpi4b-kitchen:8123`).

## Why This Exists

Some custom Lovelace cards (like `power-todoist-card`) directly import Lit like this:

```js
import { LitElement, html, css } from 'lit';
```

Or:

```js
import { html } from 'https://unpkg.com/lit-html?module';
```

These requests fail in Home Assistant due to **strict CORS policy** and lack of appropriate headers on the external CDN.

## Solution

We manually bundled Lit 2.8.0 / 3.3.3 using `rollup` and stored it locally in this path:

```html
<script type="module" src="/local/vendor/lit/lit.js"></script>
```

Cards are then patched to import from this local path:

```js
import { LitElement, html, css } from '/local/vendor/lit/lit.js';
```

## Version Info

This file was built using:

- `lit-html` 2.8.0  
- `lit-element` 3.3.3  

These versions are compatible with many modern Home Assistant cards and match the versions used in most upstream CDN builds.

## Maintenance

If this file ever breaks due to dependency changes or browser updates:

1. Rebuild it using the `rollup` config in your `~/lit-html-build` folder.
2. Copy the resulting `lit-html.bundle.js` into this directory.
3. Rename to `lit.js` and verify the card loads correctly.

---

This is a **manual patch workaround** for CORS issues. Cards relying on this should include a comment noting the local import dependency.