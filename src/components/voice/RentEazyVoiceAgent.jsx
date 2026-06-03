import { useEffect } from 'react';

// Official VoiceGlow / Tixae embed. The widget renders ITSELF (bottom-right
// bubble) using the design + logo configured in the agent dashboard — so your
// config is preserved. We only own the config object here; "modify for us" =
// position / stylesheets / user data, set below.
const AGENT_ID = import.meta.env.VITE_TIXAE_AGENT_ID || 'DbOkbg8YOyrFdlEt2OQO';
const REGION = import.meta.env.VITE_TIXAE_REGION || 'eu';
const VG_BUNDLE = 'https://vg-bunny-cdn.b-cdn.net/vg_live_build/vg_bundle.js';
const VG_STYLES = 'https://vg-bunny-cdn.b-cdn.net/vg_live_build/styles.css';

export default function RentEazyVoiceAgent() {
  useEffect(() => {
    // Inject once — survives client-side route changes / re-mounts.
    if (document.getElementById('vg-bundle-script')) return;

    window.VG_CONFIG = {
      ID: AGENT_ID,
      region: REGION,
      render: 'bottom-right', // Peazy's own floating bubble (carries the agent's logo)
      stylesheets: [VG_STYLES],
    };

    const script = document.createElement('script');
    script.id = 'vg-bundle-script';
    script.src = VG_BUNDLE;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  // Where the VG widget mounts.
  return <div id="VG_OVERLAY_CONTAINER" style={{ width: 0, height: 0 }} />;
}
