import React, { useState } from 'react';
import { 
  CreditCard, 
  Star, 
  Gift,
  TrendingUp,
  Users,
  Crown,
  Zap,
  Shield,
  CheckCircle,
  ArrowRight,
  Award,
  Calendar,
  Percent,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
} from 'lucide-react';

export function Membership() {
  const [currentTier, setCurrentTier] = useState('Platinum');
  const [memberData, setMemberData] = useState({
    memberSince: '2022-03-15',
    membershipNumber: 'HKIAL-PLT-2847',
    expiryDate: '2026-12-31',
    points: 8450,
    tierProgress: 85,
    nextTierPoints: 1550,
    annualFee: 3800,
    renewalDate: '2026-12-31',
    guestPasses: 3,
    priorityBooking: true
  });

  const tiers = [
    {
      name: 'Silver',
      icon: Star,
      color: 'from-gray-300 to-gray-500',
      bgColor: 'bg-gray-100',
      requirement: '0 - 2,999 points',
      annualFee: 1200,
      benefits: [
        'Access to all HKIAL lounges',
        'Standard booking window (7 days)',
        'Complimentary WiFi and refreshments',
        '5% discount on spa services',
        '1 guest pass per year',
        'Birthday bonus: 100 points'
      ]
    },
    {
      name: 'Gold',
      icon: Award,
      color: 'from-[rgb(220,181,21)] to-[rgb(180,141,11)]',
      bgColor: 'bg-yellow-50',
      requirement: '3,000 - 6,999 points',
      annualFee: 2400,
      benefits: [
        'Priority access to all lounges',
        'Extended booking window (14 days)',
        'Premium dining and beverages',
        '15% discount on spa services',
        '2 guest passes per year',
        'Birthday bonus: 250 points',
        'Fast-track security lanes',
        'Complimentary newspaper delivery'
      ]
    },
    {
      name: 'Platinum',
      icon: Crown,
      color: 'from-gray-400 to-gray-600',
      bgColor: 'bg-purple-50',
      requirement: '7,000 - 9,999 points',
      annualFee: 3800,
      benefits: [
        'Guaranteed lounge access',
        'Advanced booking window (30 days)',
        'À la carte dining privileges',
        '25% discount on all spa services',
        '3 guest passes per year',
        'Birthday bonus: 500 points',
        'Private cabana access',
        'Dedicated concierge service',
        'Complimentary shower suite',
        'Meeting room discounts'
      ]
    },
    {
      name: 'Diamond',
      icon: Zap,
      color: 'from-[rgb(220,181,21)] to-[rgb(180,141,11)]',
      bgColor: 'bg-blue-50',
      requirement: '10,000+ points',
      annualFee: 5800,
      benefits: [
        'Unlimited lounge access',
        'Book anytime, cancel free',
        'Exclusive Diamond-only areas',
        'Complimentary spa treatments',
        'Unlimited guest passes',
        'Birthday bonus: 1,000 points',
        'Private arrival/departure service',
        '24/7 personal concierge',
        'Complimentary valet parking',
        'Annual champagne allowance',
        'First-class only facilities',
        'Exclusive partner perks'
      ]
    }
  ];

  const pointsActivities = [
    { date: '2026-01-05', activity: 'Lounge visit - The Wing', points: '+120', type: 'earn' },
    { date: '2026-01-03', activity: 'Spa treatment redemption', points: '-2,000', type: 'redeem' },
    { date: '2025-12-28', activity: 'Lounge visit - The Pier', points: '+95', type: 'earn' },
    { date: '2025-12-25', activity: 'Holiday bonus', points: '+500', type: 'bonus' },
    { date: '2025-12-15', activity: 'Lounge visit - The Cabin', points: '+60', type: 'earn' }
  ];

  const rewardsGallery = [
    { name: 'Spa Treatment', points: 2000, image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80' },
    { name: 'Fine Dining Experience', points: 3000, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80' },
    { name: 'Airport Transfer', points: 1500, image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&q=80' },
    { name: 'Hotel Night Voucher', points: 5000, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80' },
    { name: 'Shopping Voucher', points: 2500, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80' },
    { name: 'Wine Tasting', points: 1800, image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80' }
  ];

  // Glassmorphism styles
  const glassStyle = {
    backdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
  };

  const getCurrentTierData = () => tiers.find(t => t.name === currentTier) || tiers[2];
  const tierData = getCurrentTierData();

  // ── Membership status ──────────────────────────────────────────────────
  const today = new Date();
  const expiry = new Date(memberData.expiryDate);
  const daysRemaining = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const membershipStatus =
    daysRemaining < 0
      ? { status: 'expired', label: 'Expired', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', text: `Expired ${Math.abs(daysRemaining)} days ago` }
      : daysRemaining <= 30
      ? { status: 'expiring', label: 'Expiring Soon', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: `${daysRemaining} days remaining` }
      : { status: 'active', label: 'Active', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', text: `${daysRemaining} days remaining` };
  const MemberStatusIcon = membershipStatus.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] bg-clip-text text-transparent">
            My Membership
          </h1>
          <p className="text-gray-600 mt-1">Manage your membership and explore benefits.</p>
        </div>
      </div>

      {/* ── Membership Status Alert ──────────────────────────────────────── */}
      <div className={`rounded-2xl px-5 py-4 border flex items-center justify-between gap-4 ${membershipStatus.bg} ${membershipStatus.border}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${membershipStatus.bg} border ${membershipStatus.border}`}>
            <MemberStatusIcon className={`w-5 h-5 ${membershipStatus.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-800">Membership Status:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs border ${membershipStatus.bg} ${membershipStatus.border} ${membershipStatus.color}`}>
                {membershipStatus.label}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-0.5 flex-wrap text-xs text-gray-600">
              <span>
                <Clock className="w-3 h-3 inline mr-1" />
                {membershipStatus.text}
              </span>
              <span>
                Valid until{' '}
                <strong className="text-gray-800">
                  {expiry.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </strong>
              </span>
            </div>
          </div>
        </div>
        {membershipStatus.status !== 'active' && (
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] text-white text-sm flex-shrink-0 hover:opacity-90 transition-all">
            <RefreshCw className="w-4 h-4" />
            {membershipStatus.status === 'expired' ? 'Renew Now' : 'Renew Early'}
          </button>
        )}
      </div>

      {/* Current Membership Card */}
      <div className="rounded-2xl p-8 border border-white/20" style={glassStyle}>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tierData.color} flex items-center justify-center`}>
                {React.createElement(tierData.icon, { className: "w-8 h-8 text-white" })}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{currentTier} Member</h2>
                <p className="text-sm text-gray-600">Member since {new Date(memberData.memberSince).getFullYear()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Member ID</p>
                <p className="font-mono text-sm font-semibold text-gray-800">{memberData.membershipNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Valid Until</p>
                <p className="font-semibold text-gray-800">{new Date(memberData.expiryDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Points Balance</p>
                <p className="font-semibold text-gray-800">{memberData.points.toLocaleString()} pts</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Guest Passes</p>
                <p className="font-semibold text-gray-800">{memberData.guestPasses} available</p>
              </div>
            </div>

            <div className="bg-white/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-700">Progress to Diamond Tier</p>
                <p className="text-sm font-semibold text-gray-800">{memberData.tierProgress}%</p>
              </div>
              <div className="w-full bg-white/30 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] rounded-full h-3 transition-all"
                  style={{ width: `${memberData.tierProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600">
                {memberData.nextTierPoints} more points needed for Diamond status
              </p>
            </div>
          </div>

          <div className="lg:border-l lg:border-white/20 lg:pl-6 space-y-3">
            <button className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] text-white font-semibold hover:shadow-lg transition-all">
              Renew Membership
            </button>
            <button className="w-full px-6 py-3 rounded-xl border border-white/30 bg-white/20 text-gray-700 font-semibold hover:bg-white/30 transition-all">
              Download Card
            </button>
            <button className="w-full px-6 py-3 rounded-xl border border-white/30 bg-white/20 text-gray-700 font-semibold hover:bg-white/30 transition-all">
              Update Details
            </button>
          </div>
        </div>
      </div>

      {/* Membership Tiers Comparison */}
      <div>
        <h2 className="text-2xl text-gray-800 mb-4">Membership Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => {
            const TierIcon = tier.icon;
            const isCurrentTier = tier.name === currentTier;
            
            return (
              <div 
                key={tier.name} 
                className={`rounded-2xl p-6 border transition-all ${
                  isCurrentTier 
                    ? 'border-purple-500 ring-2 ring-purple-500 ring-opacity-50' 
                    : 'border-white/20'
                }`}
                style={glassStyle}
              >
                {isCurrentTier && (
                  <div className="mb-3">
                    <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700 border border-purple-200">
                      Current Tier
                    </span>
                  </div>
                )}
                
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}>
                  <TierIcon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-1">{tier.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{tier.requirement}</p>
                <p className="text-2xl font-bold text-gray-800 mb-4">HKD {tier.annualFee.toLocaleString()}<span className="text-sm font-normal text-gray-600">/year</span></p>
                
                <div className="space-y-2 mb-4">
                  {tier.benefits.slice(0, 4).map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                  {tier.benefits.length > 4 && (
                    <p className="text-sm text-purple-600">+{tier.benefits.length - 4} more benefits</p>
                  )}
                </div>
                
                {!isCurrentTier && (
                  <button className="w-full py-2 rounded-xl border border-white/30 bg-white/20 text-gray-700 hover:bg-white/30 transition-all text-sm font-semibold">
                    Learn More
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Points Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 border border-white/20" style={glassStyle}>
          <h2 className="text-xl text-gray-800 flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Recent Points Activity
          </h2>
          
          <div className="space-y-3">
            {pointsActivities.map((activity, index) => {
              let activityColorClass = 'text-red-600';
              if (activity.type === 'earn') {
                activityColorClass = 'text-green-600';
              } else if (activity.type === 'bonus') {
                activityColorClass = 'text-purple-600';
              }
              return (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/20 border border-white/20">
                <div>
                  <p className="font-medium text-gray-800">{activity.activity}</p>
                  <p className="text-xs text-gray-600">{new Date(activity.date).toLocaleDateString()}</p>
                </div>
                <span className={`font-semibold ${activityColorClass}`}>
                  {activity.points}
                </span>
              </div>
              );
            })}
          </div>

          <button className="w-full mt-4 py-2 rounded-xl border border-white/30 bg-white/20 text-gray-700 hover:bg-white/30 transition-all text-sm font-semibold flex items-center justify-center gap-2">
            View All Activity <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Rewards Redemption */}
        <div className="rounded-2xl p-6 border border-white/20" style={glassStyle}>
          <h2 className="text-xl text-gray-800 flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-teal-600" />
            Redeem Your Points
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            {rewardsGallery.slice(0, 4).map((reward, index) => (
              <div key={index} className="rounded-xl overflow-hidden bg-white/20 border border-white/20 hover:bg-white/30 transition-all cursor-pointer">
                <div className="h-24 relative">
                  <img src={reward.image} alt={reward.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-800 mb-1">{reward.name}</p>
                  <p className="text-xs text-purple-600 font-semibold">{reward.points.toLocaleString()} pts</p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
            Explore All Rewards <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Upgrade CTA */}
      {currentTier !== 'Diamond' && (
        <div className="rounded-2xl p-8 text-center border border-purple-300 bg-gradient-to-br from-purple-50/50 to-blue-50/50" style={{
          ...glassStyle,
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)'
        }}>
          <Crown className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Upgrade to Diamond</h2>
          <p className="text-gray-600 mb-6">Unlock unlimited access and exclusive premium benefits</p>
          <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2">
            Upgrade Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}