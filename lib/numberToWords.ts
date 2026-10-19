/**
 * Spells out numbers in English, e.g. for speech recognition transcripts
 * where the recognizer writes "3" or "21st" instead of "three" or
 * "twenty-first".
 *
 * Works on digit strings rather than JavaScript numbers, so arbitrarily
 * long integers stay exact. To support larger numbers, add more names to
 * `scaleWords`; anything beyond the table is read digit by digit.
 */

const onesWords = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];

const tensWords = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

// One entry per group of three digits (short scale).
const scaleWords = [
  "",
  "thousand",
  "million",
  "billion",
  "trillion",
  "quadrillion",
  "quintillion",
  "sextillion",
  "septillion",
  "octillion",
  "nonillion",
  "decillion",
];

const ordinalExceptions: Record<string, string> = {
  one: "first",
  two: "second",
  three: "third",
  five: "fifth",
  eight: "eighth",
  nine: "ninth",
  twelve: "twelfth",
};

function spellBelowThousand(value: number) {
  const words: string[] = [];
  const hundreds = Math.floor(value / 100);
  const rest = value % 100;

  if (hundreds > 0) {
    words.push(onesWords[hundreds], "hundred");
  }

  if (rest >= 20) {
    const ones = rest % 10;

    words.push(
      ones > 0
        ? `${tensWords[Math.floor(rest / 10)]}-${onesWords[ones]}`
        : tensWords[Math.floor(rest / 10)],
    );
  } else if (rest > 0) {
    words.push(onesWords[rest]);
  }

  return words.join(" ");
}

function spellDigitByDigit(digits: string) {
  return [...digits].map((digit) => onesWords[Number(digit)]).join(" ");
}

/** "1234" -> "one thousand two hundred thirty-four". */
export function integerToWords(digits: string) {
  const trimmed = digits.replace(/^0+(?=\d)/, "");

  if (!/^\d+$/.test(trimmed)) {
    throw new Error(`Not a non-negative integer: "${digits}"`);
  }

  if (trimmed === "0") {
    return onesWords[0];
  }

  const groupCount = Math.ceil(trimmed.length / 3);

  if (groupCount > scaleWords.length) {
    return spellDigitByDigit(trimmed);
  }

  const padded = trimmed.padStart(groupCount * 3, "0");
  const words: string[] = [];

  for (let group = 0; group < groupCount; group += 1) {
    const value = Number(padded.slice(group * 3, group * 3 + 3));

    if (value === 0) {
      continue;
    }

    const scale = scaleWords[groupCount - group - 1];

    words.push(spellBelowThousand(value));

    if (scale) {
      words.push(scale);
    }
  }

  return words.join(" ");
}

/** "twenty-one" -> "twenty-first", "one hundred" -> "one hundredth". */
export function toOrdinalWords(cardinal: string) {
  return cardinal.replace(/[a-z]+$/, (lastWord) => {
    if (ordinalExceptions[lastWord]) {
      return ordinalExceptions[lastWord];
    }

    if (lastWord.endsWith("y")) {
      return `${lastWord.slice(0, -1)}ieth`;
    }

    return `${lastWord}th`;
  });
}

/**
 * Spells out a single numeric token: integers ("1,000"), decimals ("3.5",
 * ".5"), negatives ("-4"), ordinals ("21st") and percentages ("50%").
 */
export function numberToWords(token: string) {
  const match = /^([-+]?)(\d[\d,]*)?(?:\.(\d+))?(st|nd|rd|th)?(%)?$/i.exec(
    token.trim(),
  );

  if (!match || (!match[2] && !match[3])) {
    throw new Error(`Not a number: "${token}"`);
  }

  const [, sign, integerPart, fractionPart, ordinalSuffix, percent] = match;
  // ".5" is read as "point five", without a leading "zero".
  let words = integerPart ? integerToWords(integerPart.replace(/,/g, "")) : "";

  if (fractionPart) {
    words = `${words} point ${spellDigitByDigit(fractionPart)}`.trim();
  } else if (ordinalSuffix) {
    words = toOrdinalWords(words);
  }

  if (sign === "-") {
    words = `minus ${words}`;
  }

  if (percent) {
    words += " percent";
  }

  return words;
}

// Thousands separators only count when they split proper groups of three
// ("1,000" but not "1,2"), so lists like "1,2,3" stay separate numbers.
const numberPattern =
  /(?<![\w.])-?(?:\d{1,3}(?:,\d{3})+|\d+)?(?:\.\d+)?(?:st|nd|rd|th)?%?(?![\w])/gi;

/** Replaces every number in free text with its spelled-out form. */
export function spellOutNumbers(text: string) {
  return text.replace(numberPattern, (token) =>
    /\d/.test(token) ? numberToWords(token) : token,
  );
}
