// Curated matches used when the Claude API isn't configured or a call fails,
// so "Find Your Champion" always returns something real and specific.
// Athlete names match records in the athletes collection.

export const FIELDS = [
  "Engineering",
  "Medicine",
  "Arts",
  "Business",
  "Sports",
  "Science",
  "Other",
];

export const NEEDS = [
  "Courage to start",
  "Strength to continue",
  "Inspiration after failure",
  "Confidence in my identity",
  "Motivation to keep going",
];

const byNeed = {
  "Courage to start": {
    athlete: "Hima Das",
    sport: "Athletics",
    message:
      "Starting something when no one around you has done it before is its own kind of hard — you don't have a map, only a hunch that you belong. Hima Das grew up in Dhing, a small village in Assam, running on muddy fields and playing football with the boys because there was no girls' athletics team to join. She got her first pair of proper spikes only after a state coach happened to see her run. Two years later, at eighteen, she stood on a track in Tampere, Finland, and in the last eighty metres of the 400m final she went from fourth place to first — the first Indian ever to win gold at a World athletics event. On the podium she cried, because she didn't know the words of the anthem well enough to sing along. You don't need a map. You need the first eighty metres.",
    keyMoment:
      "The final eighty metres of the 2018 World U20 400m final, where she overtook three runners to win India's first-ever World athletics gold.",
  },
  "Strength to continue": {
    athlete: "Mary Kom",
    sport: "Boxing",
    message:
      "Continuing is harder than starting, because by now you know exactly what it costs. Mary Kom took up boxing in secret in Manipur and hid it from her father, who thought it would ruin her chances of marriage. She won her first World Championship in 2002. Then in 2007 she had twin sons, and a lot of people quietly wrote her off — she was a mother now, that was that. Six months after they were born she was back in the ring, and she won gold at the Asian Championships. She went on to a fourth World title in 2008, an Olympic bronze at London 2012 as the first Indian woman boxer at the Games, and a sixth World title in 2018 at the age of thirty-five. Whatever you're carrying right now, you can carry it and keep going at the same time. She did.",
    keyMoment:
      "Returning to competition six months after her twin sons were born and winning gold at the 2008 Asian Championships.",
  },
  "Inspiration after failure": {
    athlete: "Mirabai Chanu",
    sport: "Weightlifting",
    message:
      "Some failures are private. Mirabai Chanu's was on the biggest stage there is. At the Rio 2016 Olympics she failed to complete a single successful lift in the clean and jerk and was recorded as 'did not finish' — the kind of public collapse most people never have to live through. She went home, and instead of hiding she went back to the platform. In 2017 she became World Champion. At the Tokyo 2020 Olympics she won silver — India's first medal of the entire Games, won on day one. The distance between 'did not finish' and 'Olympic silver' was five years of showing up. Your setback is information, not a verdict.",
    keyMoment:
      "Her first clean and jerk attempt at Tokyo 2020 landing cleanly overhead — the lift that answered Rio.",
  },
  "Confidence in my identity": {
    athlete: "Dutee Chand",
    sport: "Athletics",
    message:
      "Being told you don't fit the category you were always in is disorienting in a way that's hard to explain to people who've never faced it. Dutee Chand, from a weaving family in Odisha, was dropped from India's 2014 Commonwealth Games team and banned because a rule decided her natural testosterone was 'too high' for women's events. She was offered a way back if she took medication to change her body. She said no, and instead challenged the rule at the Court of Arbitration for Sport — and won, forcing the regulation to be suspended. She then ran the 100m at the Rio Olympics and won two Asian Games silvers. She didn't argue her way to fitting in. She refused to accept that she didn't.",
    keyMoment:
      "Standing before the Court of Arbitration for Sport in 2015 and refusing to alter her body to be allowed to compete — and winning the case.",
  },
  "Motivation to keep going": {
    athlete: "P. V. Sindhu",
    sport: "Badminton",
    message:
      "Motivation is easy at the start and easy at the finish. The hard part is the long middle, when you've done everything right and it still hasn't worked. As a child in Hyderabad, P. V. Sindhu travelled fifty-six kilometres a day to train under Pullela Gopichand, up before dawn every morning. Then she lost final after final — Olympic, World, Asian — five of them, each one a silver medal and a headline about falling short. In 2019 she walked out for the World Championship final and won it 21–7, 21–7. She has since become the first Indian woman to win two individual Olympic medals. The middle is not a sign you're on the wrong path. Sometimes it's just the middle.",
    keyMoment:
      "After five losing finals, winning the 2019 World Championship final 21–7, 21–7 — the most one-sided result of her career.",
  },
};

const byKeyword = [
  {
    words: ["injur", "acl", "comeback", "recover", "surgery", "torn", "back from", "hurt my"],
    athlete: "Vinesh Phogat",
    sport: "Wrestling",
    message:
      "A serious injury doesn't just stop you — it makes you wonder whether the version of you that was good at this is gone. Vinesh Phogat tore her ACL mid-bout at the Rio 2016 Olympics and was carried off the mat in tears, her Games over in an instant. She rebuilt the knee over two years. In 2018 she won gold at both the Commonwealth Games and the Asian Games, becoming the first Indian woman wrestler to win Asian Games gold. The comeback wasn't a return to the old her. It was a stronger one. Rehab is training too.",
    keyMoment:
      "The Asian Games gold medal ceremony in Jakarta in 2018, almost exactly two years after being stretchered off in Rio.",
  },
  {
    words: ["belong", "don't fit", "dont fit", "impostor", "imposter", "judged", "different", "outsider", "first in my family", "first-generation", "first generation"],
    athlete: "Dutee Chand",
    sport: "Athletics",
    message:
      "Feeling like you don't belong in the room is exhausting in a way that has nothing to do with the actual work. Dutee Chand, from a weaving family in Odisha, was banned from women's athletics in 2014 because a rule decided her natural body didn't fit the category. She refused to change herself to be let back in, took the case to the Court of Arbitration for Sport, and won — then went on to run the 100m at the Rio Olympics and win two Asian Games silvers. You don't have to earn your way into belonging by becoming someone else. You already belong.",
    keyMoment:
      "Winning her case at the Court of Arbitration for Sport in 2015 without agreeing to alter her body.",
  },
  {
    words: ["quit", "give up", "giving up", "exhausted", "burnt out", "burnout", "so tired", "can't anymore", "cant anymore", "want to stop"],
    athlete: "Mary Kom",
    sport: "Boxing",
    message:
      "There's a specific tiredness that comes from having already given something everything for years. Mary Kom knows it. She boxed in secret in Manipur, won a World title in 2002, had twin sons in 2007 and was quietly written off — and then came back six months later to win Asian Championship gold, followed by three more World titles and an Olympic bronze, the last World title at thirty-five. She kept going not because it got easier but because stopping was never actually the thing she wanted. Rest if you need to. Then go again.",
    keyMoment:
      "Returning to the ring six months after her sons were born and winning gold at the 2008 Asian Championships.",
  },
  {
    words: ["failed", "fail", "rejected", "rejection", "didn't make", "didnt make", "lost", "setback", "came last", "bombed", "flopped"],
    athlete: "Mirabai Chanu",
    sport: "Weightlifting",
    message:
      "A public failure has a way of feeling permanent. Mirabai Chanu failed to complete a single lift at the Rio 2016 Olympics — recorded as 'did not finish' in front of the world. She went back to the platform anyway, became World Champion in 2017, and won silver at Tokyo 2020, India's first medal of those Games. Five years separated the worst day of her career from one of the best. Yours is not the end of the story either.",
    keyMoment:
      "Her first successful clean and jerk at Tokyo 2020 — the lift that undid Rio.",
  },
];

export function pickFallback({ struggle = "", need }) {
  const text = struggle.toLowerCase();
  for (const entry of byKeyword) {
    if (entry.words.some((w) => text.includes(w))) {
      return { ...entry, source: "fallback" };
    }
  }
  const base = byNeed[need] || byNeed["Motivation to keep going"];
  return { ...base, source: "fallback" };
}
