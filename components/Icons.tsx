
import React from 'react';

const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  />
);

export const SpeakerIcon: React.FC = () => (
  <Icon>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
  </Icon>
);

export const RefreshCwIcon: React.FC = () => (
  <Icon>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
    <path d="M21 3v5h-5"></path>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
    <path d="M3 21v-5h5"></path>
  </Icon>
);

export const GridIcon: React.FC = () => (
    <Icon>
        <rect width="18" height="18" x="3" y="3" rx="2"></rect>
        <path d="M3 9h18"></path><path d="M3 15h18"></path>
        <path d="M9 3v18"></path><path d="M15 3v18"></path>
    </Icon>
);

export const DicesIcon: React.FC = () => (
    <Icon>
        <rect width="12" height="12" x="2" y="10" rx="2" ry="2"></rect>
        <path d="m17.92 14.8-4.24-4.24"></path>
        <path d="M12 18h.01"></path>
        <path d="M12 14h.01"></path>
        <path d="M8 18h.01"></path>
        <path d="M8 14h.01"></path>
        <path d="M16 14h.01"></path>
        <rect width="12" height="12" x="10" y="2" rx="2" ry="2"></rect>
        <path d="M14 8h.01"></path>
        <path d="M18 8h.01"></path>
        <path d="M18 4h.01"></path>
        <path d="M14 4h.01"></path>
    </Icon>
);

export const HelpCircleIcon: React.FC = () => (
    <Icon>
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </Icon>
);

export const CheckIcon: React.FC = () => (
    <Icon>
        <polyline points="20 6 9 17 4 12"></polyline>
    </Icon>
);

export const ZoomInIcon: React.FC = () => (
    <Icon>
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        <line x1="11" y1="8" x2="11" y2="14"></line>
        <line x1="8" y1="11" x2="14" y2="11"></line>
    </Icon>
);

export const ZoomOutIcon: React.FC = () => (
    <Icon>
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        <line x1="8" y1="11" x2="14" y2="11"></line>
    </Icon>
);
