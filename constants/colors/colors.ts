export type CancerType = 'breast' | 'colorectal' | 'ovarian' | 'myeloma' | 'lymphoma' | 'lung' | 'urothelial' | 'germcell' | 'headneck' | 'prostate' | 'pancreatic' | 'stomach' | 'bile';

const cancerTypeColorMap: Record<CancerType | string, string> = {
    breast: "#FFC0CB", 
    colorectal: "#003366",
    ovarian: "#BFD8B8",
    myeloma: "#800020",
    lymphoma: "#BFD834",
    lung: "#000000", 
    urothelial: "#FFFF00", 
    germcell: "#A020F0", 
    headneck: "#800000", 
    prostate: "#87CEEB", 
    pancreatic: "#FFDAB9", 
    stomach: "#367588", 
    bile: "#808000", 
    DEFAULT: "#734F96",
};

export const getCancerTypeColor = (cancerType?: string | null): string => {
  if (cancerType && cancerTypeColorMap[cancerType as CancerType]) {
    return cancerTypeColorMap[cancerType as CancerType];
  }
  return cancerType ? cancerTypeColorMap.Unknown : cancerTypeColorMap.DEFAULT;
};