import React from 'react';

/**
 * HeroPhotoComposition
 * Renders a human-centered photo composition with floating circular and rounded photo frames.
 * Uses real photographs from Unsplash stored in public/images/community.
 * 
 * Props:
 *   variant: 'login' | 'forgot' | 'signup'
 */

const CONFIGS = {
  login: {
    main: {
      src: '/images/community/login_main.jpg',
      alt: 'Smiling community volunteers and family',
      title: 'Community & Family'
    },
    items: [
      {
        id: 'top-left',
        src: '/images/community/login_elderly.jpg',
        alt: 'Senior elderly couple sharing a joyful moment',
        title: 'Elderly Support',
        className: 'photo-node photo-node-top-left',
        shape: 'circle'
      },
      {
        id: 'top-right',
        src: '/images/community/login_volunteers.jpg',
        alt: 'NGO volunteers working together',
        title: 'Active Volunteers',
        className: 'photo-node photo-node-top-right',
        shape: 'circle',
        badge: 'gold'
      },
      {
        id: 'bottom-left',
        src: '/images/community/login_child.jpg',
        alt: 'Happy child supported by community mentor',
        title: 'Youth & Mentorship',
        className: 'photo-node photo-node-bottom-left',
        shape: 'rounded'
      },
      {
        id: 'bottom-right',
        src: '/images/community/login_member.jpg',
        alt: 'Smiling community member',
        title: 'Community Members',
        className: 'photo-node photo-node-bottom-right',
        shape: 'circle',
        badge: 'orange'
      }
    ]
  },
  forgot: {
    main: {
      src: '/images/community/forgot_main.jpg',
      alt: 'Warm supportive community interaction',
      title: 'Supportive Community'
    },
    items: [
      {
        id: 'top-left',
        src: '/images/community/forgot_support.jpg',
        alt: 'Caregiver supporting senior citizen',
        title: 'Compassionate Care',
        className: 'photo-node photo-node-top-left',
        shape: 'rounded'
      },
      {
        id: 'top-right',
        src: '/images/community/forgot_care.jpg',
        alt: 'Friendly counselor helping community member',
        title: 'Guidance & Help',
        className: 'photo-node photo-node-top-right',
        shape: 'circle',
        badge: 'orange'
      },
      {
        id: 'bottom-right',
        src: '/images/community/forgot_community.jpg',
        alt: 'Reassuring smile from community helper',
        title: 'Reliable Support',
        className: 'photo-node photo-node-bottom-right',
        shape: 'circle'
      }
    ]
  },
  signup: {
    main: {
      src: '/images/community/signup_main.jpg',
      alt: 'Diverse community group celebrating together',
      title: 'Join Our Community'
    },
    items: [
      {
        id: 'top-left',
        src: '/images/community/signup_family.jpg',
        alt: 'Happy family together',
        title: 'Family Wellbeing',
        className: 'photo-node photo-node-top-left',
        shape: 'circle',
        badge: 'orange'
      },
      {
        id: 'top-right',
        src: '/images/community/signup_volunteers.jpg',
        alt: 'Group of young volunteers',
        title: 'Youth Volunteers',
        className: 'photo-node photo-node-top-right',
        shape: 'rounded'
      },
      {
        id: 'bottom-left',
        src: '/images/community/signup_kids.jpg',
        alt: 'Smiling children in community school',
        title: 'Child Education',
        className: 'photo-node photo-node-bottom-left',
        shape: 'circle'
      },
      {
        id: 'bottom-right',
        src: '/images/community/signup_elderly.jpg',
        alt: 'Warm elderly caregiver',
        title: 'Senior Wellness',
        className: 'photo-node photo-node-bottom-right',
        shape: 'circle',
        badge: 'gold'
      }
    ]
  }
};

export default function HeroPhotoComposition({ variant = 'login' }) {
  const config = CONFIGS[variant] || CONFIGS.login;

  return (
    <div className={`hero-photo-composition hero-variant-${variant}`} aria-hidden="true">
      {/* Background Soft Warm Ambient Glow */}
      <div className="hero-glow hero-glow-1" />
      <div className="hero-glow hero-glow-2" />

      {/* Connection Lines Overlay */}
      <svg
        className="hero-connections-svg"
        viewBox="0 0 440 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {variant === 'forgot' ? (
          <>
            <path d="M 220 150 L 115 95" stroke="#FF7A1A" strokeWidth="1.5" strokeDasharray="3 5" strokeOpacity="0.35" />
            <path d="M 220 150 L 335 105" stroke="#FF7A1A" strokeWidth="1.5" strokeDasharray="3 5" strokeOpacity="0.35" />
            <path d="M 220 150 L 330 225" stroke="#FF7A1A" strokeWidth="1.5" strokeDasharray="3 5" strokeOpacity="0.35" />
          </>
        ) : (
          <>
            <path d="M 220 150 L 105 85" stroke="#FF7A1A" strokeWidth="1.5" strokeDasharray="3 5" strokeOpacity="0.35" />
            <path d="M 220 150 L 345 95" stroke="#FF7A1A" strokeWidth="1.5" strokeDasharray="3 5" strokeOpacity="0.35" />
            <path d="M 220 150 L 115 235" stroke="#FF7A1A" strokeWidth="1.5" strokeDasharray="3 5" strokeOpacity="0.3" />
            <path d="M 220 150 L 340 230" stroke="#FF7A1A" strokeWidth="1.5" strokeDasharray="3 5" strokeOpacity="0.3" />
          </>
        )}

        {/* Decorative soft dots */}
        <circle cx="220" cy="35" r="3" fill="#FF7A1A" opacity="0.4" />
        <circle cx="50" cy="170" r="2.5" fill="#F9B233" opacity="0.5" />
        <circle cx="390" cy="150" r="3.5" fill="#FF7A1A" opacity="0.35" />
      </svg>

      {/* Main Central Photograph */}
      <div className="photo-node photo-node-main" title={config.main.title}>
        <div className="photo-frame photo-frame-main">
          <img src={config.main.src} alt={config.main.alt} />
        </div>
        <div className="photo-badge photo-badge-main">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.684a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
      </div>

      {/* Surrounding Satellite Photographs */}
      {config.items.map((item) => (
        <div
          key={item.id}
          className={`${item.className} photo-shape-${item.shape}`}
          title={item.title}
        >
          <div className="photo-frame">
            <img src={item.src} alt={item.alt} />
          </div>
          {item.badge && (
            <div className={`photo-badge photo-badge-${item.badge}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                {item.badge === 'gold' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                )}
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
