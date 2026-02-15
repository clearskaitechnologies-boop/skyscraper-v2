// Phase 5 - Carrier-specific terminology mapping

export interface CarrierTerms {
  rcv: string;
  acv: string;
  depreciation: string;
  holdback: string;
  hasDep: boolean;
}

export interface Carrier {
  id: string;
  name: string;
  terms: CarrierTerms;
}

export const CARRIERS: Carrier[] = [
  {
    id: 'state_farm',
    name: 'State Farm',
    terms: {
      rcv: 'Replacement Cost Value (RCV)',
      acv: 'Actual Cash Value (ACV)',
      depreciation: 'Depreciation',
      holdback: 'Depreciation Holdback',
      hasDep: true,
    },
  },
  {
    id: 'allstate',
    name: 'Allstate',
    terms: {
      rcv: 'RCV',
      acv: 'ACV',
      depreciation: 'Holdback',
      holdback: 'Holdback Amount',
      hasDep: true,
    },
  },
  {
    id: 'usaa',
    name: 'USAA',
    terms: {
      rcv: 'RCV',
      acv: 'ACV',
      depreciation: 'Recoverable Depreciation',
      holdback: 'Recoverable Amount',
      hasDep: true,
    },
  },
  {
    id: 'farm_bureau',
    name: 'Farm Bureau',
    terms: {
      rcv: 'RCV',
      acv: 'ACV',
      depreciation: 'Depreciation',
      holdback: 'Holdback',
      hasDep: true,
    },
  },
  {
    id: 'travelers',
    name: 'Travelers',
    terms: {
      rcv: 'RCV',
      acv: 'ACV',
      depreciation: 'Depreciation',
      holdback: 'Depreciation Holdback',
      hasDep: true,
    },
  },
  {
    id: 'liberty_mutual',
    name: 'Liberty Mutual',
    terms: {
      rcv: 'Replacement Cost',
      acv: 'Actual Cash Value',
      depreciation: 'Depreciation',
      holdback: 'Holdback',
      hasDep: true,
    },
  },
  {
    id: 'nationwide',
    name: 'Nationwide',
    terms: {
      rcv: 'RCV',
      acv: 'ACV',
      depreciation: 'Depreciation',
      holdback: 'Holdback',
      hasDep: true,
    },
  },
  {
    id: 'progressive',
    name: 'Progressive',
    terms: {
      rcv: 'RCV',
      acv: 'ACV',
      depreciation: 'Depreciation',
      holdback: 'Holdback',
      hasDep: false,
    },
  },
  {
    id: 'aaa',
    name: 'AAA',
    terms: {
      rcv: 'RCV',
      acv: 'ACV',
      depreciation: 'Depreciation',
      holdback: 'Holdback',
      hasDep: true,
    },
  },
  {
    id: 'other',
    name: 'Other',
    terms: {
      rcv: 'RCV',
      acv: 'ACV',
      depreciation: 'Depreciation',
      holdback: 'Holdback',
      hasDep: false,
    },
  },
];

/**
 * Get carrier by ID
 */
export function getCarrierById(id: string): Carrier | undefined {
  return CARRIERS.find((c) => c.id === id);
}

/**
 * Get carrier by name
 */
export function getCarrierByName(name: string): Carrier | undefined {
  return CARRIERS.find((c) => c.name === name);
}

/**
 * Get terms for a carrier
 */
export function getCarrierTerms(carrierIdOrName: string): CarrierTerms {
  const carrier = getCarrierById(carrierIdOrName) || getCarrierByName(carrierIdOrName);
  return carrier?.terms || CARRIERS.find((c) => c.id === 'other')!.terms;
}
