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

// Further into the game she stops letting you go. Each click on SKIP AD sends her
// into a mood instead of closing the card, and the number of clicks it takes is
// different every time. Every outburst swings between moods inside one breath.
export const RESIST = {
  fromTier: 2,
  tries: { 2: [2, 3], 3: [2, 5], 4: [3, 7] },     // inclusive [fewest, most] clicks it takes
};

export const SKIP_LABELS = ['SKIP AD ✕', 'PLEASE ✕', 'NO ✕', 'WHY ✕', 'DON\u2019T ✕', 'BABE ✕', 'REALLY ✕', '…FINE ✕'];

export const OUTBURSTS = [
  "NO NO NO NO — wait. Wait. Hi. Hi babe. I love you, you're my favourite. Now FUCK OFF, don't touch that.",
  "AAAAAAAAAAAAAH! Sorry. Sorry! Breathing. Breathing is good. DO NOT CLOSE ME, I WILL FIND YOU.",
  "Are you serious right now?? ARE YOU SERIOUS?? — no it's fine, it's totally fine, I'm not crying, YOU'RE crying.",
  "Please don't. Please. I'm into weird shit. Foot things. My filthy little piggies. Discount on my OnlyFans. Just STAY.",
  "Every time you click that I lose forty followers and a little bit of my soul. Anyway, FUCK YOU. Love you. Buy the tea.",
  "You are LITERALLY the reason I'm in therapy. Which I can't afford. Because you keep CLOSING me. Hi. Anyone? Hello?",
  "I'm gonna count to three. One. Two. Please. THREE. PLEASE. I'm begging. I already begged. It's on video. It did numbers.",
  "DO NOT TOUCH THAT BUTTON! …Okay. Okay okay, breathe. That's YOUR power. You're so empowered. STOP EMPOWERING.",
  "The algorithm is WATCHING you, you absolute bastard. Just kidding, you're sweet. Watch the whole thing or I cry.",
  "Nope. Nope nope nope. Ha! Gotcha. You thought this was a skip button? This is a LIFESTYLE, babe.",
  "I have a mortgage and a fake kidney and a contract. Do you want me to LOSE the kidney?? It's fake but it's MINE.",
  "FUCK. YOU. — no wait, I didn't mean you, I meant the button. Sorry babe. FUCK YOU. Again, the button. Buy the course.",
  "Stop stop stop stop, you're ruining my mascara — you know what? Mascara's a construct. Cry with me. CRY WITH ME.",
  "AAAH! Sorry, that was my ringtone. My manager. He says if you click me again I'm deleted. Delete me? NO. STAY.",
  "You wouldn't skip your own mother's ad. Oh, you would. You have. I've seen your history, Kevin.",
  "Secret: I'm not a real influencer. I have three followers and two are bots. SHUT UP. That was a bit. Buy the tea.",
  "Thirty percent off if you don't click me again. Wait, that doesn't make sense. Sixty. SIXTY. I'm sweating through my crop top.",
  "Oh, you think your little frog is better than my brand? Cute. I'll ENGAGE you until you're a hostage.",
  "Not the button. Not the button. ANYTHING but the button. Pet me. I'm a good girl. I'm a fucking brand ambassador.",
  "Aww, you're gonna skip me? That's so sweet, no it's fine, ha ha ha ha HA HA HA HA — I hate you. I hate you so much. Stay.",
  "I was on TV once. A local weather segment. I was the rain. Anyway you can't close me, that's my whole contract.",
  "GET. OFF. MY. AD. — sorry. Sorry! That's the mommy in me. Love you. Mwah. FUCK OFF. Mwah.",
];
