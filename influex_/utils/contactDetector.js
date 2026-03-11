export const detectContactInfo = (message) => {

  const text = message.toLowerCase()

  const patterns = [

    // normal phone number
    /\b\d{10}\b/,

    // spaced phone number (98765 43210)
    /\b\d{5}\s?\d{5}\b/,

    // numbers separated (9 8 7 6 5 4 3 2 1 0)
    /(\d\s){5,}/,

    // email detection
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,

    // instagram username
    /@[a-z0-9._]{3,}/,

    // whatsapp mention
    /whatsapp/,

    // contact words
    /contact/,
    /call me/,
    /text me/,
    /my number/,
    /phone number/,

    // social media mentions
    /instagram/,
    /insta/,
    /dm me/,
    /telegram/,
    /snapchat/,


  ]

  return patterns.some(pattern => pattern.test(text))

}