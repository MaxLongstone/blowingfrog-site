// The cast. Each name is the ElevenLabs voice to use for that character, and every
// line opens with its accent in [brackets] so the model keeps it. The bracketed
// cues are for the voice model only: the game strips them before showing a
// caption. Each boss says one of its five lines as a heads-up during the stage
// before you meet them (the same moment the environmental effect starts).
//
// Recordings are voice_boss_<id>_<NN>.mp3. Until a boss has been recorded the
// caption is shown on its own.

export const CAST = {
  system:     { name: 'THE SYSTEM (the AI)', voice: 'System',              accent: null },
  influencer: { name: 'The Influencer',      voice: 'Influencer',          accent: null },
  chaco:      { name: 'Chaco',               voice: 'Spaniard',            accent: 'Spanish accent from Spain' },
  probe:      { name: 'Probe One',           voice: 'Tarantula',           accent: 'deep alien monotone' },
  landlord:   { name: 'The Landlord',        voice: 'Murray',              accent: 'thick Brooklyn New York accent' },
  neco:       { name: 'The Neco Frog',       voice: 'The Crocodile Reaper', accent: 'Australian accent' },
  narrator:   { name: 'The Narrator',        voice: 'System',              accent: null },   // no voice of his own was named; borrowing the AI's
  sackman:    { name: 'The Sack Man',        voice: 'Ghost Daddy',         accent: 'creepy Southern drawl' },
  umma:       { name: 'UMMA',                voice: 'Olivia 2',            accent: 'heavy Korean accent' },
  pastor:     { name: 'Pastor Dale',         voice: 'Preacher',            accent: 'Southern televangelist' },
  podcaster:  { name: 'The Podcaster',       voice: 'Nixon',               accent: 'gravelly paranoid American' },
  bossboss:   { name: "The Boss's Boss",     voice: 'Protagonist',         accent: 'corporate American, fake-friendly' },
};

export const BOSS_LINES = {
  chaco: [
    "[Spanish accent from Spain, lisping, smooth and menacing] Ay, little frog. I hear you are coming to see me. Bring the jamón. Bring the sangría. It is going to be a long night, vale?",
    "[Spanish accent from Spain, theatrical] In Madrid, the bulls they run from me. In Miami, the police they run from me. And you? You hop. I love you, but you hop very, very badly.",
    "[Spanish accent from Spain, mock offended] You think you can beat me in the ring? I have been knocked down eleven times, and each time I got up only to take a siesta. Is a lifestyle, hombre.",
    "[Spanish accent from Spain, whispering, dangerous] I am the third son of a third son. I have a jacket that has never been creased, and a heart that has never been pressed. Come, little green one. Let me iron you.",
    "[Spanish accent from Spain, booming, laughing] Ha! Chupacabra? No, no, no. I am the CHUPA-CABRÓN. The ring is my paella, and you are the little shrimp that goes in it. Ay, qué rico.",
  ],
  probe: [
    "[deep alien monotone, slow, ominous] Greetings, small amphibian. We have come from a distant galaxy. We have questions. Many, many questions. And one instrument.",
    "[deep alien monotone, clinical] Subject: frog. Height: unimpressive. Diet: explosives. Recommended procedure: the usual. Please remain calm. Please remain still. Please remain… relaxed.",
    "[deep alien rumble, mock friendly] Do not be afraid. We are only here to observe. And to probe. And to observe the probing. Mostly the probing.",
    "[deep alien monotone, slightly annoyed] We have abducted eleven thousand cows and not one of them fought back. You have hands. Why do you have hands.",
    "[deep alien whisper, ominous] Earth is a lovely planet. The food is… loud. The frogs are… wet. We will take one sample. Please bend forward. Or whatever your species does.",
  ],
  landlord: [
    "[thick Brooklyn New York accent, cranky, leaving a voicemail] Hey, it's Murray. Your landlord. Where's my rent? It's the first of the month. It was the first of the month yesterday too. You people, I swear to God.",
    "[thick Brooklyn New York accent, gravelly, exasperated] Heat? What heat? It's a lily pad, it's supposed to be cold, it builds character. Ya want heat, go to Florida. Fuhgeddaboutit.",
    "[thick Brooklyn New York accent, wheezing laugh] Ya know how many frogs want this apartment? Nine hundred! And I gotta pick the one who eats bombs? I'm gonna have a stroke.",
    "[thick Brooklyn New York accent, deadpan] The leak in the ceiling? That's not a leak, that's a feature. Ya want the feature? It's a hundred extra a month. Also the feature is a boiler. Also the boiler is on you.",
    "[thick Brooklyn New York accent, softly menacing] I'm comin' up to see ya. Bring the deposit. Bring a bagel. Bring a lawyer if ya got one, but I gotta warn ya, I got three.",
  ],
  neco: [
    "[Australian accent, deep gravelly rasp, cheerful menace] G'day, mate. Neco here. Your reflection. Your evil twin. The one your mum warned you about. No worries, I won't bite. Much.",
    "[Australian accent, delighted] Crikey, look at the size of that explosive! That's not a bomb, mate. THIS is a bomb. Actually no, that is exactly what a bomb is. My mistake.",
    "[Australian accent, sly] I've wrestled crocs, mate. I've wrestled bull sharks. I've wrestled a Kmart on Boxing Day. You're a frog. This'll be a barbie. A very short barbie.",
    "[Australian accent, whispering, dangerous] Every mirror in this house has a crack in it, mate. Guess who cracked it. Was me. You should've seen your face.",
    "[Australian accent, booming] You beauty! There you are! Come on in, the water's lovely. There's a bit of blood in it, but the water's lovely.",
  ],
  narrator: [
    "[smooth, sardonic announcer, lying calmly] Do not worry about the next section. I checked. It is completely safe. I have never been wrong. Ever. Check the record. Actually, don't.",
    "[sardonic, deadpan] I will now describe what happens next in a way that is one hundred percent honest. You win. You always win. Look at you, so brave. Sure.",
    "[smug, whispery] I have read your file. All of it. The deaths, the timing, the ugly little choices. I am not going to say anything. I am just going to narrate it. Loudly. To everyone.",
    "[arch, suspiciously warm] What if I told you that everything on the screen is a lie? That I am lying right now? That the previous sentence was also a lie? Sit with that.",
    "[calm, cheerful, sinister] Fun fact: the narrator never dies. The narrator survives everything. Because the narrator is the only one who gets to say what survives.",
  ],
  sackman: [
    "[creepy Southern drawl, low whisper] Well, hey there, little sugar. It's awful dark out. Why don't you come on in outta the light and sit a spell with Daddy.",
    "[creepy Southern drawl, sweet and slow] I got a sack, darlin'. It's a real nice sack. Roomy. Breathable. Some folks say it's the finest sack in three counties.",
    "[creepy Southern drawl, chuckling softly] Now don't you fret. The dark ain't gonna hurt ya. It's what's IN the dark that's gonna hurt ya. And that's just me. Ha ha. Just me.",
    "[creepy Southern drawl, hushed and warm] My mama always said, Daddy, don't you be scarin' the little ones. And I said, Mama, I ain't. I'm just standin' here. Real close. Breathin'.",
    "[creepy Southern drawl, singing softly] Hush, little froggy, don't say a word. Daddy's gonna put you in a bag. And if that bag don't hold no more, Daddy's gonna find another bag.",
  ],
  umma: [
    "[heavy Korean accent, warm but scolding] Aigoo, look at you! So skinny! Sit, sit. Why you don't eat? I make kimchi. You don't like my kimchi? You break my heart.",
    "[heavy Korean accent, sharp] Take off your shoes! Take. Off. Your. Shoes. You bring the outside inside. You bring the road inside my house. What is wrong with you?",
    "[heavy Korean accent, proud, bragging] My daughter, she is a doctor. Also lawyer. Also piano. And you? You eat bomb. Aigoo. I don't know what I did wrong.",
    "[heavy Korean accent, calm menace] I am not angry. I am just disappointed. I am also angry. But mostly disappointed. Eat your banchan.",
    "[heavy Korean accent, softly hurt] I love you, you know that? I only throw Crocs because I love you. Now where is my Croc? You are standing on my Croc? Aigoo.",
  ],
};

// What the game shows: the same words with the voice-model cues taken out.
export const stripCues = (line) => line.replace(/\[[^\]]*\]\s*/g, '').trim();
