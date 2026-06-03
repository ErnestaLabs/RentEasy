import React from 'react';
import { useLandingSpec } from './useLandingSpec.js';
import LandingRenderer from './LandingRenderer.jsx';

// Self-contained personalised landing: captures signals → derives a LandingSpec
// at runtime → renders it. Degrades to the default spec when there are no
// signals. `profile` (optional) is the chosen role used as an intent hint.
export default function PersonalisedLanding({ profile = null }) {
  const spec = useLandingSpec(profile);
  return <LandingRenderer spec={spec} />;
}
