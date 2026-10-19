import React from 'react';

interface FoodVisualProps {
  type: string;
  name: string;
  imageUrl?: string;
  className?: string;
}

export const FoodVisual: React.FC<FoodVisualProps> = ({ type, name, imageUrl, className = '' }) => {
  const [imgError, setImgError] = React.useState(false);

  if (imageUrl && !imgError) {
    return (
      <div className={`relative overflow-hidden bg-neutral-900 ${className}`}>
        <img
          src={imageUrl}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
    );
  }

  // Premium, artisanal stylized visual presentations
  const renderArtisanalIllustration = () => {
    switch (type) {
      case 'shake':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-[#1E1B18] via-[#2A2421] to-[#121110] flex items-center justify-center p-4">
            <svg viewBox="0 0 160 160" className="w-28 h-28 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Glass base & body */}
              <path d="M50 40 L60 135 C61 142 66 146 73 146 L87 146 C94 146 99 142 100 135 L110 40 Z" fill="rgba(255,255,255,0.12)" stroke="#FAF7F2" strokeWidth="2.5" />
              {/* Milkshake liquid gradient */}
              <path d="M53 55 L61 133 C61.8 139 65.5 142 71 142 L89 142 C94.5 142 98.2 139 99 133 L107 55 Z" fill="#2E231F" />
              {/* Cream & chocolate swirl layers */}
              <path d="M56 80 Q80 88 104 80 L105 92 Q80 100 55 92 Z" fill="#E8D8CB" opacity="0.85" />
              <path d="M58 105 Q80 112 102 105 L103 115 Q80 122 57 115 Z" fill="#1C1410" opacity="0.9" />
              {/* Whipped cream dome */}
              <path d="M50 40 C50 24 64 16 80 16 C96 16 110 24 110 40 Z" fill="#FAF7F2" />
              <circle cx="80" cy="18" r="6" fill="#FF6A00" />
              {/* Oreo cookie on top */}
              <circle cx="98" cy="28" r="14" fill="#1A1817" stroke="#3D3835" strokeWidth="2" />
              <circle cx="98" cy="28" r="10" stroke="#FAF7F2" strokeWidth="1" strokeDasharray="2 2" />
              {/* Straw */}
              <line x1="88" y1="6" x2="114" y2="48" stroke="#FF6A00" strokeWidth="4" strokeLinecap="round" />
              {/* Cookie crumbles */}
              <circle cx="68" cy="32" r="2.5" fill="#1A1817" />
              <circle cx="76" cy="26" r="2" fill="#1A1817" />
              <circle cx="86" cy="36" r="2" fill="#1A1817" />
            </svg>
          </div>
        );

      case 'coffee':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-[#1C1613] via-[#2D211A] to-[#120E0C] flex items-center justify-center p-4">
            <svg viewBox="0 0 160 160" className="w-28 h-28 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Ribbed tall iced glass */}
              <rect x="52" y="32" width="56" height="106" rx="8" fill="rgba(255,255,255,0.08)" stroke="#E5D9CC" strokeWidth="2" />
              {/* Dark mocha liquid */}
              <rect x="56" y="52" width="48" height="82" rx="4" fill="#3B261A" />
              {/* Swirling cream & cocoa */}
              <path d="M56 82 Q80 94 104 82 L104 98 Q80 110 56 98 Z" fill="#D6B89D" opacity="0.8" />
              {/* Foam layer on top */}
              <rect x="56" y="44" width="48" height="14" rx="4" fill="#FAF5ED" />
              {/* Ice cubes floating */}
              <rect x="62" y="62" width="16" height="16" rx="3" fill="rgba(255,255,255,0.4)" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />
              <rect x="80" y="74" width="16" height="16" rx="3" fill="rgba(255,255,255,0.35)" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />
              {/* Coffee beans */}
              <ellipse cx="120" cy="120" rx="9" ry="6" transform="rotate(-30 120 120)" fill="#271810" stroke="#FAF7F2" strokeWidth="1" />
              <line x1="117" y1="117" x2="123" y2="123" stroke="#FAF7F2" strokeWidth="1" />
              {/* Straw */}
              <line x1="72" y1="12" x2="72" y2="120" stroke="#FF6A00" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </div>
        );

      case 'pizza':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-[#241A14] via-[#332219] to-[#18110D] flex items-center justify-center p-4">
            <svg viewBox="0 0 160 160" className="w-32 h-32 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Pizza base / crust */}
              <circle cx="80" cy="80" r="62" fill="#D98A36" stroke="#9E591B" strokeWidth="5" />
              {/* Marinara sauce */}
              <circle cx="80" cy="80" r="53" fill="#B92D18" />
              {/* Bubbling Golden Mozzarella Cheese */}
              <circle cx="80" cy="80" r="48" fill="#F8C846" />
              {/* Cheese bubbles & bake spots */}
              <circle cx="68" cy="65" r="9" fill="#ECA92A" opacity="0.9" />
              <circle cx="95" cy="88" r="8" fill="#ECA92A" opacity="0.9" />
              <circle cx="82" cy="72" r="6" fill="#F4DC7D" />
              {/* Veggies: Green capsicum strips */}
              <path d="M58 84 Q66 74 74 88" stroke="#2E7D32" strokeWidth="4" strokeLinecap="round" />
              <path d="M88 56 Q98 62 92 74" stroke="#2E7D32" strokeWidth="4" strokeLinecap="round" />
              <path d="M66 100 Q78 98 84 108" stroke="#2E7D32" strokeWidth="4" strokeLinecap="round" />
              {/* Black Olives */}
              <circle cx="98" cy="62" r="5" fill="#1C1B1A" stroke="#474543" strokeWidth="2" />
              <circle cx="64" cy="74" r="5" fill="#1C1B1A" stroke="#474543" strokeWidth="2" />
              <circle cx="82" cy="94" r="5" fill="#1C1B1A" stroke="#474543" strokeWidth="2" />
              {/* Golden Sweetcorn */}
              <circle cx="60" cy="92" r="3" fill="#FFE169" />
              <circle cx="76" cy="60" r="3" fill="#FFE169" />
              <circle cx="90" cy="80" r="3" fill="#FFE169" />
              <circle cx="104" cy="94" r="3" fill="#FFE169" />
              {/* Fresh Basil leaf */}
              <path d="M72 76 Q84 66 84 76 Q84 86 72 76 Z" fill="#388E3C" />
            </svg>
          </div>
        );

      case 'nachos':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-[#261E14] via-[#332717] to-[#18120B] flex items-center justify-center p-4">
            <svg viewBox="0 0 160 160" className="w-28 h-28 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Bowl / Plate */}
              <ellipse cx="80" cy="115" rx="60" ry="22" fill="#1A1817" stroke="#443D37" strokeWidth="3" />
              {/* Tortilla Chips */}
              <polygon points="50,110 70,68 90,110" fill="#E8A638" stroke="#B87B1D" strokeWidth="2" />
              <polygon points="75,108 100,64 118,105" fill="#F2B74B" stroke="#B87B1D" strokeWidth="2" />
              <polygon points="36,105 52,62 76,98" fill="#E09F32" stroke="#B87B1D" strokeWidth="2" />
              <polygon points="85,115 110,75 130,115" fill="#E8A638" stroke="#B87B1D" strokeWidth="2" />
              {/* Molten Cheese Drizzle */}
              <path d="M54 90 Q72 82 86 96 T115 88" stroke="#FBBF24" strokeWidth="7" strokeLinecap="round" fill="none" />
              {/* Jalapeño Slices */}
              <circle cx="74" cy="86" r="6" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
              <circle cx="94" cy="92" r="6" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
              <circle cx="62" cy="100" r="5" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
              {/* Fresh Salsa Drops */}
              <circle cx="84" cy="98" r="4" fill="#DC2626" />
              <circle cx="106" cy="98" r="3.5" fill="#DC2626" />
            </svg>
          </div>
        );

      case 'puff':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-[#241C12] via-[#352516] to-[#17120A] flex items-center justify-center p-4">
            <svg viewBox="0 0 160 160" className="w-28 h-28 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Triangular golden flaky puff */}
              <path d="M35 115 L80 42 L125 115 Q80 128 35 115 Z" fill="#D98A28" stroke="#9E5D12" strokeWidth="3.5" />
              {/* Flaky layers & scored lines */}
              <path d="M48 105 L80 54 L112 105" stroke="#F5BB54" strokeWidth="3" fill="none" />
              <path d="M60 100 L80 66 L100 100" stroke="#FCE088" strokeWidth="2" fill="none" />
              {/* Sesame / Herb specks */}
              <ellipse cx="78" cy="85" rx="2" ry="1.2" fill="#1C1814" />
              <ellipse cx="88" cy="75" rx="2" ry="1.2" fill="#1C1814" />
              <ellipse cx="68" cy="92" rx="2" ry="1.2" fill="#1C1814" />
              {/* Steam waves */}
              <path d="M72 32 Q76 22 72 16" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
              <path d="M84 34 Q88 24 84 18" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        );

      case 'bhel':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-[#221A16] via-[#2F211A] to-[#14100D] flex items-center justify-center p-4">
            <svg viewBox="0 0 160 160" className="w-28 h-28 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Street style paper bowl */}
              <ellipse cx="80" cy="115" rx="55" ry="24" fill="#C99863" stroke="#8A5A2B" strokeWidth="2.5" />
              {/* Puffed rice mound */}
              <ellipse cx="80" cy="100" rx="46" ry="22" fill="#F5E4B7" />
              {/* Red spicy garlic & sweet date chutney swirls */}
              <path d="M48 95 Q68 84 88 98 T118 92" stroke="#B91C1C" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M55 104 Q75 114 96 102 T112 108" stroke="#15803D" strokeWidth="3" strokeLinecap="round" fill="none" />
              {/* Yellow nylon sev sprinkling */}
              <line x1="58" y1="88" x2="68" y2="92" stroke="#FACC15" strokeWidth="2" />
              <line x1="72" y1="82" x2="82" y2="86" stroke="#FACC15" strokeWidth="2" />
              <line x1="88" y1="88" x2="100" y2="92" stroke="#FACC15" strokeWidth="2" />
              <line x1="64" y1="98" x2="74" y2="102" stroke="#FACC15" strokeWidth="2" />
              <line x1="94" y1="102" x2="106" y2="98" stroke="#FACC15" strokeWidth="2" />
              {/* Crispy Papdi Puri */}
              <ellipse cx="106" cy="80" rx="14" ry="9" fill="#E8A638" stroke="#B87B1D" strokeWidth="1.5" transform="rotate(-20 106 80)" />
              {/* Fresh Coriander */}
              <circle cx="78" cy="92" r="3" fill="#22C55E" />
              <circle cx="86" cy="90" r="2.5" fill="#22C55E" />
            </svg>
          </div>
        );

      case 'coco':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-[#1C120C] via-[#2A180F] to-[#120B07] flex items-center justify-center p-4">
            <svg viewBox="0 0 160 160" className="w-28 h-28 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Chilled Glass Silhouette */}
              <path d="M52 42 L62 136 C62.8 142 67.5 146 73.5 146 L86.5 146 C92.5 146 97.2 142 98 136 L108 42 Z" fill="rgba(255,255,255,0.1)" stroke="#EDE2D8" strokeWidth="2.5" />
              {/* Velvety Thick Dark Coco Liquid */}
              <path d="M54 50 L63 134 C63.5 139 67 142 72 142 L88 142 C93 142 96.5 139 97 134 L106 50 Z" fill="#2E170C" />
              {/* Chocolate Ganache Swirl */}
              <path d="M56 75 Q80 88 104 75 L104 90 Q80 102 56 90 Z" fill="#4A2615" />
              <path d="M58 105 Q80 115 102 105 L102 118 Q80 128 58 118 Z" fill="#241107" />
              {/* Molten Chocolate Drip over rim */}
              <path d="M50 42 C50 36 60 36 66 40 C72 44 78 36 86 40 C94 44 100 36 110 42" fill="#3D1D0F" stroke="#261007" strokeWidth="3" />
              {/* Crunchy Chocolate Chips / Shavings on top */}
              <rect x="66" y="38" width="6" height="6" rx="1.5" transform="rotate(15 66 38)" fill="#180A04" stroke="#5C2D16" strokeWidth="1" />
              <rect x="80" y="36" width="7" height="7" rx="1.5" transform="rotate(-20 80 36)" fill="#180A04" stroke="#5C2D16" strokeWidth="1" />
              <rect x="92" y="40" width="5" height="5" rx="1.5" transform="rotate(10 92 40)" fill="#180A04" stroke="#5C2D16" strokeWidth="1" />
              <circle cx="74" cy="48" r="2.5" fill="#180A04" />
              <circle cx="88" cy="46" r="2" fill="#180A04" />
              {/* Straw */}
              <line x1="88" y1="12" x2="104" y2="60" stroke="#FF6A00" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
        );

      case 'chaas':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-[#1A201B] via-[#242E25] to-[#101511] flex items-center justify-center p-4">
            <svg viewBox="0 0 160 160" className="w-28 h-28 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Traditional Earthen Matka / Clay Glass */}
              <path d="M52 36 L62 135 C63 141 68 145 74 145 L86 145 C92 145 97 141 98 135 L108 36 Z" fill="#99583D" stroke="#713B25" strokeWidth="3" />
              {/* Chilled Chaas Liquid */}
              <path d="M55 48 L63 133 C63.5 138 67 141 72 141 L88 141 C93 141 96.5 138 97 133 L105 48 Z" fill="#FAFBF7" />
              {/* Roasted Cumin and Rock Salt specks */}
              <circle cx="72" cy="65" r="1.5" fill="#4B3621" />
              <circle cx="88" cy="72" r="1.5" fill="#4B3621" />
              <circle cx="76" cy="84" r="1.5" fill="#4B3621" />
              <circle cx="84" cy="98" r="1.5" fill="#4B3621" />
              <circle cx="70" cy="110" r="1.5" fill="#4B3621" />
              {/* Fresh mint sprig on rim */}
              <path d="M78 34 Q88 20 98 28 Q88 36 78 34 Z" fill="#15803D" stroke="#166534" strokeWidth="1" />
              <path d="M78 34 Q70 24 64 30 Q70 38 78 34 Z" fill="#22C55E" />
            </svg>
          </div>
        );

      default:
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-[#261E1A] to-[#14110F] flex items-center justify-center p-4">
            <svg viewBox="0 0 160 160" className="w-24 h-24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="80" cy="80" r="50" fill="#FF6A00" opacity="0.2" />
              <circle cx="80" cy="80" r="40" stroke="#FF6A00" strokeWidth="3" strokeDasharray="6 4" />
              <path d="M68 66 L92 94 M92 66 L68 94" stroke="#FAF7F2" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {renderArtisanalIllustration()}
    </div>
  );
};
