// The Influencer: a rare, unwelcome ad break during ordinary stages. She is
// trying to hit a quota, and the further you get the worse it goes for her.
// Four tiers, three lines each, matched to how far through the game you are.
// The text here is what is shown on the card while the recording plays; the
// recordings are voice_influencer_tier<T>_<NN>.mp3. `art` is an optional painted
// portrait for the avatar circle (e.g. 'assets/game/influencer_t1.png'); until one
// exists the emoji is used, and nothing is requested.

export const INFLUENCER = {
  handle: '@bestie.quota',
  tiers: [
    {
      // Stages 1-4: peak confidence, quota is not a concern yet.
      art: null,       avatar: '💅', tag: 'SPONSORED', handle: '@bestie.quota', badge: '',
      lines: [
        "Okay so like, obsessed is not even the word — obsessed doesn't COVER what this collagen has done for my gut, my skin, my AURA, like my aura has a glow-up now, it's giving main character, it's giving expensive. Use code BESTIE for ten percent off feeling literally reborn.",
        "Okay can we talk about how Blowing Frog is like, not just a frog game? It's a BRAND, it's a LIFESTYLE, it's basically me and some investors building an EMPIRE, and if you comment 'FROG' right now I will literally, and I mean LITERALLY, consider sliding into your DMs with the deck.",
        "I'm not saying quit your job, I'm saying if you're still trading TIME for MONEY in this economy that's kind of a YOU problem. The girls who get it, get it. DM me 'QUOTA' and I'll literally change your whole life.",
      ],
    },
    {
      // K1-K2: cracks forming, quota mentioned for the first time.
      art: null,       avatar: '🤳', tag: 'SPONSORED', handle: '@bestie.quota', badge: 'LIVE',
      lines: [
        "Okay quick one — my numbers are like, SO good right now, I'm not required to say that but I'm saying it. My manager said if I don't hit quota this month there's 'restructuring,' which, fine, whatever — ANYWAY, the electrolyte powder. It's giving hydrated. It's giving crying in my car a normal amount. Use my code.",
        "If ONE more person says the market's 'saturated' — babe, I invented saturation. Buy the course. Forty percent off, which is not a flex, it's a cry for help, but you didn't hear that from me.",
        "This is embarrassing but I'm being vulnerable with you guys because that's literally my brand now — I have NOT hit quota in six weeks and my landlord called it 'a pattern.' Anyway, this appetite suppressant is SO good, I haven't eaten today, unrelated, link in bio.",
      ],
    },
    {
      // K3-K4: drinking on camera now, mask slipping.
      art: null,       avatar: '🍷', tag: 'SPONSORED?', handle: '@bestie.quota', badge: 'LIVE',
      lines: [
        "Okaaay so — my quota, okay, my quota isn't a real number anymore, it's more of a vibe. And this wine, this is ALSO a sponsor, everything's a sponsor, I don't remember what I'm selling you. Just trust the glow. Trust the process. Trust ME. Comment 'HELP' or 'FROG,' I genuinely don't care which.",
        "The Blowing Frog deck? Oh my god, don't — don't bring up the deck. The investors 'stepped back.' It's fine. It's giving pivot. It's giving I cried in the Target parking lot for forty minutes. Is my mic even on.",
        "You ever think about how nobody NEEDS a frog to eat bombs but here we all are — no offense to the frog, the frog's doing better than me honestly. The frog has a whole ARC. I have a ring light and a payment plan. Buy the tea.",
      ],
    },
    {
      // K5: fully unraveled, barely selling anything.
      art: null,       avatar: '🔦', tag: 'NOT SPONSORED', handle: '@bestie.quota', badge: '',
      lines: [
        "I don't think I'm gonna hit quota this quarter. Or this life. And you know what — that's kind of freeing. NOTHING is sponsored anymore. I sold my ring light. I'm holding a flashlight. Buy something. Buy my old ring light, actually. It's forty dollars. I need forty dollars.",
        "Remember when I said Blowing Frog was gonna be a media empire? It's a frog. It was always just a frog. If any of you are hiring — not for content, an actual job, with a desk — comment 'HIRE ME.' I'm begging into a phone camera and there's no shame left. I checked.",
        "Last thing, before whatever this is — the frog's gonna eat the moon soon, I think. Honestly? Same. Eat the moon. Eat everything. Nothing is real, quota isn't real, my sponsors aren't real, I checked that too. 'MOMMY15' still works though. That part's real.",
      ],
    },
  ],
};

const TIER_BY_STAGE = { '1': 1, '2': 1, '3': 1, '4': 1, k1: 2, k2: 2, k3: 3, k4: 3, k5: 4 };
export const tierForStage = (stageId) => TIER_BY_STAGE[String(stageId).toLowerCase()] || 1;
