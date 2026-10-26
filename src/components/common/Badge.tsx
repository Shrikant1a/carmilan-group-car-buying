import React from 'react';
import { GroupStatus, VerificationStatus } from '../../types';
import { GROUP_STATUS_LABELS } from '../../lib/constants';
import { CheckCircle2, Clock, AlertCircle, Sparkles, XCircle } from 'lucide-react';

interface GroupStatusBadgeProps {
  status: GroupStatus;
  size?: 'sm' | 'md';
}

export const GroupStatusBadge: React.FC<GroupStatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = GROUP_STATUS_LABELS[status] || GROUP_STATUS_LABELS.recruiting;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  const icons: Record<GroupStatus, React.ReactNode> = {
    recruiting: <Clock className="w-3.5 h-3.5 inline mr-1 text-amber-600" />,
    target_reached: <Sparkles className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />,
    quotations_requested: <AlertCircle className="w-3.5 h-3.5 inline mr-1 text-blue-600" />,
    offers_received: <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-indigo-600" />,
    completed: <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-slate-600" />,
    cancelled: <XCircle className="w-3.5 h-3.5 inline mr-1 text-rose-600" />,
    expired: <Clock className="w-3.5 h-3.5 inline mr-1 text-zinc-600" />,
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border shadow-xs tracking-tight ${config.bg} ${config.color} ${sizeClasses}`}
    >
      {icons[status]}
      {config.label}
    </span>
  );
};

export const VerifiedDealerBadge: React.FC<{ isVerified: boolean; className?: string }> = ({
  isVerified,
  className = '',
}) => {
  if (isVerified) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`}
        title="Verified Authorized Dealership"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        Verified Dealer
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
      title="Pending Business Verification"
    >
      <Clock className="w-3.5 h-3.5 text-amber-600" />
      Verification Pending
    </span>
  );
};
