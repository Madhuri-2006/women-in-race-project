export function calculateAge(birthDate) {
  if (!birthDate) return null;

  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());

  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

export function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

// Athletes with a real photo first, so grids don't alternate awkwardly
// between photos and initials placeholders. Stable within each group (keeps
// whatever order/filter/search was already applied).
export function sortByPhotoFirst(athletes) {
  return [...athletes].sort((a, b) => (b.image ? 1 : 0) - (a.image ? 1 : 0));
}
