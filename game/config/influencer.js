// The Influencer: a rare, unwelcome ad break during ordinary stages. She is
// trying to hit a quota, and the further you get the worse it goes for her.
// Four tiers, three lines each, matched to how far through the game you are.
// The text here is what is shown on the card while the recording plays; the
// recordings are voice_influencer_tier<T>_<NN>.mp3. `art` is her painted portrait
// for that tier (she gets worse as it goes); `products` are the things she holds up.
// If an image is missing the card falls back to the emoji and skips the sticker.

export const INFLUENCER = {
  handle: '@bestie.quota',
  tiers: [
    {
      // Stages 1-4: peak confidence, quota is not a concern yet.
      art: 'assets/game/influencer_t1.png',  avatar: '💅', tag: 'SPONSORED', handle: '@bestie.quota', badge: '',
      lines: [
        "Okay so like, obsessed is not even the word — obsessed doesn't COVER what this collagen has done for my gut, my skin, my AURA, like my aura has a glow-up now, it's giving main character, it's giving expensive. Use code BESTIE for ten percent off feeling literally reborn.",
        "Okay can we talk about how Blowing Frog is like, not just a frog game? It's a BRAND, it's a LIFESTYLE, it's basically me and some investors building an EMPIRE, and if you comment 'FROG' right now I will literally, and I mean LITERALLY, consider sliding into your DMs with the deck.",
        "I'm not saying quit your job, I'm saying if you're still trading TIME for MONEY in this economy that's kind of a YOU problem. The girls who get it, get it. DM me 'QUOTA' and I'll literally change your whole life.",
      ],
      // What she holds up, one at a time, while she talks. Prices are read out by the card.
      products: [
        { img: 'assets/game/prod_collagen.png', label: 'GLOW COLLAGEN · $89' },
        { img: 'assets/game/prod_matcha.png', label: 'AURA MATCHA · $34 A CUP' },
        { img: 'assets/game/prod_crystal.png', label: 'CRYSTAL WATER · $120' },
        { img: 'assets/game/prod_guasha.png', label: 'GUA SHA (IT IS A ROCK) · $75' },
        { img: 'assets/game/prod_frogmerch.png', label: 'EMPIRE STARTER KIT · $499' },
      ],
    },
    {
      // K1-K2: cracks forming, quota mentioned for the first time.
      art: 'assets/game/influencer_t2.png',  avatar: '🤳', tag: 'SPONSORED', handle: '@bestie.quota', badge: 'LIVE',
      lines: [
        "Okay quick one — my numbers are like, SO good right now, I'm not required to say that but I'm saying it. My manager said if I don't hit quota this month there's 'restructuring,' which, fine, whatever — ANYWAY, the electrolyte powder. It's giving hydrated. It's giving crying in my car a normal amount. Use my code.",
        "If ONE more person says the market's 'saturated' — babe, I invented saturation. Buy the course. Forty percent off, which is not a flex, it's a cry for help, but you didn't hear that from me.",
        "This is embarrassing but I'm being vulnerable with you guys because that's literally my brand now — I have NOT hit quota in six weeks and my landlord called it 'a pattern.' Anyway, this appetite suppressant is SO good, I haven't eaten today, unrelated, link in bio.",
      ],
      // What she holds up, one at a time, while she talks. Prices are read out by the card.
      products: [
        { img: 'assets/game/prod_electrolyte.png', label: 'ELECTROLYTES · $6 A STICK' },
        { img: 'assets/game/prod_course.png', label: 'THE COURSE · 40% OFF' },
        { img: 'assets/game/prod_suppressant.png', label: 'APPETITE LOLLIES · $39' },
        { img: 'assets/game/prod_ringlight.png', label: 'RING LIGHT · 3 X $99' },
        { img: 'assets/game/prod_prbox.png', label: 'PR BOX · FREE*' },
      ],
    },
    {
      // K3-K4: drinking on camera now, mask slipping.
      art: 'assets/game/influencer_t3.png',  avatar: '🍷', tag: 'SPONSORED?', handle: '@bestie.quota', badge: 'LIVE',
      lines: [
        "Okaaay so — my quota, okay, my quota isn't a real number anymore, it's more of a vibe. And this wine, this is ALSO a sponsor, everything's a sponsor, I don't remember what I'm selling you. Just trust the glow. Trust the process. Trust ME. Comment 'HELP' or 'FROG,' I genuinely don't care which.",
        "The Blowing Frog deck? Oh my god, don't — don't bring up the deck. The investors 'stepped back.' It's fine. It's giving pivot. It's giving I cried in the Target parking lot for forty minutes. Is my mic even on.",
        "You ever think about how nobody NEEDS a frog to eat bombs but here we all are — no offense to the frog, the frog's doing better than me honestly. The frog has a whole ARC. I have a ring light and a payment plan. Buy the tea.",
      ],
      // What she holds up, one at a time, while she talks. Prices are read out by the card.
      products: [
        { img: 'assets/game/prod_wine.png', label: 'SPONSOR WINE · UNCLEAR' },
        { img: 'assets/game/prod_wineglass.png', label: 'THE GLASS · NOT SPONSORED' },
        { img: 'assets/game/prod_deck.png', label: 'THE DECK · AVAILABLE' },
        { img: 'assets/game/prod_tea.png', label: 'DETOX TEA · $28' },
      ],
    },
    {
      // K5: fully unraveled, barely selling anything.
      art: 'assets/game/influencer_t4.png',  avatar: '🔦', tag: 'NOT SPONSORED', handle: '@bestie.quota', badge: '',
      lines: [
        "I don't think I'm gonna hit quota this quarter. Or this life. And you know what — that's kind of freeing. NOTHING is sponsored anymore. I sold my ring light. I'm holding a flashlight. Buy something. Buy my old ring light, actually. It's forty dollars. I need forty dollars.",
        "Remember when I said Blowing Frog was gonna be a media empire? It's a frog. It was always just a frog. If any of you are hiring — not for content, an actual job, with a desk — comment 'HIRE ME.' I'm begging into a phone camera and there's no shame left. I checked.",
        "Last thing, before whatever this is — the frog's gonna eat the moon soon, I think. Honestly? Same. Eat the moon. Eat everything. Nothing is real, quota isn't real, my sponsors aren't real, I checked that too. 'MOMMY15' still works though. That part's real.",
      ],
      // What she holds up, one at a time, while she talks. Prices are read out by the card.
      products: [
        { img: 'assets/game/prod_oldring.png', label: 'RING LIGHT · $40 · PLEASE' },
        { img: 'assets/game/prod_flashlight.png', label: 'FLASHLIGHT · NOT SPONSORED' },
        { img: 'assets/game/prod_discount.png', label: 'MOMMY15 · STILL WORKS' },
        { img: 'assets/game/prod_phone.png', label: '1% BATTERY · $0' },
      ],
    },
  ],
};

const TIER_BY_STAGE = { '1': 1, '2': 1, '3': 1, '4': 1, k1: 2, k2: 2, k3: 3, k4: 3, k5: 4 };
export const tierForStage = (stageId) => TIER_BY_STAGE[String(stageId).toLowerCase()] || 1;
