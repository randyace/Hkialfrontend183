import React, { useState } from 'react';
import {
  Sparkles,
  Coffee,
  Wifi,
  Utensils,
  Wine,
  Shirt,
  Briefcase,
  Users,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  ChevronRight,
  Building,
  Car,
  ShoppingBag
} from 'lucide-react';
import { useTheme } from './ThemeContext';

export function Services() {
  const { colors, glassStyle, mode } = useTheme();
  const isDark = mode === 'dark';
  const [selectedCategory, setSelectedCategory] = useState('all');

  const lounges = [
    {
      id: 1,
      name: 'The Wing First Class Suite',
      terminal: 'Terminal 1',
      image: 'https://images.unsplash.com/photo-1560624052-449f5ddf0c31?w=800&q=80',
      rating: 4.9,
      reviews: 2847,
      description: 'Exclusive first-class experience with private cabanas and fine dining.',
      features: ['Private Cabanas', 'Fine Dining', 'Spa Services', 'Shower Suites', 'Business Center', 'Meeting Rooms'],
      hours: '24/7',
      capacity: '150 guests',
      amenities: ['WiFi', 'Dining', 'Bar', 'Spa', 'Shower', 'Work']
    },
    {
      id: 2,
      name: 'The Pier Business Suite',
      terminal: 'Terminal 1',
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
      rating: 4.8,
      reviews: 3215,
      description: 'Spacious suite with extensive buffet and premium beverages.',
      features: ['International Buffet', 'Premium Bar', 'Noodle Bar', 'Shower Facilities', 'Quiet Zones', 'Kids Play Area'],
      hours: '5:30 AM - 12:30 AM',
      capacity: '300 guests',
      amenities: ['WiFi', 'Dining', 'Bar', 'Shower', 'Work', 'Family']
    },
    {
      id: 3,
      name: 'The Cabin Suite',
      terminal: 'Terminal 1',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      rating: 4.7,
      reviews: 1893,
      description: 'Contemporary design with comfort-focused seating and dining.',
      features: ['Buffet Selection', 'Noodle Bar', 'Coffee Bar', 'Shower Rooms', 'Reading Area', 'TV Lounge'],
      hours: '6:00 AM - 11:00 PM',
      capacity: '200 guests',
      amenities: ['WiFi', 'Dining', 'Coffee', 'Shower', 'Relax']
    },
    {
      id: 4,
      name: 'The Arrival Suite',
      terminal: 'Terminal 1',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
      rating: 4.6,
      reviews: 1456,
      description: 'Perfect for arriving passengers with breakfast and shower facilities.',
      features: ['Breakfast Buffet', 'Barista Coffee', 'Fresh Juices', 'Shower Facilities', 'Luggage Storage', 'Newspaper'],
      hours: '5:00 AM - 1:00 PM',
      capacity: '80 guests',
      amenities: ['WiFi', 'Dining', 'Coffee', 'Shower', 'Storage']
    },
    {
      id: 5,
      name: 'The Pier First Class Suite',
      terminal: 'Terminal 1',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      rating: 5.0,
      reviews: 1876,
      description: 'Ultra-premium suite with personalized service and exclusive amenities.',
      features: ['À la carte Dining', 'Wine Cellar', 'Private Spa', 'Day Beds', 'Concierge Service', 'Private Showers'],
      hours: '24/7',
      capacity: '100 guests',
      amenities: ['WiFi', 'Dining', 'Bar', 'Spa', 'Shower', 'Concierge']
    }
  ];

  const services = [
    {
      category: 'Food & Beverage',
      icon: Utensils,
      items: [
        { name: 'International Buffet', description: 'All-day dining with rotating menu', price: 'Included' },
        { name: 'À la carte Menu', description: 'Chef-prepared signature dishes', price: 'Included' },
        { name: 'Noodle Bar', description: 'Fresh hand-pulled noodles made to order', price: 'Included' },
        { name: 'Private Dining', description: 'Reserved dining area for up to 6 guests', price: 'HKD 1,000' },
        { name: 'Premium Bar', description: 'Spirits, wines, and cocktails', price: 'Included' },
        { name: 'Champagne Service', description: 'Selection of vintage champagnes', price: 'Included' },
        { name: 'Barista Coffee', description: 'Specialty coffee drinks', price: 'Included' },
        { name: 'Fresh Juices', description: 'Cold-pressed and smoothies', price: 'Included' }
      ]
    },
    {
      category: 'Transfer Services',
      icon: Car,
      items: [
        { name: 'Airport Transfers', description: 'Luxury car service to/from airport', price: 'HKD 800' },
        { name: 'City Transfers', description: 'Private chauffeur within Hong Kong', price: 'HKD 1,200' },
        { name: 'Meet & Greet', description: 'Personal assistance at arrival gate', price: 'HKD 500' },
        { name: 'Fast Track Service', description: 'Priority immigration and security', price: 'HKD 600' }
      ]
    },
    {
      category: 'Shopping',
      icon: ShoppingBag,
      items: [
        { name: 'Personal Shopper Service', description: 'Dedicated shopping assistant', price: 'HKD 1,500' },
        { name: 'Private Sales Consultation', description: 'Exclusive access to luxury boutiques', price: 'HKD 2,000' },
        { name: 'Duty-Free Assistance', description: 'Help with duty-free shopping', price: 'Included' },
        { name: 'Gift Wrapping', description: 'Complimentary gift wrapping service', price: 'Included' }
      ]
    },
    {
      category: 'Additional',
      icon: Star,
      items: [
        { name: 'Shower Suites', description: 'Private shower with premium amenities', price: 'Included' },
        { name: 'Spa Treatment', description: '30-minute massage or facial', price: 'HKD 800' },
        { name: 'Day Beds', description: 'Private rest area with bedding', price: 'HKD 500' },
        { name: 'Business Center', description: 'Computers, printers, and office supplies', price: 'Included' },
        { name: 'Meeting Rooms', description: 'Private rooms for 2-8 people', price: 'HKD 1,500' },
        { name: 'Concierge Service', description: 'Personal assistance and reservations', price: 'Included' },
        { name: 'Luggage Storage', description: 'Secure storage for your belongings', price: 'Included' },
        { name: 'Shoe Shine', description: 'Professional shoe care service', price: 'Included' },
        { name: 'Clothing Press', description: 'Quick garment pressing', price: 'Included' }
      ]
    }
  ];

  const categories = ['all', 'Suite', 'Food & Beverage', 'Transfer Services', 'Shopping', 'Additional'];

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category === selectedCategory);

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'WiFi': return <Wifi className="w-4 h-4" />;
      case 'Dining': return <Utensils className="w-4 h-4" />;
      case 'Bar': return <Wine className="w-4 h-4" />;
      case 'Spa': return <Sparkles className="w-4 h-4" />;
      case 'Shower': return <Shirt className="w-4 h-4" />;
      case 'Work': return <Briefcase className="w-4 h-4" />;
      case 'Coffee': return <Coffee className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const tagStyle: React.CSSProperties = {
    background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(231,230,221,0.7)',
    border: `1px solid ${colors.cardItemBorder}`,
    color: colors.textSecondary,
  };

  const serviceItemStyle: React.CSSProperties = {
    background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(231,230,221,0.5)',
    border: `1px solid ${colors.cardItemBorder}`,
  };

  const LoungeCard = ({ lounge }: { lounge: typeof lounges[0] }) => (
    <div className="rounded-2xl overflow-hidden" style={glassStyle}>
      <div className="relative h-48">
        <img src={lounge.image} alt={lounge.name} className="w-full h-full object-cover" />
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="font-semibold text-gray-800">{lounge.rating}</span>
          <span className="text-xs text-gray-600">({lounge.reviews})</span>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-2">
          <h3 className="text-xl font-semibold" style={{ color: colors.text }}>{lounge.name}</h3>
          <p className="text-sm flex items-center gap-1 mt-1" style={{ color: colors.textSecondary }}>
            <MapPin className="w-4 h-4" />
            {lounge.terminal}
          </p>
        </div>

        <p className="mb-4" style={{ color: colors.textSecondary }}>{lounge.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {lounge.amenities.map((amenity, idx) => (
            <span key={idx} className="px-3 py-1 rounded-full text-xs flex items-center gap-1" style={tagStyle}>
              {getAmenityIcon(amenity)}
              {amenity}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 pb-4" style={{ borderBottom: `1px solid ${colors.glassBorder}` }}>
          <div className="flex items-center gap-2 text-sm" style={{ color: colors.text }}>
            <Clock className="w-4 h-4 text-purple-500" />
            <div>
              <p className="text-xs" style={{ color: colors.textMuted }}>Hours</p>
              <p className="font-medium">{lounge.hours}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: colors.text }}>
            <Users className="w-4 h-4 text-teal-500" />
            <div>
              <p className="text-xs" style={{ color: colors.textMuted }}>Capacity</p>
              <p className="font-medium">{lounge.capacity}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold" style={{ color: colors.text }}>Key Features:</p>
          <div className="grid grid-cols-2 gap-2">
            {lounge.features.slice(0, 4).map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
                <CheckCircle className="w-4 h-4 text-green-500" />
                {feature}
              </div>
            ))}
          </div>
          {lounge.features.length > 4 && (
            <button className="text-sm flex items-center gap-1 mt-2" style={{ color: 'rgb(220,181,21)' }}>
              View all features <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <button className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] text-white font-semibold hover:shadow-lg transition-all">
          Book This Suite
        </button>
      </div>
    </div>
  );

  const ServiceCategoryCard = ({ service }: { service: typeof services[0] }) => {
    const Icon = service.icon;
    return (
      <div className="rounded-2xl p-6" style={glassStyle}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgb(220,181,21)] to-[rgb(180,141,11)] flex items-center justify-center">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-semibold" style={{ color: colors.text }}>{service.category}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {service.items.map((item, itemIdx) => (
            <div key={itemIdx} className="p-4 rounded-xl" style={serviceItemStyle}>
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold" style={{ color: colors.text }}>{item.name}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.price === 'Included'
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-amber-100 text-amber-700 border border-amber-200'
                }`}>
                  {item.price}
                </span>
              </div>
              <p className="text-sm" style={{ color: colors.textSecondary }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] bg-clip-text text-transparent">
            Lounge Services
          </h1>
          <p className="mt-1" style={{ color: colors.textSecondary }}>
            Explore our premium suites and available amenities.
          </p>
        </div>
      </div>

      {/* Available Services Header & Category Filter */}
      <div>
        <h2 className="text-2xl mb-4" style={{ color: colors.text }}>Available Services</h2>

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="px-4 py-2 rounded-xl transition-all"
                style={
                  isActive
                    ? { background: 'linear-gradient(90deg, rgb(220,181,21), rgb(180,141,11))', color: '#fff' }
                    : {
                        background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(231,230,221,0.6)',
                        border: `1px solid ${colors.glassBorder}`,
                        color: colors.text,
                      }
                }
              >
                {category === 'all' ? 'All Services' : category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content based on selected category */}
      {selectedCategory === 'Suite' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {lounges.map((lounge) => <LoungeCard key={lounge.id} lounge={lounge} />)}
        </div>
      )}
      {selectedCategory === 'all' && (
        <div className="space-y-6">
          {/* Suites first */}
          <div>
            <h3 className="text-xl mb-4 flex items-center gap-2" style={{ color: colors.text }}>
              <Building className="w-5 h-5 text-purple-500" />
              Suite
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {lounges.map((lounge) => <LoungeCard key={lounge.id} lounge={lounge} />)}
            </div>
          </div>

          {/* All service categories */}
          {services.map((service, idx) => (
            <ServiceCategoryCard key={idx} service={service} />
          ))}
        </div>
      )}
      {selectedCategory !== 'Suite' && selectedCategory !== 'all' && (
        <div className="space-y-6">
          {filteredServices.map((service, idx) => (
            <ServiceCategoryCard key={idx} service={service} />
          ))}
        </div>
      )}

      {/* CTA Section */}
      <div className="rounded-2xl p-8 text-center" style={glassStyle}>
        <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2" style={{ color: colors.text }}>
          Ready to Experience Our Services?
        </h2>
        <p className="mb-6" style={{ color: colors.textSecondary }}>
          Book your visit today and enjoy world-class amenities and service.
        </p>
        <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] text-white font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2">
          Book Now
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}