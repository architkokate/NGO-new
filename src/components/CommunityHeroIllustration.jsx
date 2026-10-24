import React from 'react';

/**
 * CommunityHeroIllustration
 * A modern community-focused hero illustration with floating circular images,
 * connected node paths, subtle decorative icons, soft shadows, and warm orange accents.
 */
export default function CommunityHeroIllustration() {
  return (
    <div className="community-hero-illustration" aria-hidden="true">
      {/* Background Soft Ambient Blobs */}
      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />

      {/* SVG Network Lines & Decorative Elements */}
      <svg
        className="hero-network-svg"
        viewBox="0 0 440 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Network connection dashed paths between circles */}
        <path
          d="M 220 145 L 105 85"
          stroke="#FF7A1A"
          strokeWidth="2"
          strokeDasharray="4 6"
          strokeOpacity="0.4"
        />
        <path
          d="M 220 145 L 345 95"
          stroke="#FF7A1A"
          strokeWidth="2"
          strokeDasharray="4 6"
          strokeOpacity="0.4"
        />
        <path
          d="M 220 145 L 115 240"
          stroke="#FF7A1A"
          strokeWidth="2"
          strokeDasharray="4 6"
          strokeOpacity="0.35"
        />
        <path
          d="M 220 145 L 340 230"
          stroke="#FF7A1A"
          strokeWidth="2"
          strokeDasharray="4 6"
          strokeOpacity="0.35"
        />

        {/* Floating decorative sparkles/dots */}
        <circle cx="215" cy="40" r="4" fill="#FF7A1A" opacity="0.6" />
        <circle cx="240" cy="50" r="2.5" fill="#F9B233" opacity="0.7" />
        <circle cx="45" cy="180" r="3.5" fill="#FF7A1A" opacity="0.5" />
        <circle cx="395" cy="160" r="4" fill="#F9B233" opacity="0.6" />
        <circle cx="220" cy="275" r="3" fill="#FF7A1A" opacity="0.4" />

        {/* Decorative heart / community icon badge center line */}
        <g transform="translate(208, 32)">
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="#FF7A1A"
            opacity="0.15"
          />
        </g>
      </svg>

      {/* Floating Circular Image Nodes */}
      {/* 1. Central Hero Node (Family) */}
      <div className="circle-node node-center" title="Families">
        <div className="circle-image-ring">
          <img src="/images/community/family.png" alt="Happy family" />
        </div>
        <div className="node-badge node-badge-orange">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.684a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
      </div>

      {/* 2. Top-Left Node (Elderly People) */}
      <div className="circle-node node-top-left" title="Elderly Care">
        <div className="circle-image-ring">
          <img src="/images/community/elderly.png" alt="Elderly couple" />
        </div>
      </div>

      {/* 3. Top-Right Node (Volunteers) */}
      <div className="circle-node node-top-right" title="Volunteers">
        <div className="circle-image-ring">
          <img src="/images/community/volunteers.png" alt="Volunteers" />
        </div>
        <div className="node-badge node-badge-gold">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
      </div>

      {/* 4. Bottom-Left Node (Caregivers & Children) */}
      <div className="circle-node node-bottom-left" title="Caregivers & Youth">
        <div className="circle-image-ring">
          <img src="/images/community/caregiver.png" alt="Caregiver and child" />
        </div>
      </div>

      {/* 5. Bottom-Right Node (Community Members) */}
      <div className="circle-node node-bottom-right" title="Community Members">
        <div className="circle-image-ring">
          <img src="/images/community/member.png" alt="Community member" />
        </div>
        <div className="node-badge node-badge-orange">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
