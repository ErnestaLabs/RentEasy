/**
 * PhoneFrame — renders a minimal phone bezel around its children.
 * Designed for 1280×720 Remotion canvas; default size ~340×620px.
 * All styling is inline (no Tailwind) for Remotion compatibility.
 */

import React from 'react';

const C = {
  navy:      '#06182f',
  navyMid:   '#092243',
  green:     '#52a832',
  greenPale: '#9bd383',
  white:     '#ffffff',
};

export function PhoneFrame({
  children,
  width  = 340,
  height = 620,
  style  = {},
}) {
  const bezelPad  = 10;
  const cornerR   = 40;
  const innerW    = width  - bezelPad * 2;
  const innerH    = height - bezelPad * 2;
  const innerR    = cornerR - bezelPad;

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        borderRadius: cornerR,
        background: 'linear-gradient(160deg, #1a2740 0%, #0d1e35 100%)',
        boxShadow: [
          '0 40px 80px rgba(0,0,0,0.65)',
          '0 0 0 1.5px rgba(255,255,255,0.13)',
          'inset 0 1px 0 rgba(255,255,255,0.12)',
          'inset 0 -1px 0 rgba(0,0,0,0.4)',
        ].join(', '),
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Side buttons — left */}
      <div style={{
        position: 'absolute',
        left: -3,
        top: 100,
        width: 3,
        height: 38,
        background: 'rgba(255,255,255,0.12)',
        borderRadius: '2px 0 0 2px',
      }} />
      <div style={{
        position: 'absolute',
        left: -3,
        top: 150,
        width: 3,
        height: 60,
        background: 'rgba(255,255,255,0.12)',
        borderRadius: '2px 0 0 2px',
      }} />

      {/* Side button — right (power) */}
      <div style={{
        position: 'absolute',
        right: -3,
        top: 130,
        width: 3,
        height: 52,
        background: 'rgba(255,255,255,0.12)',
        borderRadius: '0 2px 2px 0',
      }} />

      {/* Notch / Dynamic Island */}
      <div style={{
        position: 'absolute',
        top: bezelPad + 8,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 96,
        height: 28,
        background: '#040d1a',
        borderRadius: 14,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}>
        {/* Camera */}
        <div style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #1a2740, #040d1a)',
          border: '1px solid rgba(255,255,255,0.08)',
        }} />
        {/* Mic dot */}
        <div style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#0a1525',
        }} />
      </div>

      {/* Inner screen */}
      <div
        style={{
          position: 'absolute',
          top:    bezelPad,
          left:   bezelPad,
          width:  innerW,
          height: innerH,
          borderRadius: innerR,
          overflow: 'hidden',
          background: C.navy,
        }}
      >
        {children}
      </div>

      {/* Bottom home indicator */}
      <div style={{
        position: 'absolute',
        bottom: bezelPad + 6,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 100,
        height: 4,
        background: 'rgba(255,255,255,0.22)',
        borderRadius: 2,
      }} />
    </div>
  );
}

export default PhoneFrame;
