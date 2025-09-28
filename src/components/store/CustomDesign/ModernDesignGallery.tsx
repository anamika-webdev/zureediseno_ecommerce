import React, { useState } from 'react';
import { Palette } from 'lucide-react';

const DesignGallery = () => {
  const [activeCategory, setActiveCategory] = useState('All Designs');
  const [selectedGarment, setSelectedGarment] = useState(null);

  const categories = [
    'All Designs', 'Shirts', 'Casual Wear', 'Traditional', 'Formal Wear', "Women's Wear"
  ];

  const garmentTypes = [
    {
      name: 'Full Shirts',
      description: 'Formal long-sleeve shirts',
      icon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 text-gray-700">
          <path d="M25 35 Q25 20 30 20 L42 20 L42 25 L58 25 L58 20 L70 20 Q75 20 75 35 L70 40 L70 85 L30 85 L30 40 L25 35 Z" 
                fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M42 25 L58 25" stroke="currentColor" strokeWidth="2"/>
          <rect x="20" y="35" width="10" height="15" fill="none" stroke="currentColor" strokeWidth="2"/>
          <rect x="70" y="35" width="10" height="15" fill="none" stroke="currentColor" strokeWidth="2"/>
          <line x1="35" y1="45" x2="65" y2="45" stroke="currentColor" strokeWidth="1"/>
          <circle cx="38" cy="45" r="1" fill="currentColor"/>
          <circle cx="42" cy="45" r="1" fill="currentColor"/>
          <circle cx="46" cy="45" r="1" fill="currentColor"/>
          <circle cx="50" cy="45" r="1" fill="currentColor"/>
          <circle cx="54" cy="45" r="1" fill="currentColor"/>
          <circle cx="58" cy="45" r="1" fill="currentColor"/>
          <circle cx="62" cy="45" r="1" fill="currentColor"/>
        </svg>
      ),
      template: (
        <svg viewBox="0 0 300 400" className="w-full h-full">
          <path d="M75 105 Q75 60 90 60 L126 60 L126 75 L174 75 L174 60 L210 60 Q225 60 225 105 L210 120 L210 285 L90 285 L90 120 L75 105 Z" 
                fill="none" stroke="black" strokeWidth="4"/>
          <path d="M126 75 L174 75" stroke="black" strokeWidth="4"/>
          <rect x="60" y="105" width="30" height="45" fill="none" stroke="black" strokeWidth="4"/>
          <rect x="210" y="105" width="30" height="45" fill="none" stroke="black" strokeWidth="4"/>
          <line x1="105" y1="135" x2="195" y2="135" stroke="black" strokeWidth="3"/>
          <circle cx="114" cy="135" r="3" fill="black"/>
          <circle cx="126" cy="135" r="3" fill="black"/>
          <circle cx="138" cy="135" r="3" fill="black"/>
          <circle cx="150" cy="135" r="3" fill="black"/>
          <circle cx="162" cy="135" r="3" fill="black"/>
          <circle cx="174" cy="135" r="3" fill="black"/>
          <circle cx="186" cy="135" r="3" fill="black"/>
        </svg>
      )
    },
    {
      name: 'Half Shirts', 
      description: 'Short-sleeve casual shirts',
      icon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 text-gray-700">
          <path d="M25 35 Q25 20 30 20 L42 20 L42 25 L58 25 L58 20 L70 20 Q75 20 75 35 L70 40 L70 75 L30 75 L30 40 L25 35 Z" 
                fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M42 25 L58 25" stroke="currentColor" strokeWidth="2"/>
          <rect x="20" y="35" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2"/>
          <rect x="70" y="35" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2"/>
          <rect x="45" y="30" width="10" height="6" fill="none" stroke="currentColor" strokeWidth="1"/>
          <line x1="35" y1="50" x2="65" y2="50" stroke="currentColor" strokeWidth="1"/>
          <circle cx="38" cy="50" r="1" fill="currentColor"/>
          <circle cx="42" cy="50" r="1" fill="currentColor"/>
          <circle cx="46" cy="50" r="1" fill="currentColor"/>
          <circle cx="50" cy="50" r="1" fill="currentColor"/>
          <circle cx="54" cy="50" r="1" fill="currentColor"/>
          <circle cx="58" cy="50" r="1" fill="currentColor"/>
          <circle cx="62" cy="50" r="1" fill="currentColor"/>
        </svg>
      ),
      template: (
        <svg viewBox="0 0 300 400" className="w-full h-full">
          <path d="M75 105 Q75 60 90 60 L126 60 L126 75 L174 75 L174 60 L210 60 Q225 60 225 105 L210 120 L210 225 L90 225 L90 120 L75 105 Z" 
                fill="none" stroke="black" strokeWidth="4"/>
          <path d="M126 75 L174 75" stroke="black" strokeWidth="4"/>
          <rect x="60" y="105" width="30" height="30" fill="none" stroke="black" strokeWidth="4"/>
          <rect x="210" y="105" width="30" height="30" fill="none" stroke="black" strokeWidth="4"/>
          <rect x="135" y="90" width="30" height="18" fill="none" stroke="black" strokeWidth="3"/>
          <line x1="105" y1="150" x2="195" y2="150" stroke="black" strokeWidth="3"/>
          <circle cx="114" cy="150" r="3" fill="black"/>
          <circle cx="126" cy="150" r="3" fill="black"/>
          <circle cx="138" cy="150" r="3" fill="black"/>
          <circle cx="150" cy="150" r="3" fill="black"/>
          <circle cx="162" cy="150" r="3" fill="black"/>
          <circle cx="174" cy="150" r="3" fill="black"/>
          <circle cx="186" cy="150" r="3" fill="black"/>
        </svg>
      )
    },
    {
      name: 'T-Shirts',
      description: 'Comfortable cotton t-shirts',
      icon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 text-gray-700">
          <path d="M25 40 L25 30 L35 25 L40 30 L40 35 L60 35 L60 30 L65 25 L75 30 L75 40 L65 45 L65 80 L35 80 L35 45 L25 40 Z" 
                fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M40 35 Q50 30 60 35" stroke="currentColor" strokeWidth="2"/>
          <line x1="40" y1="45" x2="60" y2="45" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2"/>
          <line x1="40" y1="75" x2="60" y2="75" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2"/>
          <line x1="25" y1="42" x2="35" y2="42" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2"/>
          <line x1="65" y1="42" x2="75" y2="42" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2"/>
        </svg>
      ),
      template: (
        <svg viewBox="0 0 300 400" className="w-full h-full">
          <path d="M75 120 L75 90 L105 75 L120 90 L120 105 L180 105 L180 90 L195 75 L225 90 L225 120 L195 135 L195 240 L105 240 L105 135 L75 120 Z" 
                fill="none" stroke="black" strokeWidth="4"/>
          <path d="M120 105 Q150 90 180 105" stroke="black" strokeWidth="4"/>
          <line x1="120" y1="135" x2="180" y2="135" stroke="black" strokeWidth="3" strokeDasharray="8,8"/>
          <line x1="120" y1="225" x2="180" y2="225" stroke="black" strokeWidth="3" strokeDasharray="8,8"/>
          <line x1="75" y1="126" x2="105" y2="126" stroke="black" strokeWidth="3" strokeDasharray="8,8"/>
          <line x1="195" y1="126" x2="225" y2="126" stroke="black" strokeWidth="3" strokeDasharray="8,8"/>
        </svg>
      )
    },
    {
      name: 'Pajamas',
      description: 'Comfortable sleepwear',
      icon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 text-gray-700">
          <path d="M32 20 L32 40 L28 40 L28 75 L38 75 L38 40 L62 40 L62 75 L72 75 L72 40 L68 40 L68 20 L32 20 Z" 
                fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M32 25 Q50 20 68 25" stroke="currentColor" strokeWidth="2"/>
          <path d="M38 30 Q50 25 62 30" stroke="currentColor" strokeWidth="1"/>
          <line x1="28" y1="50" x2="38" y2="50" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2"/>
          <line x1="62" y1="50" x2="72" y2="50" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2"/>
          <line x1="38" y1="70" x2="62" y2="70" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2"/>
        </svg>
      ),
      template: (
        <svg viewBox="0 0 300 400" className="w-full h-full">
          <path d="M96 60 L96 120 L84 120 L84 225 L114 225 L114 120 L186 120 L186 225 L216 225 L216 120 L204 120 L204 60 L96 60 Z" 
                fill="none" stroke="black" strokeWidth="4"/>
          <path d="M96 75 Q150 60 204 75" stroke="black" strokeWidth="4"/>
          <path d="M114 90 Q150 75 186 90" stroke="black" strokeWidth="3"/>
          <line x1="84" y1="150" x2="114" y2="150" stroke="black" strokeWidth="3" strokeDasharray="6,6"/>
          <line x1="186" y1="150" x2="216" y2="150" stroke="black" strokeWidth="3" strokeDasharray="6,6"/>
          <line x1="114" y1="210" x2="186" y2="210" stroke="black" strokeWidth="3" strokeDasharray="6,6"/>
        </svg>
      )
    },
    {
      name: 'Shorts',
      description: 'Casual summer shorts',
      icon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 text-gray-700">
          <path d="M30 25 L30 45 L25 45 L25 65 L40 65 L40 45 L60 45 L60 65 L75 65 L75 45 L70 45 L70 25 L30 25 Z" 
                fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M30 30 Q50 25 70 30" stroke="currentColor" strokeWidth="2"/>
          <line x1="25" y1="50" x2="40" y2="50" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2"/>
          <line x1="60" y1="50" x2="75" y2="50" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2"/>
          <rect x="28" y="35" width="4" height="4" fill="black"/>
        </svg>
      ),
      template: (
        <svg viewBox="0 0 300 400" className="w-full h-full">
          <path d="M90 75 L90 135 L75 135 L75 195 L120 195 L120 135 L180 135 L180 195 L225 195 L225 135 L210 135 L210 75 L90 75 Z" 
                fill="none" stroke="black" strokeWidth="4"/>
          <path d="M90 90 Q150 75 210 90" stroke="black" strokeWidth="4"/>
          <line x1="75" y1="150" x2="120" y2="150" stroke="black" strokeWidth="3" strokeDasharray="8,8"/>
          <line x1="180" y1="150" x2="225" y2="150" stroke="black" strokeWidth="3" strokeDasharray="8,8"/>
          <rect x="84" y="105" width="12" height="12" fill="black"/>
        </svg>
      )
    },
    {
      name: 'Kurtas',
      description: 'Traditional Indian wear',
      icon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 text-gray-700">
          <path d="M25 35 Q25 20 30 20 L42 20 L42 25 L58 25 L58 20 L70 20 Q75 20 75 35 L70 40 L70 85 L30 85 L30 40 L25 35 Z" 
                fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M42 25 Q50 20 58 25" stroke="currentColor" strokeWidth="2"/>
          <line x1="42" y1="30" x2="50" y2="25" stroke="currentColor" strokeWidth="1"/>
          <line x1="50" y1="25" x2="58" y2="30" stroke="currentColor" strokeWidth="1"/>
          <line x1="42" y1="35" x2="58" y2="35" stroke="currentColor" strokeWidth="1"/>
          <circle cx="46" cy="40" r="1" fill="currentColor"/>
          <circle cx="50" cy="40" r="1" fill="currentColor"/>
          <circle cx="54" cy="40" r="1" fill="currentColor"/>
          <line x1="42" y1="45" x2="58" y2="45" stroke="currentColor" strokeWidth="1"/>
        </svg>
      ),
      template: (
        <svg viewBox="0 0 300 400" className="w-full h-full">
          <path d="M75 105 Q75 60 90 60 L126 60 L126 75 L174 75 L174 60 L210 60 Q225 60 225 105 L210 120 L210 285 L90 285 L90 120 L75 105 Z" 
                fill="none" stroke="black" strokeWidth="4"/>
          <path d="M126 75 Q150 60 174 75" stroke="black" strokeWidth="4"/>
          <line x1="126" y1="90" x2="150" y2="75" stroke="black" strokeWidth="3"/>
          <line x1="150" y1="75" x2="174" y2="90" stroke="black" strokeWidth="3"/>
          <line x1="126" y1="105" x2="174" y2="105" stroke="black" strokeWidth="3"/>
          <circle cx="138" cy="120" r="3" fill="black"/>
          <circle cx="150" cy="120" r="3" fill="black"/>
          <circle cx="162" cy="120" r="3" fill="black"/>
          <line x1="126" y1="135" x2="174" y2="135" stroke="black" strokeWidth="3"/>
        </svg>
      )
    },
    {
      name: 'Blazers',
      description: 'Professional blazers',
      icon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 text-gray-700">
          <path d="M25 35 Q25 20 30 20 L42 20 L42 25 L58 25 L58 20 L70 20 Q75 20 75 35 L70 40 L70 85 L30 85 L30 40 L25 35 Z" 
                fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M42 25 L58 25" stroke="currentColor" strokeWidth="2"/>
          <rect x="20" y="35" width="10" height="15" fill="none" stroke="currentColor" strokeWidth="2"/>
          <rect x="70" y="35" width="10" height="15" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M30 40 L42 52 L42 80" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M70 40 L58 52 L58 80" fill="none" stroke="currentColor" strokeWidth="2"/>
          <rect x="35" y="55" width="12" height="8" fill="none" stroke="currentColor" strokeWidth="1"/>
          <rect x="53" y="55" width="12" height="8" fill="none" stroke="currentColor" strokeWidth="1"/>
          <circle cx="41" cy="50" r="1.5" fill="currentColor"/>
          <circle cx="59" cy="50" r="1.5" fill="currentColor"/>
          <line x1="20" y1="40" x2="25" y2="40" stroke="currentColor" strokeWidth="1"/>
          <line x1="75" y1="40" x2="80" y2="40" stroke="currentColor" strokeWidth="1"/>
        </svg>
      ),
      template: (
        <svg viewBox="0 0 300 400" className="w-full h-full">
          <path d="M75 105 Q75 60 90 60 L126 60 L126 75 L174 75 L174 60 L210 60 Q225 60 225 105 L210 120 L210 255 L90 255 L90 120 L75 105 Z" 
                fill="none" stroke="black" strokeWidth="4"/>
          <path d="M126 75 L174 75" stroke="black" strokeWidth="4"/>
          <rect x="60" y="105" width="30" height="45" fill="none" stroke="black" strokeWidth="4"/>
          <rect x="210" y="105" width="30" height="45" fill="none" stroke="black" strokeWidth="4"/>
          <path d="M90 120 L126 156 L126 240" fill="none" stroke="black" strokeWidth="4"/>
          <path d="M210 120 L174 156 L174 240" fill="none" stroke="black" strokeWidth="4"/>
          <rect x="105" y="165" width="36" height="24" fill="none" stroke="black" strokeWidth="3"/>
          <rect x="159" y="165" width="36" height="24" fill="none" stroke="black" strokeWidth="3"/>
          <circle cx="123" cy="150" r="4" fill="black"/>
          <circle cx="177" cy="150" r="4" fill="black"/>
          <line x1="60" y1="120" x2="75" y2="120" stroke="black" strokeWidth="3"/>
          <line x1="225" y1="120" x2="240" y2="120" stroke="black" strokeWidth="3"/>
        </svg>
      )
    },
    {
      name: 'Pants',
      description: 'Formal trousers',
      icon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 text-gray-700">
          <path d="M32 25 L32 50 L27 50 L27 85 L42 85 L42 50 L58 50 L58 85 L73 85 L73 50 L68 50 L68 25 L32 25 Z" 
                fill="none" stroke="currentColor" strokeWidth="2"/>
          <rect x="35" y="30" width="30" height="8" fill="none" stroke="currentColor" strokeWidth="2"/>
          <circle cx="40" cy="34" r="1.5" fill="currentColor"/>
          <line x1="27" y1="60" x2="42" y2="60" stroke="currentColor" strokeWidth="1"/>
          <line x1="58" y1="60" x2="73" y2="60" stroke="currentColor" strokeWidth="1"/>
        </svg>
      ),
      template: (
        <svg viewBox="0 0 300 400" className="w-full h-full">
          <path d="M96 75 L96 150 L81 150 L81 285 L126 285 L126 150 L174 150 L174 285 L219 285 L219 150 L204 150 L204 75 L96 75 Z" 
                fill="none" stroke="black" strokeWidth="4"/>
          <rect x="105" y="90" width="90" height="24" fill="none" stroke="black" strokeWidth="4"/>
          <circle cx="120" cy="102" r="4" fill="black"/>
          <line x1="81" y1="180" x2="126" y2="180" stroke="black" strokeWidth="3"/>
          <line x1="174" y1="180" x2="219" y2="180" stroke="black" strokeWidth="3"/>
        </svg>
      )
    },
    {
      name: 'Dresses',
      description: 'Elegant dresses',
      icon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 text-gray-700">
          <path d="M35 30 L35 40 L25 70 L75 70 L65 40 L65 30 L35 30 Z" 
                fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M35 25 L37 20 L37 27 L35 30" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M65 25 L63 20 L63 27 L65 30" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M35 35 Q50 30 65 35" stroke="currentColor" strokeWidth="2"/>
          <line x1="40" y1="50" x2="45" y2="50" stroke="currentColor" strokeWidth="1"/>
          <line x1="55" y1="50" x2="60" y2="50" stroke="currentColor" strokeWidth="1"/>
          <rect x="47" y="45" width="6" height="4" fill="none" stroke="currentColor" strokeWidth="1"/>
        </svg>
      ),
      template: (
        <svg viewBox="0 0 300 400" className="w-full h-full">
          <path d="M105 90 L105 120 L75 210 L225 210 L195 120 L195 90 L105 90 Z" 
                fill="none" stroke="black" strokeWidth="4"/>
          <path d="M105 75 L111 60 L111 81 L105 90" fill="none" stroke="black" strokeWidth="4"/>
          <path d="M195 75 L189 60 L189 81 L195 90" fill="none" stroke="black" strokeWidth="4"/>
          <path d="M105 105 Q150 90 195 105" stroke="black" strokeWidth="4"/>
          <line x1="120" y1="150" x2="135" y2="150" stroke="black" strokeWidth="3"/>
          <line x1="165" y1="150" x2="180" y2="150" stroke="black" strokeWidth="3"/>
          <rect x="141" y="135" width="18" height="12" fill="none" stroke="black" strokeWidth="3"/>
        </svg>
      )
    }
  ];

  const handleGarmentClick = (garment) => {
    setSelectedGarment(garment);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Design Gallery Section */}
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-5 h-5 text-orange-500" />
              <h1 className="text-lg font-semibold text-gray-800">Design Gallery</h1>
            </div>
            <p className="text-gray-600 text-sm">Choose your garment type to start designing</p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Garment Grid */}
          <div className="grid grid-cols-3 gap-4">
            {garmentTypes.map((item, index) => (
              <div
                key={index}
                onClick={() => handleGarmentClick(item)}
                className={`bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 cursor-pointer transition-all group border-2 ${
                  selectedGarment?.name === item.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-center mb-3">
                  {item.icon}
                </div>
                <h3 className="font-medium text-gray-800 mb-1 text-sm">{item.name}</h3>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Runway Preview Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Runway Preview</h2>
          
          {selectedGarment ? (
            <div className="text-center">
              <div className="bg-white rounded-lg p-8 mb-4 shadow-sm border">
                <div className="flex justify-center items-center h-80">
                  {selectedGarment.template}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{selectedGarment.name.toUpperCase()}</h3>
              <p className="text-gray-600 mb-4">{selectedGarment.description}</p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Start Designing
              </button>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-4">
                <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
                </svg>
              </div>
              <p className="text-gray-500 text-lg">Select a garment to preview</p>
              <p className="text-gray-400 text-sm mt-2">Click on any garment type to see it in the runway preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignGallery;