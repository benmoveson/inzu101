export const properties = [];

export const propertyTypes = ["All", "House", "Apartment", "Villa", "Townhouse", "Cabin", "Estate"];

export const priceRanges = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under $500k", min: 0, max: 500000 },
  { label: "$500k - $1M", min: 500000, max: 1000000 },
  { label: "$1M - $2M", min: 1000000, max: 2000000 },
  { label: "$2M - $5M", min: 2000000, max: 5000000 },
  { label: "Over $5M", min: 5000000, max: Infinity }
];

export const bedroomOptions = ["Any", "1+", "2+", "3+", "4+", "5+"];
