/**
 * Password and passphrase generation.
 *
 * Randomness comes from crypto.getRandomValues - never Math.random, which is
 * seeded and predictable and must not be used for anything secret. Nothing
 * here touches the network, so the page works with the connection cut.
 */

export interface PasswordOptions {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  digits: boolean;
  symbols: boolean;
  /** Drop characters that are easy to misread: O/0, l/1/I. */
  avoidAmbiguous: boolean;
}

const SETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/",
};
const AMBIGUOUS = /[O0lI1|`']/g;

/**
 * Uniform selection over `max`.
 *
 * Taking a raw random value modulo the range biases the low end, so oversized
 * draws are rejected and retried instead.
 *
 * This draws 32 bits rather than 8 on purpose: with a single byte, any range
 * above 256 makes `floor(256 / max) * max` collapse to 0, and the rejection
 * loop then spins forever. The passphrase word list is 665 entries, so a
 * byte-sized draw hangs the tab outright.
 */
function uniformIndex(max: number): number {
  if (!Number.isInteger(max) || max < 1) {
    throw new Error("uniformIndex needs a positive integer range");
  }
  if (max === 1) return 0;
  const range = 0x1_0000_0000;
  const limit = Math.floor(range / max) * max;
  const buf = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0]! < limit) return buf[0]! % max;
  }
}

export function generatePassword(opts: PasswordOptions): string {
  let alphabet = "";
  if (opts.lowercase) alphabet += SETS.lowercase;
  if (opts.uppercase) alphabet += SETS.uppercase;
  if (opts.digits) alphabet += SETS.digits;
  if (opts.symbols) alphabet += SETS.symbols;
  if (opts.avoidAmbiguous) alphabet = alphabet.replace(AMBIGUOUS, "");
  if (!alphabet) return "";

  let out = "";
  for (let i = 0; i < opts.length; i++) out += alphabet[uniformIndex(alphabet.length)];
  return out;
}

/** Short, memorable, unambiguous word list for passphrases. */
const WORDS = `able acid aged also area army away baby back ball band bank base bath bear beat been beer bell belt bend bird blue boat body bone book boot born both bowl bulk burn bush busy cage cake call calm camp card care case cash cast cell chat chip city clay clip club coal coat code coin cold cook cool cope copy cord core corn cost crew crop dark dash data date dawn deal dean dear debt deep deer desk dial dice diet disc dish dock does dome done door dose down draw drew drop drum dual duke dust duty each earn ease east easy edge exit face fact fade fail fair fall farm fast fate fear feed feel feet fell felt file fill film find fine fire firm fish fist five flag flat flew flip flow foam fold folk font food foot ford fore fork form fort four free from fuel full fund gain game gate gave gear gene gift girl give glad glow goal goat goes gold golf gone good gray grew grid grip grow gulf hair half hall hand hang hard harm hash haul have hawk head heal heap hear heat held hell helm help herb herd here hero hide high hill hint hire hold hole holy home hook hope horn hose host hour huge hunt hurt icon idea idle inch iron item jack jade jazz join joke july jump june jury just keen keep kept kick kind king kiss kite knee knew knit knot know lace lack lady laid lake lamb lamp land lane last late lawn lead leaf leak lean leap left lend lens less lift like lime limb line link lion list live load loan lock loft logo long look loop lord lose loss loud love luck lump lung made mail main make male mall many maps mark mask mass mast mate math meal mean meat meet melt menu mesh mica mild mile milk mill mind mine mint miss mist mode mold mole monk mood moon more moss most moth move much mule name navy near neat neck need nest news next nice node none noon norm nose note noun oath obey odds once only onto open oral oval oven over pace pack page paid pain pair pale palm park part pass past path peak pear peel peer pick pier pile pine pink pipe pity plan play plot plug plus poem poet pole poll pond pool poor pope pork port pose post pour pray prep prey pull pump pure push quit quiz race rack raft rage raid rail rain rake ramp rank rare rate read real reap rear reed reef rely rent rest rice rich ride ring ripe rise risk road roam robe rock rode role roll roof room root rope rose ruby rude ruin rule rush rust safe sage said sail salt same sand sang sank save scan seal seat seed seek seem seen self sell send sent ship shoe shop shot show shut side sign silk sing sink site size skin skip slab slam slid slim slip slot slow snap snow soap soar sock soft soil sold sole solo some song soon sort soul soup sour span spin spot spun stem step stir stop stow such suit sung sunk sure surf swam swan swim tail take tale talk tall tank tape task team tear tech tell tend tent term test text than that thaw them then they thin this thus tide tidy tied tile till tilt time tiny toll tone tool torn tour town trap tray tree trim trip true tube tuck tune turn twin type unit upon urge used user vain vary vast verb very vest view vine visa void vote wade wage wait wake walk wall wand want ward warm warn wash wasp wave weak wear weed week well went were west what when whom wide wife wild will wind wine wing wipe wire wise wish with wolf wood wool word wore work worm worn wrap yard yarn year yoga yolk your zeal zero zone zoom`.split(
  /\s+/,
);

export function generatePassphrase(words = 4, separator = "-", capitalise = false): string {
  const out: string[] = [];
  for (let i = 0; i < words; i++) {
    const w = WORDS[uniformIndex(WORDS.length)]!;
    out.push(capitalise ? w[0]!.toUpperCase() + w.slice(1) : w);
  }
  return out.join(separator);
}

/**
 * Strength as bits of entropy: log2(alphabet ^ length).
 *
 * This measures the generator, which is the honest thing to report for a
 * random password - pattern-based scorers only make sense for human-chosen
 * ones, where the guess is about predictability rather than search space.
 */
export function entropyBits(alphabetSize: number, length: number): number {
  if (alphabetSize < 2 || length < 1) return 0;
  return Math.log2(alphabetSize) * length;
}

export function strengthLabel(bits: number): { label: string; tone: "weak" | "fair" | "good" | "strong" } {
  if (bits < 45) return { label: "Weak", tone: "weak" };
  if (bits < 65) return { label: "Fair", tone: "fair" };
  if (bits < 90) return { label: "Good", tone: "good" };
  return { label: "Strong", tone: "strong" };
}

export function alphabetSizeFor(opts: PasswordOptions): number {
  let a = "";
  if (opts.lowercase) a += SETS.lowercase;
  if (opts.uppercase) a += SETS.uppercase;
  if (opts.digits) a += SETS.digits;
  if (opts.symbols) a += SETS.symbols;
  if (opts.avoidAmbiguous) a = a.replace(AMBIGUOUS, "");
  return a.length;
}

export const PASSPHRASE_WORDLIST_SIZE = WORDS.length;
