interface ProStatus {
  isPro: boolean;
  loading: boolean;
}

// FundSim is free. No Pro tier — every feature is unlocked for every user.
// The billing/Supabase plumbing (api/stripe-webhook, profiles.is_pro) is kept
// in case we ever reintroduce a paid tier, but at the UI level the gate is
// permanently open.
export function useProStatus(): ProStatus {
  return { isPro: true, loading: false };
}
