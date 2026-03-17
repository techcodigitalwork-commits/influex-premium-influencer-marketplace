export const detectContactInfo = (message) => {

  const text = message.toLowerCase().trim()

  // remove emojis like 9️⃣
  const cleanText = text.replace(/[0-9]\uFE0F?\u20E3/g, d => d[0])

  const numberWordMap = {
    zero:"0", one:"1", two:"2", three:"3", four:"4",
    five:"5", six:"6", seven:"7", eight:"8", nine:"9"
  }

  // split by spaces or hyphen
  const words = cleanText.split(/[\s-]/)

  let convertedNumbers = ""

  for(const word of words){
    if(numberWordMap[word] !== undefined){
      convertedNumbers += numberWordMap[word]
    }
  }

  const patterns = [

    // normal phone
    /\b\d{10}\b/,

    // spaced number
    /\b\d{5}\s?\d{5}\b/,

    // digits separated
    /(\d\s){5,}\d/,

    // mixed digits + letters
    /\d+[a-z]+\d+/,

    // email
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,

    // links
    /(https?:\/\/[^\s]+)/,

    // social handle
    /@[a-z0-9._]{3,}/,

    // social platforms
    /whatsapp/,
    /telegram/,
    /instagram/,
    /insta/,
    /snapchat/,

    // contact intent
    /contact/,
    /call me/,
    /text me/,
    /my number/,
    /phone number/,
    /dm me/,

    // disguised insta
    /insta\s*id/,
    /ig\s*id/,
    /my\s*ig/,
  ]

  if(patterns.some(p => p.test(cleanText))){
    return true
  }

  // detect number words
  if(convertedNumbers.length >= 8){
    return true
  }

  return false
}