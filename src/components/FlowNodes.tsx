import React, { memo } from 'react';
import { Icon } from '@iconify/react';
import jsonqlLogo from '../assets/logo.svg';

// STYLES
const nodeStyle = {
  width: '100%',
  height: '100%',
  background: 'var(--sl-color-gray-6)',
  border: '2px solid var(--sl-color-gray-4)',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '1rem 0',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  transition: 'transform 0.3s ease, border-color 0.3s ease',
  color: 'white',
  overflow: 'hidden',
  position: 'relative' as const,
  zIndex: 10,
};

const labelStyle = {
  fontSize: '0.75rem',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  color: 'var(--sl-color-gray-3)',
  marginBottom: '0.5rem',
  fontWeight: 600,
};

// ICONS (Custom)
const JsonIcon = () => (
  <Icon icon="logos:json" width="60" height="60" />
);

const JsonqlIcon = () => (
  <img src={jsonqlLogo.src || jsonqlLogo} alt="JSONQL" style={{ width: '100%', height: '100%' }} />
);

// ---------------- NODES ----------------

const ICON_SIZE = 60;

const IconRenderer = ({ icon, type }: { icon: string, type?: 'custom' | 'iconify' }) => {
    if (type === 'custom') {
        if (icon === 'json') return <JsonIcon />;
        if (icon === 'jsonql') return <JsonqlIcon />;
        return null;
    }
    return <Icon icon={icon} width={ICON_SIZE} height={ICON_SIZE} />;
};

export const InputNode = memo(({ label }: any) => {
  return (
    <div style={nodeStyle}>
      <div style={labelStyle}>Input</div>
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
         <div style={{width: ICON_SIZE, height: ICON_SIZE, color: 'var(--sl-color-text-accent)'}}>
            <IconRenderer icon="json" type="custom" />
         </div>
      </div>
    </div>
  );
});

export const TechNode = memo(({ label, icon, iconType }: { label: string, icon: string, iconType?: 'custom' | 'iconify' }) => {
    return (
      <div style={nodeStyle}>
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{width: ICON_SIZE, height: ICON_SIZE, color: 'var(--sl-color-text-accent)'}}>
                <IconRenderer icon={icon} type={iconType} />
            </div>
        </div>
      </div>
    );
  });
  
export const DbNode = memo(({ label, icon, iconType }: { label: string, icon: string, iconType?: 'custom' | 'iconify' }) => {
    return (
      <div style={nodeStyle}>
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{width: ICON_SIZE, height: ICON_SIZE, color: 'var(--sl-color-text-accent)'}}>
                <IconRenderer icon={icon} type={iconType} />
            </div>
        </div>
      </div>
    );
  });

