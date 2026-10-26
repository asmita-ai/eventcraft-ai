import {
  EventProfile,
  TimelineTask,
  VendorRfpTemplate,
  VendorQuoteComparison,
  PersonalizedIdea,
  EventPlan,
} from '../types';
import { calculateBudgetAllocation, generateTradeOffSuggestions } from '../utils/calculations';

/**
 * Generate a complete, interconnected, realistic event plan deterministically.
 * Serves as both the zero-quota fallback and the instant preset generator.
 */
export function generateHeuristicPlan(profile: EventProfile): EventPlan {
  const budgetItems = calculateBudgetAllocation(profile);
  const tradeOffs = generateTradeOffSuggestions(profile, budgetItems, 0);
  const timeline = generateHeuristicTimeline(profile);
  const rfpTemplates = generateHeuristicRfps(profile);
  const vendorQuotes = generateHeuristicVendorQuotes(profile);
  const personalizedIdeas = generateHeuristicIdeas(profile);

  return {
    profile,
    budgetItems,
    tradeOffs,
    timeline,
    rfpTemplates,
    vendorQuotes,
    personalizedIdeas,
    revisionHistory: [
      {
        timestamp: new Date().toISOString(),
        description: `Initial dynamic plan generated for ${profile.occasion} (${profile.guestCount} guests, budget ${profile.currency} ${profile.totalBudget}).`,
      },
    ],
  };
}

/**
 * Default preset for the Wedding celebration scenario
 */
export const WEDDING_PRESET: EventProfile = {
  id: 'preset-wedding',
  title: 'Sharma & Verma Royal Celebration',
  eventType: 'wedding',
  occasion: 'Traditional & Contemporary Wedding',
  targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 months away
  city: 'Bengaluru / Delhi NCR',
  totalBudget: 800000, // ₹8 Lakh baseline budget
  currency: 'INR',
  guestCount: 200, // 200 guests as mentioned by Srinivas
  experienceTier: 'balanced-comfort',
  priorities: {
    catering: 5, // Prioritizing food experience
    venue: 4, // Good comfortable venue
    decoration: 2, // Willing to simplify decor
    photography: 4, // Value lasting memories
    entertainment: 3, // Moderate DJ & music
    contingency: 4, // Safety reserve
  },
  demographics: {
    childrenPercent: 15,
    elderlyPercent: 25,
    culturalBackground: 'North-South Fusion Wedding',
    dietaryRestrictions: ['Vegetarian Counters', 'Jain Options', 'Gluten-Free Corner'],
    accessibilityNeeds: [
      'Wheelchair accessible entry',
      'Ground-floor seating for elderly grandparents',
      'Low-decibel quiet dining zone',
    ],
  },
  mustHaves: [
    'Hot live Jalebi & Chaat station',
    'Comfortable seating for 50+ seniors away from loud speakers',
    'Candid photographer who captures real emotions',
    'All-weather covered banquet/lawn contingency',
  ],
  flexibles: [
    'Exotic imported floral arches (can replace with local marigold & ambient LED lighting)',
    'Physical boxed invitations (happy with animated digital invite site)',
    'Celebrity DJ (happy with local high-rated acoustic performer + playlist)',
  ],
  notes:
    'Focus on warm family hospitality, exceptional food variety, and minimal stress for parents.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Milestone Birthday Preset
 */
export const BIRTHDAY_PRESET: EventProfile = {
  id: 'preset-birthday',
  title: "Aarav's 10th Superhero Gala / Dad's 50th Golden Jubilee",
  eventType: 'birthday',
  occasion: '50th Golden Jubilee Birthday',
  targetDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 25 days away
  city: 'Mumbai',
  totalBudget: 150000,
  currency: 'INR',
  guestCount: 65,
  experienceTier: 'balanced-comfort',
  priorities: {
    catering: 5,
    venue: 3,
    decoration: 3,
    photography: 4,
    entertainment: 4,
    contingency: 3,
  },
  demographics: {
    childrenPercent: 20,
    elderlyPercent: 30,
    culturalBackground: 'Contemporary Family Gathering',
    dietaryRestrictions: ['Pure Veg & Non-Veg separate service', 'Diabetic-friendly desserts'],
    accessibilityNeeds: ['Step-free elevator access', 'Comfortable lounge couches'],
  },
  mustHaves: [
    'Surprise video tribute montage with childhood photos',
    'Live acoustic singer performing retro classics',
    'Custom 3-tier celebration cake',
  ],
  flexibles: [
    'Elaborate theme props',
    'Individual take-home gift hampers (can do artisanal sweet boxes)',
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Community Cultural Festival Preset
 */
export const COMMUNITY_PRESET: EventProfile = {
  id: 'preset-community',
  title: 'Resident Association Grand Diwali & Cultural Mela',
  eventType: 'community',
  occasion: 'Annual Society Cultural Fest & Food Carnival',
  targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 weeks away
  city: 'Pune / Hyderabad',
  totalBudget: 350000,
  currency: 'INR',
  guestCount: 350,
  experienceTier: 'budget-smart',
  priorities: {
    catering: 4,
    venue: 3,
    decoration: 3,
    photography: 2,
    entertainment: 5,
    contingency: 4,
  },
  demographics: {
    childrenPercent: 35,
    elderlyPercent: 20,
    culturalBackground: 'Multicultural Resident Community',
    dietaryRestrictions: [
      'Strict Jain counters',
      'Street food carnival stalls',
      'Hygienic water points',
    ],
    accessibilityNeeds: [
      'Wide walkways for strollers & wheelchairs',
      'First-aid tent & lost-child booth',
    ],
  },
  mustHaves: [
    'Children talent show and prize distribution',
    'High-grade fire safety compliance and electrical safety clearances',
    'Ample dustbins and eco-friendly compostable cutlery',
  ],
  flexibles: [
    'Stage backdrop complexity',
    'Printed coupon booklets (can use QR-based digital token app)',
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Dependency-aware timeline generator
 */
function generateHeuristicTimeline(profile: EventProfile): TimelineTask[] {
  const targetTime = new Date(profile.targetDate).getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  const getDateStr = (daysBefore: number) => {
    return new Date(targetTime - daysBefore * dayMs).toISOString().split('T')[0];
  };

  const isLongTimeline = profile.eventType === 'wedding';
  const factor = isLongTimeline ? 1 : 0.3;

  return [
    {
      id: 'task-lock-venue-date',
      title: 'Lock Venue & Contractually Confirm Event Date',
      category: 'venue',
      deadlineDate: getDateStr(Math.round(90 * factor)),
      daysBeforeEvent: Math.round(90 * factor),
      priority: 'critical',
      status: 'completed',
      dependencies: [],
      cascadeImpactDesc:
        'Foundational block. If delayed, all catering tastings, invitations, and decorator site visits are completely halted!',
      assignedTo: 'Lead Organizer / Family Elder',
      notes: 'Inspect backup generator wattage, parking capacity, and curfew timings.',
    },
    {
      id: 'task-caterer-menu',
      title: 'Shortlist Caterers & Conduct Food Tasting Session',
      category: 'catering',
      deadlineDate: getDateStr(Math.round(70 * factor)),
      daysBeforeEvent: Math.round(70 * factor),
      priority: 'critical',
      status: 'in_progress',
      dependencies: ['task-lock-venue-date'],
      cascadeImpactDesc: 'Blocked until venue kitchen & staging access rules are verified.',
      assignedTo: 'Food Committee',
      notes: `Targeting ~${profile.currency} ${Math.round((profile.totalBudget * 0.32) / profile.guestCount)} per plate for ${profile.guestCount} guests.`,
    },
    {
      id: 'task-digital-invites',
      title: 'Finalize Design & Dispatch Save-The-Dates / Digital Invites',
      category: 'invitations',
      deadlineDate: getDateStr(Math.round(60 * factor)),
      daysBeforeEvent: Math.round(60 * factor),
      priority: 'high',
      status: 'pending',
      dependencies: ['task-lock-venue-date'],
      cascadeImpactDesc: 'Cannot send invites without finalized venue GPS location and schedule.',
      assignedTo: 'Communications Lead',
      notes: 'Collect dietary preferences and accessibility needs via online RSVP form.',
    },
    {
      id: 'task-photographer-booking',
      title: 'Book Photographer & Cinematographer (Candid + Traditional)',
      category: 'photography',
      deadlineDate: getDateStr(Math.round(50 * factor)),
      daysBeforeEvent: Math.round(50 * factor),
      priority: 'high',
      status: 'pending',
      dependencies: ['task-lock-venue-date'],
      cascadeImpactDesc: 'Top cinematographers book out 3-6 months in advance.',
      assignedTo: 'Host',
      notes:
        'Ensure raw footage delivery, drone permit confirmation, and teaser reel within 7 days.',
    },
    {
      id: 'task-decor-stage-layout',
      title: 'Approve Stage Design, Lighting Blueprint & Floral Plan',
      category: 'decoration',
      deadlineDate: getDateStr(Math.round(35 * factor)),
      daysBeforeEvent: Math.round(35 * factor),
      priority: 'medium',
      status: 'pending',
      dependencies: ['task-lock-venue-date'],
      cascadeImpactDesc:
        'Needs physical venue layout measurements before approving backdrop dimensions.',
      assignedTo: 'Decor Coordinator',
      notes: 'Ensure photobooth is in well-lit foyer away from heavy foot-traffic bottlenecks.',
    },
    {
      id: 'task-sound-dj-permits',
      title: 'Finalize Sound, DJ & Municipal Noise Clearance / PPL Permits',
      category: 'entertainment',
      deadlineDate: getDateStr(Math.round(25 * factor)),
      daysBeforeEvent: Math.round(25 * factor),
      priority: 'medium',
      status: 'pending',
      dependencies: ['task-lock-venue-date'],
      cascadeImpactDesc: 'Cannot apply for outdoor sound clearances without venue NOC.',
      assignedTo: 'Entertainment Lead',
      notes: 'Enforce sound limit after 10 PM to comply with local regulations.',
    },
    {
      id: 'task-rsvp-lock-headcount',
      title: 'Lock Final RSVP Headcount & Deliver Plate Guarantee to Caterer',
      category: 'catering',
      deadlineDate: getDateStr(Math.round(10 * factor)),
      daysBeforeEvent: Math.round(10 * factor),
      priority: 'critical',
      status: 'pending',
      dependencies: ['task-caterer-menu', 'task-digital-invites'],
      cascadeImpactDesc:
        'Caterer purchases perishable inventory based on this final headcount lock.',
      assignedTo: 'Host & RSVPs',
      notes: 'Add 10% extra buffer plates above confirmed RSVPs for floating guests.',
    },
    {
      id: 'task-dry-run-contingency',
      title: 'Final Venue Walkthrough, Power Generator Dry Run & Run of Show',
      category: 'logistics',
      deadlineDate: getDateStr(Math.round(2 * factor)),
      daysBeforeEvent: Math.round(2 * factor),
      priority: 'high',
      status: 'pending',
      dependencies: ['task-decor-stage-layout', 'task-sound-dj-permits'],
      cascadeImpactDesc: 'The final coordination dry run prevents day-of chaos.',
      assignedTo: 'Master of Ceremonies / Core Team',
      notes: 'Inspect wheelchair ramp slopes, stage step railings, and emergency medical kit.',
    },
  ];
}

/**
 * Generate RFP templates with tailored questions to ask vendors
 */
function generateHeuristicRfps(profile: EventProfile): VendorRfpTemplate[] {
  return [
    {
      category: 'catering',
      title: 'Catering Vendor Inquiry & RFP Formulation',
      overviewPrompt: `Inquiry for ${profile.occasion} expecting ${profile.guestCount} guests with ~${profile.currency} ${Math.round((profile.totalBudget * 0.32) / profile.guestCount)}/plate target.`,
      questionsToAsk: [
        'What is your all-inclusive per-plate rate including GST, service staff, and chafing dishes?',
        'How many live food stations can be accommodated within this pricing?',
        'Do you charge extra for mineral water bottles, welcome drink ice, or cutlery cleanup?',
        'What is your policy if guest attendance surges by +15% on the day of the event?',
        'Can you provide dedicated pure vegetarian and Jain cooking stations with separate cookware?',
      ],
      keyDeliverablesRequired: [
        'Complimentary menu tasting session for 4 family members',
        'Uniformed servers with hairnets and minimum 1 server per 20 guests ratio',
        'Eco-friendly packaging for leftovers distribution or partnership with hunger relief NGOs',
      ],
      negotiationTips: [
        'Ask to bundle welcome beverage dispensers for free instead of asking for direct price discounts.',
        'Clarify overtime kitchen staff hourly charges up front to prevent surprise post-midnight bills.',
      ],
    },
    {
      category: 'venue',
      title: 'Venue & Banquet Hall Contract RFP',
      overviewPrompt: `Banquet / Lawn rental RFP for ${profile.guestCount} seated attendees with parking and air conditioning.`,
      questionsToAsk: [
        'What is the precise operational curfew for outdoor vs indoor music systems?',
        'Is 100% DG generator power backup included, or is diesel billed separately per hour of usage?',
        'Are outside catering and decor vendors permitted, or is there an exclusive vendor royalty fee?',
        'How many complimentary green rooms/bridal suites are included in the rental package?',
        'What are the cancellation and date-rescheduling penalty clauses in case of emergency?',
      ],
      keyDeliverablesRequired: [
        'Valet parking arrangement for minimum 40 vehicles',
        'Clean, continuously serviced washrooms with disabled access stalls',
        'Dedicated venue manager on site throughout setup and teardown hours',
      ],
      negotiationTips: [
        'Request 2 extra hours of complimentary decoration setup time before the event starts.',
        'Negotiate exemption of outside decorator royalty fee in exchange for leaving basic drapery intact.',
      ],
    },
    {
      category: 'photography',
      title: 'Photography & Cinematography Deliverables RFP',
      overviewPrompt: `Comprehensive photo/video documentation capturing emotion, candid family moments, and cinematic highlight reel.`,
      questionsToAsk: [
        'How many traditional and candid shooters will be present on site?',
        'What is the exact delivery timeline for the 3-minute teaser reel versus the full photo album?',
        'Do you provide unedited RAW footage on a hard drive upon request?',
        'Are drone photography permissions and drone operator charges included?',
      ],
      keyDeliverablesRequired: [
        'Minimum 300 color-corrected high-resolution digital photos within 14 days',
        '1 cinematic 3-minute 4K highlight reel optimized for social sharing',
        '1 heirloom hardbound printed photo album with 40 sheets',
      ],
      negotiationTips: [
        'Request an Instagram 60-second vertical reel within 48 hours for immediate social announcements.',
      ],
    },
  ];
}

/**
 * Generate realistic vendor quotes with flagged hidden charges and pros/cons
 */
function generateHeuristicVendorQuotes(profile: EventProfile): VendorQuoteComparison[] {
  const plateTarget = Math.round((profile.totalBudget * 0.32) / Math.max(profile.guestCount, 1));
  const guests = profile.guestCount;

  return [
    {
      id: 'quote-caterer-1',
      vendorName: 'Royal Spice Gourmet Banquets',
      category: 'catering',
      totalQuote: Math.round(plateTarget * 1.15 * guests),
      perGuestRate: Math.round(plateTarget * 1.15),
      inclusions: [
        '3 Welcome Mocktails + 6 Starters (4 Veg / 2 Non-Veg)',
        '8 Main Course Dishes with Live Roti & Naan tandoor',
        '3 Desserts including Hot Gulab Jamun & Kulfi Counter',
        'Uniformed servers (1:15 ratio), fine bone china cutlery',
      ],
      exclusions: ['Branded mineral water bottles', 'Live chaat counter chef fee'],
      hiddenChargesFlagged: [
        '⚠️ 18% GST billed on final invoice (not reflected in base per-plate rate of ₹' +
          Math.round(plateTarget * 1.15) +
          ')',
        '⚠️ Overtime service fee of ₹3,500/hour beyond 11:30 PM',
      ],
      clarificationQuestions: [
        'Will there be separate serving tongs and distinct warmers for Jain/Pure-Veg counters?',
        'Is ice for mocktails purified RO ice or commercial block ice?',
      ],
      rating: 4.8,
      pros: [
        'Exceptional food quality reviews',
        'Flawless server etiquette',
        'Comprehensive live counters',
      ],
      cons: ['Above initial target plate budget', 'Strict cancellation refund window'],
      isShortlisted: true,
    },
    {
      id: 'quote-caterer-2',
      vendorName: 'Annapurna Heritage Caterers',
      category: 'catering',
      totalQuote: Math.round(plateTarget * 0.95 * guests),
      perGuestRate: Math.round(plateTarget * 0.95),
      inclusions: [
        '2 Welcome Drinks + 4 Starters',
        '6 Main Course Dishes with Basmati Rice & Bread Basket',
        '2 Desserts (Rasmalai & Ice Cream)',
        'Buffet setup with brass chafing dishes',
      ],
      exclusions: ['Waitstaff tips', 'Specialty mocktail bar'],
      hiddenChargesFlagged: [
        '⚠️ Transport & generator fuel surcharge of ₹4,000 for venue setup',
        '⚠️ Waste disposal fee of ₹2,500 if venue does not provide municipal bins',
      ],
      clarificationQuestions: [
        'Are serving staff provided, or do we hire external hospitality waiters?',
        'What is the plate breakage replacement penalty rate?',
      ],
      rating: 4.4,
      pros: [
        'Fits within target budget comfortably',
        'Generous portion sizing',
        'Great regional traditional taste',
      ],
      cons: ['Simpler table presentation', 'Limited international starter options'],
      isShortlisted: false,
    },
    {
      id: 'quote-caterer-3',
      vendorName: 'Urban Feast Catering Co.',
      category: 'catering',
      totalQuote: Math.round(plateTarget * 1.05 * guests),
      perGuestRate: Math.round(plateTarget * 1.05),
      inclusions: [
        'Live Pasta & Pizza Counter + 4 Starters',
        'Fusion North & South Indian Curries',
        'Artisanal Dessert Jar Wall',
        'Modern minimalist buffet styling & signage',
      ],
      exclusions: ['Cutlery breakage insurance', 'Late night snack service'],
      hiddenChargesFlagged: [
        '⚠️ ₹6,000 mandatory kitchen deep-cleaning fee',
        '⚠️ Corkage charges if outside mocktail syrups are provided',
      ],
      clarificationQuestions: [
        'Can pizza ovens operate safely on venue domestic electrical load?',
        'Do they supply biodegradable compostable plates for cocktail hour?',
      ],
      rating: 4.6,
      pros: [
        'Youth and kid friendly food options',
        'Aesthetically stunning food styling',
        'Fast response time',
      ],
      cons: ['Slightly lower senior-citizen comfort food variety'],
      isShortlisted: false,
    },
  ];
}

/**
 * Generate personalized ideas tailored to demographic mix and cultural background
 */
function generateHeuristicIdeas(profile: EventProfile): PersonalizedIdea[] {
  const ideas: PersonalizedIdea[] = [];
  const d = profile.demographics;

  // Senior citizen friendly ideas
  if (d.elderlyPercent >= 20) {
    ideas.push({
      id: 'idea-elderly-comfort-lounge',
      title: 'Acoustic-Friendly "Baithak" & Heritage Tea Lounge',
      category: 'accessibility',
      concept:
        'A dedicated cozy lounge zone positioned 25 meters away from speakers with cushioned armchairs, warm lighting, and traditional hot Masala Chai & filter coffee service.',
      whyItFitsThisAudience: `Tailored for the ${d.elderlyPercent}% elderly guests who want to converse comfortably without shouting over loud music or climbing stairs.`,
      estimatedCostRange: `${profile.currency} 8,000 – 14,000`,
      budgetFriendlyAlternative:
        'Utilize venue existing sofas with rented brass samovars and handmade floral centerpieces.',
      favorited: true,
    });
  }

  // Children friendly ideas
  if (d.childrenPercent >= 15) {
    ideas.push({
      id: 'idea-kids-creative-corner',
      title: 'Interactive Origami, Caricature & Slime Craft Station',
      category: 'activities',
      concept:
        'A supervised activity table with a dedicated entertainer doing live balloon twisting, face painting, and caricature sketches.',
      whyItFitsThisAudience: `Keeps the ${d.childrenPercent}% kids joyfully engaged so parents can relax and participate in main celebration rituals.`,
      estimatedCostRange: `${profile.currency} 6,000 – 10,000`,
      budgetFriendlyAlternative:
        'DIY coloring book activity kits with non-toxic crayons and customized superhero/princess stickers placed on dinner tables.',
      favorited: true,
    });
  }

  // Cultural theme idea
  ideas.push({
    id: 'idea-cultural-tradition-fusion',
    title: 'Marigold Canopy & Live Shehnai / Acoustic Flute Welcome',
    category: 'theme',
    concept:
      'An entrance adorned with hanging brass bells and fresh marigolds with an artist performing soothing instrumental ragas as guests arrive.',
    whyItFitsThisAudience: `Honors ${profile.occasion} cultural hospitality while creating an immediate sensory impact as soon as guests step in.`,
    estimatedCostRange: `${profile.currency} 12,000 – 18,000`,
    budgetFriendlyAlternative:
      'Curated high-fidelity classical instrumental playlist played over warm ambient foyer speakers with simple marigold petal rangolis.',
    favorited: false,
  });

  // Food idea
  ideas.push({
    id: 'idea-signature-culinary-story',
    title: '"From Our Roots" Family Recipe Live Counter',
    category: 'food',
    concept:
      "Featuring one heirloom grandmother recipe (e.g. signature Dal Baati, Hyderabadi Haleem, or Grandma's Filter Coffee Cake) with a framed story card.",
    whyItFitsThisAudience:
      'Creates deep emotional connection and memorable conversation topics among extended relatives.',
    estimatedCostRange: `${profile.currency} 5,000 – 8,000 extra on catering`,
    budgetFriendlyAlternative:
      'Work with existing caterer to use the family spice blend at zero extra cost.',
    favorited: true,
  });

  return ideas;
}
