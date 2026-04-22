import provincesData from './provinces.json';
import districtsData from './districts.json';
import wardsData from './wards.json';

export const PROVINCES = provincesData;
export const DISTRICTS = districtsData.map(d => ({
  ...d,
  provinceId: d.provinceCode // Map provinceCode to provinceId for compatibility
}));
export const WARDS = wardsData.map(w => ({
  ...w,
  districtId: w.districtCode // Map districtCode to districtId for compatibility
}));
