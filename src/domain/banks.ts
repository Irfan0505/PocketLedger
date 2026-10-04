export type PopularBank = {
  key: string;
  name: string;
  domain: string;
  color: string;
};

export const POPULAR_BANKS: readonly PopularBank[] = [
  { key: "chase", name: "Chase", domain: "chase.com", color: "#117ACA" },
  { key: "bofa", name: "Bank of America", domain: "bankofamerica.com", color: "#E31837" },
  { key: "wellsfargo", name: "Wells Fargo", domain: "wellsfargo.com", color: "#D71E28" },
  { key: "citi", name: "Citi", domain: "citi.com", color: "#003B70" },
  { key: "usbank", name: "U.S. Bank", domain: "usbank.com", color: "#0C2074" },
  { key: "pnc", name: "PNC Bank", domain: "pnc.com", color: "#F58025" },
  { key: "truist", name: "Truist", domain: "truist.com", color: "#2E1A47" },
  { key: "capitalone", name: "Capital One", domain: "capitalone.com", color: "#004977" },
  { key: "td", name: "TD Bank", domain: "td.com", color: "#34A853" },
  { key: "goldman", name: "Marcus by Goldman Sachs", domain: "marcus.com", color: "#7399C6" },
  { key: "schwab", name: "Charles Schwab", domain: "schwab.com", color: "#00A0DF" },
  { key: "ally", name: "Ally Bank", domain: "ally.com", color: "#650360" },
  { key: "amex", name: "American Express", domain: "americanexpress.com", color: "#006FCF" },
  { key: "discover", name: "Discover", domain: "discover.com", color: "#FF6000" },
  { key: "fifththird", name: "Fifth Third Bank", domain: "53.com", color: "#0F3B63" },
  { key: "citizens", name: "Citizens Bank", domain: "citizensbank.com", color: "#00843D" },
  { key: "keybank", name: "KeyBank", domain: "key.com", color: "#D71920" },
  { key: "huntington", name: "Huntington", domain: "huntington.com", color: "#5B8F22" },
  { key: "mtb", name: "M&T Bank", domain: "mtb.com", color: "#007A33" },
  { key: "regions", name: "Regions Bank", domain: "regions.com", color: "#528400" },
  { key: "navyfederal", name: "Navy Federal Credit Union", domain: "navyfederal.org", color: "#003A70" },
  { key: "usaa", name: "USAA", domain: "usaa.com", color: "#12395B" },
  { key: "sofi", name: "SoFi", domain: "sofi.com", color: "#00A2C7" },
  { key: "chime", name: "Chime", domain: "chime.com", color: "#1EC677" },
  { key: "synchrony", name: "Synchrony Bank", domain: "synchrony.com", color: "#3B5998" },
  { key: "bmo", name: "BMO", domain: "bmo.com", color: "#0079C1" },
  { key: "hsbc", name: "HSBC", domain: "us.hsbc.com", color: "#DB0011" },
  { key: "santander", name: "Santander", domain: "santanderbank.com", color: "#EC0000" },
  { key: "firstcitizens", name: "First Citizens Bank", domain: "firstcitizens.com", color: "#0057B8" },
  { key: "comerica", name: "Comerica", domain: "comerica.com", color: "#003865" },
  { key: "fidelity", name: "Fidelity", domain: "fidelity.com", color: "#4E8B2F" },
  { key: "barclays", name: "Barclays US", domain: "banking.barclaysus.com", color: "#00AEEF" },
];

export function findPopularBank(key: string | null | undefined) {
  return key ? POPULAR_BANKS.find((b) => b.key === key) : undefined;
}
