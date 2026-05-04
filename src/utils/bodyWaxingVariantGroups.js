export const BODY_WAXING_SERVICE_NAME = "Body Waxing";

export const BODY_WAXING_GROUP_ORDER = [
  "face",
  "upper_body",
  "legs",
  "intimate",
  "bundles",
];

export const BODY_WAXING_GROUP_META = {
  face: { title: "Face", iconKey: "face" },
  upper_body: { title: "Upper Body", iconKey: "upper_body" },
  legs: { title: "Legs", iconKey: "legs" },
  intimate: { title: "Intimate", iconKey: "intimate" },
  bundles: { title: "Bundles & Save", iconKey: "bundles" },
  other: { title: "Other", iconKey: null },
};

export const BODY_WAXING_VARIANT_TO_GROUP = {
  Eyebrows: "face",
  "Upper lip": "face",
  Chin: "face",
  "Full face": "face",

  "Underarms (hard wax)": "upper_body",
  "Half arms": "upper_body",
  "Full arms": "upper_body",

  "Half legs": "legs",
  "Full legs": "legs",

  Bikini: "intimate",
  "High bikini": "intimate",
  Brazilian: "intimate",
  Hollywood: "intimate",

  "Underarms + Bikini": "bundles",
  "Underarms + Hollywood": "bundles",
  "Half legs + Bikini": "bundles",
  "Full legs + Hollywood": "bundles",
  "Full legs + Hollywood + Underarms": "bundles",
};

export function isBodyWaxingService(service) {
  return (
    String(service?.name || "")
      .trim()
      .toLowerCase() === BODY_WAXING_SERVICE_NAME.toLowerCase()
  );
}

export function groupBodyWaxingVariants(variants = []) {
  const groups = {};

  for (const key of BODY_WAXING_GROUP_ORDER) {
    groups[key] = [];
  }
  groups.other = [];

  for (const variant of variants) {
    const key = BODY_WAXING_VARIANT_TO_GROUP[variant.name] || "other";
    groups[key].push(variant);
  }

  return [...BODY_WAXING_GROUP_ORDER, "other"]
    .map((key) => ({
      key,
      title: BODY_WAXING_GROUP_META[key].title,
      iconKey: BODY_WAXING_GROUP_META[key].iconKey,
      variants: groups[key],
    }))
    .filter((group) => group.variants.length > 0);
}
