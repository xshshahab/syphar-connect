export const formatExperience = (years?: number) =>
  years == null
    ? ""
    : years === 0
    ? "Fresher"
    : `${years} ${years === 1 ? "yr" : "yrs"}`;
