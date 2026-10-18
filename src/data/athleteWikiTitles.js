// Wikipedia article titles for athletes whose article name differs from the
// name we store (full names, alternate spellings, single-name athletes).
// Keyed by athlete id. A value of null means "no reliable article exists" so
// the profile page skips the lookup instead of guessing a namesake.
//
// Athletes not listed here are looked up by their imageSourceUrl, then by
// their name. Every fetched article is still checked against the athlete's
// sport before it is shown (see services/wikiService.js).

const athleteWikiTitles = {
  14: null, // Riya Mookerjee: no article
  15: null, // Aditi Bhatt: no article
  29: "Laishram Sarita Devi",
  35: "Minakshi Hooda",
  36: null, // Monika: ambiguous single name
  40: "Kalaivani Srinivasan",
  49: null, // Radhika: ambiguous single name
  51: null, // Neelam: ambiguous single name
  52: "Manisha Bhanwala",
  55: "Kiran Bishnoi",
  58: "Bindyarani Devi Sorokhaibam",
  59: "Khumukcham Sanjita Chanu",
  61: null, // Rakhi Halder: no article
  67: "Kunjarani Devi",
  72: "Jyothi Surekha",
  83: null, // Ridhi: ambiguous single name
  94: "Krittwika Sinha Roy",
};

export default athleteWikiTitles;
