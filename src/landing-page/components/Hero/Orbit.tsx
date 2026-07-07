import React, { useState } from 'react';
import { cn } from "../../../client/utils";
import { CXSATLogo } from "../../../client/components/CXSATLogo";
import {
  QRChannelLogo,
  USSDChannelLogo,
  VocalChannelLogo,
  SMSChannelLogo,
  DashboardChannelLogo,
  AlerteChannelLogo,
  SmileChannelLogo,
  SecurityChannelLogo,
} from "../../logos/ChannelLogos";

interface LogoConfig {
  id: string;
  component: React.ComponentType;
  circleIndex: number;
  position: number;
  size?: number;
}

const logoConfigs: LogoConfig[] = [
  { id: "qr", component: QRChannelLogo, circleIndex: 1, position: 0 },
  { id: "ussd", component: USSDChannelLogo, circleIndex: 1, position: 120 },
  { id: "vocal", component: VocalChannelLogo, circleIndex: 1, position: 240 },

  { id: "sms", component: SMSChannelLogo, circleIndex: 2, position: 60 },
  { id: "dashboard", component: DashboardChannelLogo, circleIndex: 2, position: 180 },
  { id: "alerte", component: AlerteChannelLogo, circleIndex: 2, position: 300 },

  { id: "smile", component: SmileChannelLogo, circleIndex: 3, position: 90 },
  { id: "security", component: SecurityChannelLogo, circleIndex: 3, position: 270 },
];

const circles = [
  { radius: 120, orbitPeriod: 72, ringPeriod: 180 },
  { radius: 180, orbitPeriod: 120, ringPeriod: 240 },
  { radius: 240, orbitPeriod: 180, ringPeriod: 360 },
];

const ringGradients = [
  `conic-gradient(from 0deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0), hsl(var(--primary) / 0.15))`,
  `conic-gradient(from 45deg, hsl(var(--secondary) / 0.12), hsl(var(--secondary) / 0), hsl(var(--secondary) / 0.12))`,
  `conic-gradient(from 90deg, hsl(var(--accent) / 0.1), hsl(var(--accent) / 0), hsl(var(--accent) / 0.1))`,
];

export function Orbit() {
  return (
    <div className="relative flex h-[500px] w-[500px] items-center justify-center">
      <style>{`
        @keyframes ring-spin { to { transform: rotate(360deg); } }
        @keyframes orbit-spin {
          from { transform: rotate(var(--start-angle, 0deg)); }
          to { transform: rotate(calc(var(--start-angle, 0deg) + 360deg)); }
        }
        @keyframes orbit-counter-spin {
          from { transform: rotate(calc(var(--start-angle, 0deg) * -1)); }
          to { transform: rotate(calc(var(--start-angle, 0deg) * -1 - 360deg)); }
        }
      `}</style>

      <div className="absolute flex flex-col items-center gap-1 z-10">
        <p className="text-gradient-primary font-sans text-5xl font-black leading-none">
          98%
        </p>
        <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">Satisfaction</p>
      </div>

      {circles.map((circle, circleIndex) => (
        <div
          key={circleIndex}
          className="absolute rounded-full"
          style={{
            width: circle.radius * 2,
            height: circle.radius * 2,
            background: ringGradients[circleIndex],
            mask: `radial-gradient(circle at center, transparent ${circle.radius - 2}px, black ${circle.radius - 1}px, black ${circle.radius}px, transparent ${circle.radius + 1}px)`,
            WebkitMask: `radial-gradient(circle at center, transparent ${circle.radius - 2}px, black ${circle.radius - 1}px, black ${circle.radius}px, transparent ${circle.radius + 1}px)`,
            animation: `ring-spin ${circle.ringPeriod}s linear infinite`,
          }}
        />
      ))}

      {logoConfigs.map((logoConfig) => {
        const circle = circles[logoConfig.circleIndex - 1];
        const logoSize = logoConfig.size || 36;
        const LogoComponent = logoConfig.component;

        return (
          <div
            key={logoConfig.id}
            className="absolute left-1/2 top-1/2"
            style={{
              width: 0,
              height: 0,
              "--start-angle": `${logoConfig.position}deg`,
              animation: `orbit-spin ${circle.orbitPeriod}s linear infinite`,
            } as React.CSSProperties}
          >
            <div style={{ transform: `translateX(${circle.radius}px)` }}>
              <div
                className="z-20 flex items-center justify-center bg-card border border-border p-1.5 rounded-full shadow-md"
                style={{
                  width: logoSize,
                  height: logoSize,
                  marginLeft: -logoSize / 2,
                  marginTop: -logoSize / 2,
                  animation: `orbit-counter-spin ${circle.orbitPeriod}s linear infinite`,
                }}
              >
                <LogoComponent />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
