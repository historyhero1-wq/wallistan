// Fake reviews database — 100+ reviews across categories
// These change randomly on every page load using product slug as seed

export interface FakeReview {
  author: string;
  city: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
}

const NAMES = [
  "Ahmad Raza", "Fatima Malik", "Usman Khan", "Ayesha Siddiqui", "Bilal Hassan",
  "Sana Tariq", "Imran Butt", "Nadia Chaudhry", "Zubair Sheikh", "Hira Baig",
  "Omer Farooq", "Mehreen Iqbal", "Asad Mehmood", "Rabia Zafar", "Faisal Javed",
  "Amna Qureshi", "Kamran Ali", "Sadia Rehman", "Hamza Nawaz", "Rida Khan",
  "Waseem Ahmad", "Kiran Aslam", "Tariq Mahmood", "Safia Hussain", "Danish Mirza",
  "Shazia Ansari", "Adnan Maqsood", "Lubna Zahid", "Ahsan Rauf", "Samina Bajwa",
  "Naveed Anwar", "Bushra Latif", "Shoaib Akram", "Nasreen Parveen", "Junaid Haider",
  "Fouzia Riaz", "Saeed Ahmed", "Zara Saeed", "Mohsin Bhatti", "Irum Saleem",
  "Khalid Pervaiz", "Huma Rashid", "Aamir Gillani", "Sobia Waheed", "Tahir Nadeem",
  "Amira Gul", "Shakeel Mughal", "Rania Shahid", "Naeem Baig", "Erum Qazi",
];

const CITIES = [
  "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Multan", "Faisalabad",
  "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Hyderabad", "Bahawalpur",
  "Sukkur", "Abbottabad", "Mardan", "Sargodha", "Sheikhupura", "Jhang",
  "Rahim Yar Khan", "Gujrat", "Kasur", "Okara", "Sahiwal", "Chiniot", "Attock",
];

const DATES = [
  "3 days ago", "1 week ago", "2 weeks ago", "3 weeks ago", "1 month ago",
  "6 weeks ago", "2 months ago", "10 weeks ago", "3 months ago", "4 months ago",
];

// ── Category-specific review texts ───────────────────────────────────────────
const CATEGORY_REVIEWS: Record<string, string[]> = {
  "neon-signs": [
    "Bilkul waisi bani jaise picture mein thi. Raat ko bohot khoobsurat lagti hai!",
    "Quality zabardast hai. Glow bohot bright aur even hai. Highly recommend!",
    "Packaging bhi acha tha aur delivery time pe aayi. Dil khush ho gaya!",
    "Mere restaurant ki wall par laga hai. Customers bahut tarif karte hain!",
    "Custom neon sign bilkul exactly banaya jo maine design diya tha. Amazing work!",
    "Colours bohot vibrant hain. Raat ko pure room ko roshni deta hai. Love it!",
    "Pehle ek aur company se try kiya tha, woh flop. Yeh sab se best hai.",
    "3 saal ho gaye laga hua hai, abhi bhi bilkul naya lagta hai. Great quality!",
    "Delivery bohot fast thi. Sirf 5 din mein ghar aa gayi. Bohot khush hoon!",
    "Cafe ki decoration ke liye order ki thi. Bohot sari photos Instagram par viral!",
    "Switch on karte hi poora kamra chamak jaata hai. Maa bohot khush hui!",
    "Wedding mein lagai thi, sab ne poochha kahan se li. Wallistan zindabad!",
    "Price thora zyada laga shuru mein, lekin quality dekh ke bilkul worth it hai!",
    "Mera custom neon logo bana diya. Business ki image 10 guna behtar ho gayi!",
    "Bohot solid construction hai. Gayi nahi hai aur na hi koi masla aaya.",
    "LED neon is so much better than glass. Safe, cool, and perfect brightness.",
    "Ordered for my studio, everyone thinks it's from Dubai. So premium looking!",
    "Dimmer lagay diya saath mein, aur bhi zyada maza aata hai. Great add-on!",
  ],
  "acrylic-signs": [
    "Acrylic ka finish bohot smooth aur professional hai. Office mein laga diya.",
    "Logo wala sign bilkul waisay bana jaisay logo tha. Perfect accuracy!",
    "Colors bohot crisp hain. Far se bhi saaf saaf nazar aata hai.",
    "Mere clinic ki reception par lagaya. Clients impress hote hain.",
    "3D effect bohot shandar lagta hai. Literally uthti hui dikhti hai design.",
    "Ek dam premium quality. Bilkul kisi Dubai ya UAE wali shop jesi lagti hai!",
    "Lightweight hai lekin bohot strong. 2 saal se wall par hai, ek baar bhi nahi hila.",
    "Custom shape mein bana diya. Bilkul meri marzi ka aaya. Very happy!",
    "Background lighting ke saath aur bhi zyada gorgeous lagta hai.",
    "School ke liye order kiya tha. Principal ne bohot tarif ki installation par.",
    "Online se dekhke laga tha itna acha nahi hoga, lekin actual mein bohot better nikla!",
    "Black acrylic with gold letters — bilkul royal lagta hai. Highly recommend!",
    "Fast service aur packing bhi zabardast thi. Koi damage nahi tha.",
    "Multiple offices ke liye order karta hoon. Har baar quality consistent rehti hai.",
    "Very clean cuts, no rough edges at all. Professional grade product!",
    "Our boutique sign turned out exactly as I wanted. Customers love it!",
  ],
  "shop-signs": [
    "Dukan ki shaan badh gayi is sign se. Customers door se hi dekh lete hain!",
    "Dukaan par sign laga ke sales badh gayi. Seriously! More foot traffic now.",
    "Raat ko illuminated lagta hai, din ko bhi zabardast. Double whammy!",
    "IP65 rated hai, barish mein bhi koi masla nahi aaya. Solid outdoor quality.",
    "Customization options bohot zyada hain. Exactly jo chahiye woh mil gaya.",
    "3 mahine pehle lagaya, ek bhi problem nahi. Weather-proof properly.",
    "Font aur colors bilkul match kiye mere brand ke saath. Professional service!",
    "Installation ke time team bhi helpful thi guidance mein. Great experience!",
    "Mall ke andar mere stall ka sign sabse acha lagta hai. Alag hi dikha!",
    "Meri bakery ke liye order kiya tha. Har baar aacha hi aata hai Wallistan se.",
    "LED option ne energy bill bhi save kar di. Bright bhi hai aur efficient bhi.",
    "Made exactly to my dimensions. Fits perfectly in the allocated space.",
    "5 saal ki warranty di hai. Mind at peace raha. Very trustworthy brand!",
    "Mere competitor ne poochha kahan se banwaya. That's the best compliment!",
    "Old sign se compare karein toh yeh 10 times better hai. No comparison!",
    "Shop alag hi dikhi ab. Bohot saari inquiries shop ke baare mein aane lagi hain.",
  ],
  "home-decor": [
    "Drawing room bilkul transform ho gaya is ek piece se. Koi believe nahi karta yeh Multan se aaya!",
    "Shadi ka tohfa diya tha ghar waalon ko. Unhe bohot pasand aaya. Bari tarif hui!",
    "3D wall art ka koi muqabla nahi. Guests hamesha compliment karte hain.",
    "Quality material, nahi toot-phoota bhi nahi aur nahi fade hua color.",
    "Master bedroom ki wall par laga ke poora look change ho gaya. Love it!",
    "Interior designer ne suggest kiya tha. Wakai ek dum unique aur premium piece hai.",
    "Kids room ke liye order kiya tha. Unhe bohot zyada pasand aaya!",
    "Office lobby mein laga diya. Clients ko pehla impression hi wow waala milta hai.",
    "Ek gift set order kiya tha. Giftee ne kaha sab se acha gift mila!",
    "Ye decor piece bana ke bheja tha bilkul waisay jaisay maine description diya tha.",
    "Color accuracy bohot acha hai. Photos se bhi better lagti hai actual mein.",
    "Delivery ke time packaging itni achi thi ke kuch bhi damage nahi hua.",
    "Friends ne Instagram post dekhi toh 5 log already inquire kar chuke hain.",
    "Apne ghar ki theme ke saath perfectly match kiya. Happy with selection!",
    "Hum ne apne naye ghar ke liye purchase kiya. Perfect housewarming gift!",
    "Texture aur finish bilkul real wood jaisa lagta hai. Amazing craftsmanship!",
    "Ye piece meri wall ka star ban gaya hai. Sab ki nazar is par jaati hai!",
    "Bohot halkaa hai lekin solid. Asaani se install ho gaya. Very user friendly.",
  ],
};

// Generic fallback reviews (if category not matched)
const GENERIC_REVIEWS: string[] = [
  "Bohot achi quality hai. Bilkul waisay aaya jaisay picture mein tha.",
  "Delivery time par aayi. Packaging bhi zabardast thi. Very impressed!",
  "Price ke hisaab se quality kaafi achi hai. Definitely value for money.",
  "Customer service bohot responsive thi. Mere questions ka foran jawab aaya.",
  "Pehli baar order kiya tha, second order bhi aa gayi. Bilkul satisfied!",
  "Quality check dekh ke laga yeh log serious hain. Acha experience raha.",
  "Received exactly what was shown. No surprises — in the best way!",
  "Friends ko recommend kar diya. Ek ne order bhi kar li pehle hi din!",
  "Material bohot acha hai. Lamba chalega yeh piece. Worth every rupee.",
  "Instagram par dekha tha. Real mein aur bhi zyada achi lagti hai!",
  "Excellent craftsmanship. Yeh log clearly apne kaam se pyaar karte hain.",
  "5 star deta hoon bina soche samjhe. Sab kuch perfect tha.",
  "Mere birthday par gift di kissi ne. Bohot khush tha main!",
  "Office decoration ke liye liya tha. Team ne bohot compliment kiya!",
  "Ghar ki shaan ban gayi yeh cheez. Har koi poochta hai kahan se li.",
  "Delivery fast thi, quality top notch. Will definitely order again!",
  "Product matches description 100%. Very honest and accurate listing.",
  "Loved the attention to detail. You can tell it's handcrafted with care.",
  "Amazing product at an amazing price. Cannot find this quality elsewhere.",
  "The colors are so vibrant in person. Way better than the photos show!",
  "Ordered as a wedding gift. The couple absolutely loved it!",
  "Packaging was so secure, product arrived in perfect condition.",
  "The finish is incredibly smooth. Looks very expensive and luxurious.",
  "Just what I was looking for! Fits perfectly with my home aesthetic.",
  "Wallistan never disappoints. Third purchase, third win!",
];

// Seeded pseudo-random number generator (so reviews are consistent per product but feel random)
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function strToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateFakeReviews(
  productSlug: string,
  categorySlug: string,
  count = 24,
): FakeReview[] {
  // Use a mix of productSlug + categorySlug so it feels like it changes per product
  // Removing Date.now() to prevent React hydration mismatch between SSR and client
  const rand = seededRandom(strToSeed(productSlug + categorySlug));

  const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

  // Choose category pool or generic
  const catKey = Object.keys(CATEGORY_REVIEWS).find((k) =>
    categorySlug.includes(k.split("-")[0]),
  );
  const catPool = catKey ? CATEGORY_REVIEWS[catKey] : [];
  const pool = [...catPool, ...GENERIC_REVIEWS];

  // Shuffle pool
  const shuffled = [...pool].sort(() => rand() - 0.5);

  const reviews: FakeReview[] = [];
  for (let i = 0; i < count; i++) {
    const text = shuffled[i % shuffled.length];
    const ratingRoll = rand();
    const rating = ratingRoll < 0.6 ? 5 : ratingRoll < 0.9 ? 4 : 3;
    reviews.push({
      author: pick(NAMES),
      city: pick(CITIES),
      rating,
      text,
      date: pick(DATES),
      verified: rand() > 0.1,
    });
  }
  return reviews;
}
