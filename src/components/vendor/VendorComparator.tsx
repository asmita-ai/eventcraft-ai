import React, { useState } from 'react';
import { 
  HelpCircle, 
  Copy, 
  Check, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Star, 
  FileSearch 
} from 'lucide-react';
import { EventProfile, VendorQuoteComparison, VendorRfpTemplate } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface VendorComparatorProps {
  profile: EventProfile;
  rfpTemplates: VendorRfpTemplate[];
  quotes: VendorQuoteComparison[];
  onAddQuote?: (quote: VendorQuoteComparison) => void;
  onToggleShortlist: (quoteId: string) => void;
}

export const VendorComparator: React.FC<VendorComparatorProps> = ({
  profile,
  rfpTemplates,
  quotes,
  onToggleShortlist,
}) => {
  const [activeTab, setActiveTab] = useState<'compare' | 'rfp'>('compare');
  const [selectedCategory, setSelectedCategory] = useState<string>('catering');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredQuotes = quotes.filter((q) => q.category === selectedCategory);
  const activeRfp = rfpTemplates.find((r) => r.category === selectedCategory) || rfpTemplates[0];

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Controls: Category & Sub-tab Switcher */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'catering', label: '🍲 Catering & Menu', icon: '🍲' },
            { id: 'venue', label: '🏛️ Venue & Hall', icon: '🏛️' },
            { id: 'photography', label: '📸 Photography', icon: '📸' },
            { id: 'decoration', label: '🌸 Decor & Stage', icon: '🌸' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* View Switcher: Quotes vs RFPs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'compare' ? 'bg-white text-purple-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📊 Side-by-Side Comparison ({filteredQuotes.length})
          </button>
          <button
            onClick={() => setActiveTab('rfp')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'rfp' ? 'bg-white text-purple-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📝 RFP & Questions to Ask
          </button>
        </div>

      </div>

      {/* TAB 1: SIDE-BY-SIDE QUOTATION COMPARATOR */}
      {activeTab === 'compare' && (
        <div className="space-y-4">
          
          {/* Transparency & Audit Notice */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <FileSearch className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Transparent Multi-Quote Evaluation:</span>
              <p className="mt-0.5 leading-relaxed">
                As instructed by SME Srinivas, quotes are broken down into per-guest impact, verified inclusions, and flagged hidden charges (taxes, overtime fees, diesel surcharges) to empower objective host decisions.
              </p>
            </div>
          </div>

          {/* Quotation Comparison Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredQuotes.map((quote) => {
              const isShortlisted = quote.isShortlisted;
              return (
                <div
                  key={quote.id}
                  className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                    isShortlisted
                      ? 'border-purple-500 ring-2 ring-purple-400 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {quote.category.toUpperCase()}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{quote.rating}</span>
                      </div>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 mt-1">
                      {quote.vendorName}
                    </h4>

                    {/* Price & Per Guest breakdown */}
                    <div className="mt-3 flex items-baseline justify-between">
                      <div>
                        <span className="text-lg font-black text-purple-700">
                          {formatCurrency(quote.totalQuote, profile.currency)}
                        </span>
                        <span className="text-[11px] text-slate-400 block">Total Est. Quote</span>
                      </div>
                      {quote.perGuestRate && (
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-800">
                            ~{formatCurrency(quote.perGuestRate, profile.currency)}
                          </span>
                          <span className="text-[10px] text-slate-400 block">/ plate</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3.5 flex-1 text-xs">
                    
                    {/* Inclusions */}
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">
                        Key Inclusions:
                      </span>
                      <ul className="space-y-1">
                        {quote.inclusions.map((inc, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-slate-600">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Flagged Hidden Charges */}
                    {quote.hiddenChargesFlagged && quote.hiddenChargesFlagged.length > 0 && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                        <span className="font-bold text-rose-950 flex items-center gap-1 text-[11px]">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                          Flagged Hidden Fees:
                        </span>
                        {quote.hiddenChargesFlagged.map((h, i) => (
                          <p key={i} className="text-[11px] text-rose-900 leading-tight">
                            {h}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Clarification Checklist */}
                    {quote.clarificationQuestions && (
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <span className="font-bold text-slate-700 flex items-center gap-1 text-[11px]">
                          <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                          Clarify Before Signing:
                        </span>
                        {quote.clarificationQuestions.map((q, i) => (
                          <p key={i} className="text-[11px] text-slate-600 leading-tight">
                            • {q}
                          </p>
                        ))}
                      </div>
                    )}

                  </div>

                  {/* Card Footer: Shortlist CTA */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {isShortlisted ? '⭐ Shortlisted Candidate' : 'Candidate'}
                    </span>
                    <button
                      onClick={() => onToggleShortlist(quote.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isShortlisted
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {isShortlisted ? 'Shortlisted ✓' : 'Shortlist Vendor'}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: RFP & INQUIRY PROMPT GENERATOR */}
      {activeTab === 'rfp' && activeRfp && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">{activeRfp.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{activeRfp.overviewPrompt}</p>
            </div>
            <button
              onClick={() => handleCopyText('rfp-all', `${activeRfp.title}\n\nQuestions to Ask:\n${activeRfp.questionsToAsk.join('\n')}\n\nRequired Deliverables:\n${activeRfp.keyDeliverablesRequired.join('\n')}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-bold transition-colors self-start"
            >
              {copiedId === 'rfp-all' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'rfp-all' ? 'Copied to Clipboard!' : 'Copy Complete RFP'}</span>
            </button>
          </div>

          {/* Section 1: Crucial Questions to Ask */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
              Crucial Questions Every Host Must Ask Before Signing:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {activeRfp.questionsToAsk.map((q, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                  <span className="font-bold text-purple-600 shrink-0">{i + 1}.</span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Key Required Deliverables */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Non-Negotiable Deliverables to Include in Contract:
            </h4>
            <div className="space-y-2">
              {activeRfp.keyDeliverablesRequired.map((del, i) => (
                <div key={i} className="p-2.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-xs text-emerald-950 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>{del}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Negotiation Strategy */}
          {activeRfp.negotiationTips && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-950">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Host Negotiation Strategy & Leverage:</span>
              </div>
              {activeRfp.negotiationTips.map((tip, i) => (
                <p key={i} className="leading-relaxed">
                  💡 {tip}
                </p>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
