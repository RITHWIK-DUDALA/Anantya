import React from 'react';
import { useTranslation } from 'react-i18next';

// Avatar colours (same as Committee)
const PALETTE = [
  '#6B9BD2','#F4A261','#8B5CF6','#10B981',
  '#FB7185','#60A5FA','#FBBF24','#34D399',
  '#F472B6','#38BDF8',
];
const avatarColor = (name) => {
  let h = 0;
  const str = name || "A";
  for (let i = 0; i < str.length; i++) h = (h + str.charCodeAt(i)) % PALETTE.length;
  return PALETTE[h];
};

const AvatarStack = ({ items, onItemClick }) => {
  const { t } = useTranslation();
  // Sort items to create a visual hierarchy (Head in center, others alternating outwards)
  const n = items.length;
  const mappedItems = new Array(n);
  const centerIndex = Math.floor((n - 1) / 2);

  items.forEach((item, i) => {
    if (i === 0) mappedItems[centerIndex] = item;
    else if (i % 2 === 1) {
      const offset = Math.floor((i + 1) / 2);
      mappedItems[centerIndex - offset] = item;
    } else {
      const offset = Math.floor(i / 2);
      mappedItems[centerIndex + offset] = item;
    }
  });

  return (
    <div className="trusted-section">
      <div className="avatar-stack" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
        {mappedItems.map((item, index) => {
          if (!item) return null; // Safety check
          const initials = (item.name || "").split(' ').map(n => n[0] || '').join('').toUpperCase().slice(0, 2);
          
          // Hierarchical Arch Logic
          const dist = Math.abs(index - centerIndex);
          
          let scale = 1;
          let translateY = 0;
          let margin = '0 -12px';

          if (dist === 0) { scale = 1.6; translateY = -25; margin = '0 5px'; }
          else if (dist === 1) { scale = 1.25; translateY = -5; margin = '0 -8px'; }
          else if (dist === 2) { scale = 1.0; translateY = 10; margin = '0 -15px'; }
          else { scale = 0.85; translateY = 20; margin = '0 -20px'; }
          
          // Center element gets highest z-index
          const zIndex = 100 - dist;

          return (
            <div 
              key={item.id || item.name || index}
              style={{ 
                zIndex,
                transform: `translateY(${translateY}px) scale(${scale})`,
                margin,
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              <div 
                className="avatar-wrapper"
                style={{ margin: 0 }} // Reset default margin since we handle it in the wrapper
                onClick={() => onItemClick && onItemClick(item)}
              >
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="avatar-stack-img" 
                    style={{ objectPosition: item.originalData?.objectPosition || 'center' }}
                  />
                ) : (
                  <div className="avatar-stack-initials" style={{ background: avatarColor(item.name) }}>
                    {initials || (index + 1)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <h2 className="trusted-heading">{t('committee.directory', 'CORE TEAM DIRECTORY (CLICK TO VIEW)')}</h2>
    </div>
  );
};

export default AvatarStack;
