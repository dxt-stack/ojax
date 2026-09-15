// OjaX Mock Data - Production-grade demo dataset for finished product
// Realistic Nigerian campus marketplace data

export const UNIVERSITIES = [
  { code: "UNILAG", name: "University of Lagos", city: "Lagos", state: "Lagos" },
  { code: "UI", name: "University of Ibadan", city: "Ibadan", state: "Oyo" },
  { code: "OAU", name: "Obafemi Awolowo University", city: "Ile-Ife", state: "Osun" },
  { code: "UNN", name: "University of Nigeria, Nsukka", city: "Nsukka", state: "Enugu" },
  { code: "ABU", name: "Ahmadu Bello University", city: "Zaria", state: "Kaduna" },
  { code: "LASU", name: "Lagos State University", city: "Ojo", state: "Lagos" },
  { code: "CU", name: "Covenant University", city: "Ota", state: "Ogun" },
  { code: "UNIBEN", name: "University of Benin", city: "Benin City", state: "Edo" },
];

export const CATEGORIES = [
  { code: "electronics", label: "Electronics", icon: "tv", color: "#ed6a3a", sub: [
    { code: "phones", label: "Phones & Tablets" },
    { code: "laptops", label: "Laptops" },
    { code: "accessories", label: "Accessories" },
    { code: "audio", label: "Audio & Headphones" },
    { code: "gaming", label: "Gaming" },
  ]},
  { code: "phones", label: "Phones & Tablets", icon: "smartphone", color: "#3659d8", sub: [
    { code: "iphones", label: "iPhones" },
    { code: "android", label: "Android Phones" },
    { code: "tablets", label: "Tablets & iPads" },
    { code: "phone-accessories", label: "Phone Accessories" },
  ]},
  { code: "computing", label: "Computing", icon: "laptop", color: "#398d70", sub: [
    { code: "laptops", label: "Laptops" },
    { code: "desktops", label: "Desktops" },
    { code: "printers", label: "Printers & Scanners" },
    { code: "storage", label: "Storage Devices" },
  ]},
  { code: "fashion", label: "Fashion", icon: "shirt", color: "#be4c70", sub: [
    { code: "mens", label: "Men's Fashion" },
    { code: "womens", label: "Women's Fashion" },
    { code: "shoes", label: "Shoes & Sneakers" },
    { code: "bags", label: "Bags & Wallets" },
  ]},
  { code: "textbooks", label: "Textbooks", icon: "book", color: "#b17a24", sub: [
    { code: "science", label: "Science & Engineering" },
    { code: "arts", label: "Arts & Humanities" },
    { code: "medical", label: "Medical & Health" },
    { code: "past-questions", label: "Past Questions" },
  ]},
  { code: "home", label: "Home & Furniture", icon: "sofa", color: "#7956c6", sub: [
    { code: "furniture", label: "Furniture" },
    { code: "kitchen", label: "Kitchen & Dining" },
    { code: "decor", label: "Home Decor" },
    { code: "bedding", label: "Bedding" },
  ]},
  { code: "sports", label: "Sports", icon: "dumbbell", color: "#2d8a6e", sub: [
    { code: "gym", label: "Gym & Fitness" },
    { code: "football", label: "Football" },
    { code: "outdoor", label: "Outdoor Sports" },
  ]},
  { code: "beauty", label: "Beauty & Health", icon: "sparkles", color: "#d946a0", sub: [
    { code: "skincare", label: "Skincare" },
    { code: "makeup", label: "Makeup" },
    { code: "hair", label: "Hair & Styling" },
  ]},
  { code: "services", label: "Services", icon: "briefcase", color: "#6366f1", sub: [
    { code: "tutoring", label: "Tutoring" },
    { code: "design", label: "Design & Creative" },
    { code: "tech", label: "Tech Services" },
    { code: "logistics", label: "Logistics" },
  ]},
  { code: "food", label: "Food & Groceries", icon: "food", color: "#f59e0b", sub: [
    { code: "snacks", label: "Snacks" },
    { code: "drinks", label: "Drinks" },
    { code: "groceries", label: "Groceries" },
  ]},
  { code: "other", label: "Everything Else", icon: "grid", color: "#65717e", sub: [] },
];

export const CONDITIONS = [
  { code: "new", label: "Brand New", hint: "Sealed, unused" },
  { code: "like-new", label: "Like New", hint: "Barely used, no flaws" },
  { code: "used-good", label: "Used - Good", hint: "Minor signs of use" },
  { code: "used-fair", label: "Used - Fair", hint: "Visible wear but works" },
  { code: "refurbished", label: "Refurbished", hint: "Professionally restored" },
];

export const MOCK_USERS = [
  {
    id: "u1", email: "tunde@ojax.demo", fullName: "Tunde Okonkwo", role: "student",
    isOrg: false, avatarUrl: null, universityCode: "UNILAG", department: "Computer Science", level: "300L",
    phone: "0803 123 4567", bio: "CS student, tech enthusiast. I sell gadgets I no longer need. Meet at Engineering faculty.",
    meetupSpot: "UNILAG Engineering Faculty", verified: true, joinedAt: "2024-09-15T10:00:00Z",
  },
  {
    id: "u2", email: "chiamaka@ojax.demo", fullName: "Chiamaka Adeyemi", role: "student",
    isOrg: false, avatarUrl: null, universityCode: "UNILAG", department: "Economics", level: "400L",
    phone: "0805 987 6543", bio: "Final year Econ student. Decluttering before graduation! All items negotiable.",
    meetupSpot: "UNILAG Main Library", verified: true, joinedAt: "2024-08-20T09:00:00Z",
  },
  {
    id: "u3", email: "obi@ojax.demo", fullName: "Obi Nwosu", role: "student",
    isOrg: false, avatarUrl: null, universityCode: "UI", department: "Medicine", level: "500L",
    phone: "0701 234 5678", bio: "Medical student. Selling textbooks and lab coats. Serious buyers only.",
    meetupSpot: "UI College of Medicine", verified: true, joinedAt: "2024-07-10T08:00:00Z",
  },
  {
    id: "u4", email: "aisha@ojax.demo", fullName: "Aisha Bello", role: "student",
    isOrg: false, avatarUrl: null, universityCode: "ABU", department: "Architecture", level: "400L",
    phone: "0903 456 7890", bio: "Architecture student with eye for design. Selling fashion & home items.",
    meetupSpot: "ABU Architecture Studio", verified: true, joinedAt: "2024-09-01T11:00:00Z",
  },
  {
    id: "u5", email: "nacoss@ojax.demo", fullName: "NACOSS UNILAG", orgName: "NACOSS UNILAG Chapter", role: "student",
    isOrg: true, avatarUrl: null, universityCode: "UNILAG", department: "Computer Science", level: "Org",
    phone: "0809 000 1111", bio: "Nigeria Association of Computer Science Students, UNILAG Chapter. Building tech community on campus.",
    meetupSpot: "UNILAG CITS", verified: true, joinedAt: "2024-06-01T10:00:00Z",
  },
  {
    id: "u6", email: "admin@ojax.demo", fullName: "OjaX Admin", role: "admin",
    isOrg: false, avatarUrl: null, universityCode: "UNILAG", department: "Admin", level: "Staff",
    phone: "0800 000 0000", bio: "OjaX platform administrator", meetupSpot: "Lagos HQ", verified: true, joinedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "u7", email: "sarah@ojax.demo", fullName: "Sarah Johnson", role: "student",
    isOrg: false, avatarUrl: null, universityCode: "CU", department: "Business Admin", level: "200L",
    phone: "0812 345 6789", bio: "Business student, side hustler. Quality thrift finds.",
    meetupSpot: "CU Cafeteria", verified: true, joinedAt: "2024-09-20T10:00:00Z",
  },
  {
    id: "u8", email: "emeka@ojax.demo", fullName: "Emeka Okafor", role: "student",
    isOrg: false, avatarUrl: null, universityCode: "UNN", department: "Engineering", level: "300L",
    phone: "0706 789 0123", bio: "Engineering student, I fix and flip phones. All phones tested.",
    meetupSpot: "UNN Engineering Block", verified: true, joinedAt: "2024-08-15T09:30:00Z",
  },
];

// Use Unsplash & Picsum for realistic images
const IMG = (id: number, w = 600, h = 600) => `https://picsum.photos/seed/ojax${id}/${w}/${h}`;

export const MOCK_LISTINGS = [
  {
    id: "l1", sellerId: "u2", title: "iPhone 13 128GB - Midnight Black, Good Condition", description: "Bought last year, barely used. Battery health 89%. Comes with original box, charger, and extra case. No scratches on screen (screen protector since day 1). Selling because I upgraded to 15. Meet at UNILAG library to test.\n\nIncludes:\n- Original box & charger\n- 2 silicone cases\n- Screen protector already applied\n\nPrice slightly negotiable for serious buyers.",
    category: "phones", subcategory: "iphones", condition: "used-good", conditionLabel: "Used - Good", priceKobo: 32000000, negotiable: true, quantity: 1, status: "active", shipAvailable: true, meetupLocation: "UNILAG Main Library", meetupNotes: "Come with power bank to test if you want. Available weekdays after 2pm.", views: 342, favoriteCount: 28, featured: true,
    images: [{ fullUrl: IMG(1, 800, 800), thumbUrl: IMG(1, 200, 200), position: 0 }, { fullUrl: IMG(101, 800, 800), thumbUrl: IMG(101, 200, 200), position: 1 }],
    coverUrl: IMG(1, 600, 600), createdAt: "2025-09-10T14:30:00Z",
  },
  {
    id: "l2", sellerId: "u1", title: "MacBook Air M1 2020 - 8GB/256GB - Space Grey", description: "Perfect for coding, design, school work. Battery cycle 89, health 94%. No dents. Keyboard US layout. I used it for 2 years for CS projects.\n\nSpecs:\n- Apple M1 chip\n- 8GB RAM, 256GB SSD\n- 13.3\" Retina\n- Battery lasts 10+ hrs\n\nSelling because I got M3 for final year project. Comes with charger.",
    category: "computing", subcategory: "laptops", condition: "used-good", conditionLabel: "Used - Good", priceKobo: 45000000, negotiable: true, quantity: 1, status: "active", shipAvailable: true, meetupLocation: "UNILAG Engineering Faculty", meetupNotes: "Can demo Final Cut, VS Code, etc.", views: 521, favoriteCount: 45, featured: true,
    images: [{ fullUrl: IMG(2, 800, 800), thumbUrl: IMG(2, 200, 200), position: 0 }, { fullUrl: IMG(102, 800, 800), thumbUrl: IMG(102, 200, 200), position: 1 }],
    coverUrl: IMG(2, 600, 600), createdAt: "2025-09-12T09:15:00Z",
  },
  {
    id: "l3", sellerId: "u3", title: "Gray's Anatomy Textbook + Past Questions Bundle", description: "Essential for 400L Medicine. Gray's Anatomy 42nd edition + 3 years past questions (UNIBEN, UI, UNILAG). Book has minor highlights (helpful!). Past questions are printed, bound.\n\n- Gray's Anatomy 42nd Ed (hardcover)\n- Past Q's 2021-2024\n- Free: Anatomy flashcards I made\n\nMeet at UCH Ibadan or ship.",
    category: "textbooks", subcategory: "medical", condition: "used-good", conditionLabel: "Used - Good", priceKobo: 1500000, negotiable: false, quantity: 2, status: "active", shipAvailable: true, meetupLocation: "UI College of Medicine", views: 89, favoriteCount: 12,
    images: [{ fullUrl: IMG(3, 800, 800), thumbUrl: IMG(3, 200, 200), position: 0 }],
    coverUrl: IMG(3, 600, 600), createdAt: "2025-09-08T11:00:00Z",
  },
  {
    id: "l4", sellerId: "u4", title: "Vintage Denim Jacket - Unisex, Size M", description: "Thrifted from Yaba, tailored to perfection. Perfect for harmattan or casual campus look. Size M, fits L too if oversized style.\n\n- 100% denim, heavy weight\n- No tears, washed\n- Custom patches (removable)\n\nDM for measurements.",
    category: "fashion", subcategory: "mens", condition: "used-good", conditionLabel: "Used - Good", priceKobo: 850000, negotiable: true, quantity: 1, status: "active", shipAvailable: true, meetupLocation: "ABU Campus Gate", views: 156, favoriteCount: 19,
    images: [{ fullUrl: IMG(4, 800, 800), thumbUrl: IMG(4, 200, 200), position: 0 }],
    coverUrl: IMG(4, 600, 600), createdAt: "2025-09-11T16:20:00Z",
  },
  {
    id: "l5", sellerId: "u2", title: "JBL Charge 5 Bluetooth Speaker - Like New", description: "Used 3 times for hostel party. Loud, bass heavy, waterproof. 20hr battery. Original box + charger + strap.\n\nWhy selling: roommate complains it's too loud 😂\n\nMeet at UNILAG, test before you pay.",
    category: "electronics", subcategory: "audio", condition: "like-new", conditionLabel: "Like New", priceKobo: 6500000, negotiable: false, quantity: 1, status: "active", shipAvailable: true, meetupLocation: "UNILAG Main Library", views: 203, favoriteCount: 22, featured: true,
    images: [{ fullUrl: IMG(5, 800, 800), thumbUrl: IMG(5, 200, 200), position: 0 }],
    coverUrl: IMG(5, 600, 600), createdAt: "2025-09-13T10:00:00Z",
  },
  {
    id: "l6", sellerId: "u1", title: "HP LaserJet Printer + Extra Toner", description: "Works perfectly, prints fast. Ideal for department that needs to print handouts or for business center. Toner 70% left + new spare toner included.\n\n- HP LaserJet Pro M15w\n- WiFi printing\n- USB cable included\n- 2 toners\n\nLocation: UNILAG Akoka. Can deliver to Yaba/Surulere.",
    category: "computing", subcategory: "printers", condition: "used-good", conditionLabel: "Used - Good", priceKobo: 4500000, negotiable: true, quantity: 1, status: "active", shipAvailable: false, meetupLocation: "UNILAG Akoka", views: 98, favoriteCount: 7,
    images: [{ fullUrl: IMG(6, 800, 800), thumbUrl: IMG(6, 200, 200), position: 0 }],
    coverUrl: IMG(6, 600, 600), createdAt: "2025-09-09T13:45:00Z",
  },
  {
    id: "l7", sellerId: "u7", title: "Nike Air Force 1 - White - Size 42 - New", description: "Brand new, never worn. Bought from Nike store Ikeja, size 42 but my true size is 43. Receipt available.\n\n- Original box\n- Extra laces\n- Size 42\n- Color: Triple White\n\nNo negotiation, fixed price (I paid more).",
    category: "fashion", subcategory: "shoes", condition: "new", conditionLabel: "Brand New", priceKobo: 3500000, negotiable: false, quantity: 1, status: "active", shipAvailable: true, meetupLocation: "CU Cafeteria", views: 412, favoriteCount: 38, featured: true,
    images: [{ fullUrl: IMG(7, 800, 800), thumbUrl: IMG(7, 200, 200), position: 0 }],
    coverUrl: IMG(7, 600, 600), createdAt: "2025-09-14T09:00:00Z",
  },
  {
    id: "l8", sellerId: "u8", title: "Samsung Galaxy S22 Ultra 256GB - Phantom Black", description: "Flagship phone, camera beast. S Pen included, works perfectly. Battery health 91%. No cracks. 2 cases included (1 leather).\n\nSpecs:\n- 12GB RAM / 256GB\n- Snapdragon 8 Gen 1\n- 108MP camera\n- S Pen\n\nReason: switching to iPhone.",
    category: "phones", subcategory: "android", condition: "used-good", conditionLabel: "Used - Good", priceKobo: 38000000, negotiable: true, quantity: 1, status: "active", shipAvailable: true, meetupLocation: "UNN Engineering Block", views: 298, favoriteCount: 31,
    images: [{ fullUrl: IMG(8, 800, 800), thumbUrl: IMG(8, 200, 200), position: 0 }],
    coverUrl: IMG(8, 600, 600), createdAt: "2025-09-10T18:30:00Z",
  },
  {
    id: "l9", sellerId: "u2", title: "Mini Fridge 45L - Perfect for Hostel", description: "Used 1 semester, works like new. Keeps drinks cold, small freezer section. Low power consumption (hostel friendly!).\n\n- 45L capacity\n- Energy saving\n- Small freezer\n- No frost issue\n\nPickup only (heavy). UNILAG Mariere Hall.",
    category: "home", subcategory: "kitchen", condition: "used-good", conditionLabel: "Used - Good", priceKobo: 5500000, negotiable: true, quantity: 1, status: "active", shipAvailable: false, meetupLocation: "UNILAG Mariere Hall", views: 167, favoriteCount: 15,
    images: [{ fullUrl: IMG(9, 800, 800), thumbUrl: IMG(9, 200, 200), position: 0 }],
    coverUrl: IMG(9, 600, 600), createdAt: "2025-09-07T15:00:00Z",
  },
  {
    id: "l10", sellerId: "u4", title: "Acrylic Painting Set - 24 Colors + Brushes", description: "For Architecture students or hobbyists. Used once for assignment. 24 acrylic colors (barely used) + 12 brushes + canvas pad.\n\n- 24 x 12ml tubes\n- 12 brushes (various sizes)\n- A3 canvas pad (10 sheets left)\n- Palette included\n\nMeet at ABU.",
    category: "other", subcategory: "other", condition: "like-new", conditionLabel: "Like New", priceKobo: 1200000, negotiable: true, quantity: 1, status: "active", shipAvailable: true, meetupLocation: "ABU Architecture Studio", views: 73, favoriteCount: 8,
    images: [{ fullUrl: IMG(10, 800, 800), thumbUrl: IMG(10, 200, 200), position: 0 }],
    coverUrl: IMG(10, 600, 600), createdAt: "2025-09-06T10:20:00Z",
  },
  {
    id: "l11", sellerId: "u1", title: "Mechanical Keyboard - Keychron K2 - Brown Switches", description: "Best keyboard for coding. Brown switches (tactile, not too loud for hostel). Wireless + wired. Mac/Win layout.\n\n- Keychron K2 V2\n- Brown switches\n- RGB backlight\n- Bluetooth 5.1\n- 72% layout\n\nSlight shine on keycaps (normal). Works perfectly.",
    category: "computing", subcategory: "accessories", condition: "used-good", conditionLabel: "Used - Good", priceKobo: 2800000, negotiable: true, quantity: 1, status: "active", shipAvailable: true, meetupLocation: "UNILAG Engineering Faculty", views: 134, favoriteCount: 18,
    images: [{ fullUrl: IMG(11, 800, 800), thumbUrl: IMG(11, 200, 200), position: 0 }],
    coverUrl: IMG(11, 600, 600), createdAt: "2025-09-12T20:00:00Z",
  },
  {
    id: "l12", sellerId: "u3", title: "Stethoscope Littmann Classic III - Black", description: "Original Littmann, bought from Jumia Global. Used for 1 year clinicals, cleaned always. No cracks in tubing.\n\n- Littmann Classic III\n- Black edition\n- Comes with extra eartips\n- Original box\n\nSelling because I got Cardiology IV as gift.",
    category: "other", subcategory: "other", condition: "used-good", conditionLabel: "Used - Good", priceKobo: 1800000, negotiable: false, quantity: 1, status: "active", shipAvailable: true, meetupLocation: "UCH Ibadan", views: 67, favoriteCount: 5,
    images: [{ fullUrl: IMG(12, 800, 800), thumbUrl: IMG(12, 200, 200), position: 0 }],
    coverUrl: IMG(12, 600, 600), createdAt: "2025-09-05T09:00:00Z",
  },
  {
    id: "l13", sellerId: "u7", title: "Ankara Gown - Custom Made, Size 10", description: "Worn once for department dinner. Dry cleaned. Beautiful Ankara print, fits size 8-10.\n\n- Length: ankle\n- Sleeve: short\n- Lining: yes\n- Condition: like new\n\nDM for more pics.",
    category: "fashion", subcategory: "womens", condition: "like-new", conditionLabel: "Like New", priceKobo: 1200000, negotiable: true, quantity: 1, status: "active", shipAvailable: true, meetupLocation: "CU Female Hostel", views: 201, favoriteCount: 24,
    images: [{ fullUrl: IMG(13, 800, 800), thumbUrl: IMG(13, 200, 200), position: 0 }],
    coverUrl: IMG(13, 600, 600), createdAt: "2025-09-13T19:00:00Z",
  },
  {
    id: "l14", sellerId: "u8", title: "PS4 Console + 2 Controllers + 5 Games", description: "PS4 Slim 500GB, 2 DualShock controllers (1 barely used), 5 games: FIFA 23, GTA V, Call of Duty, Spider-Man, God of War.\n\n- PS4 Slim 500GB\n- 2 controllers\n- HDMI + power cable\n- 5 games (disc)\n\nNo issues, selling because I upgraded to PS5. Meet at UNN to test.",
    category: "electronics", subcategory: "gaming", condition: "used-good", conditionLabel: "Used - Good", priceKobo: 12000000, negotiable: true, quantity: 1, status: "active", shipAvailable: false, meetupLocation: "UNN Main Campus", views: 445, favoriteCount: 52, featured: true,
    images: [{ fullUrl: IMG(14, 800, 800), thumbUrl: IMG(14, 200, 200), position: 0 }],
    coverUrl: IMG(14, 600, 600), createdAt: "2025-09-11T12:00:00Z",
  },
  {
    id: "l15", sellerId: "u2", title: "Engineering Mathematics - Stroud + Past Questions", description: "Must-have for 100L-300L Engineering. Stroud Engineering Mathematics 7th edition + UNILAG past questions (2019-2024).\n\n- Stroud 7th Ed (softcover)\n- Past Q's with solutions (my handwritten notes)\n- Formula sheet\n\nPrice fixed, I paid more.",
    category: "textbooks", subcategory: "science", condition: "used-good", conditionLabel: "Used - Good", priceKobo: 800000, negotiable: false, quantity: 3, status: "active", shipAvailable: true, meetupLocation: "UNILAG Engineering Faculty", views: 112, favoriteCount: 9,
    images: [{ fullUrl: IMG(15, 800, 800), thumbUrl: IMG(15, 200, 200), position: 0 }],
    coverUrl: IMG(15, 600, 600), createdAt: "2025-09-04T14:00:00Z",
  },
  {
    id: "l16", sellerId: "u1", title: "AirPods Pro 2nd Gen - Original", description: "Original AirPods Pro 2, bought from iStore. Battery perfect, ANC works great. Comes with box, cable, extra tips.\n\n- Original, not clone (can verify serial)\n- ANC + Transparency\n- MagSafe charging\n- 6hr battery\n\nSelling because I got AirPods Max.",
    category: "electronics", subcategory: "audio", condition: "like-new", conditionLabel: "Like New", priceKobo: 8500000, negotiable: true, quantity: 1, status: "active", shipAvailable: true, meetupLocation: "UNILAG CITS", views: 376, favoriteCount: 41,
    images: [{ fullUrl: IMG(16, 800, 800), thumbUrl: IMG(16, 200, 200), position: 0 }],
    coverUrl: IMG(16, 600, 600), createdAt: "2025-09-14T11:30:00Z",
  },
  {
    id: "l17", sellerId: "u4", title: "Dumbbells 20KG Set + Bench", description: "Home gym set, used for 6 months. 20KG adjustable dumbbells + foldable bench. Perfect for hostel or home.\n\n- 2 x 10KG adjustable\n- Foldable bench\n- No rust\n\nPickup only, ABU Samaru.",
    category: "sports", subcategory: "gym", condition: "used-good", conditionLabel: "Used - Good", priceKobo: 3500000, negotiable: true, quantity: 1, status: "active", shipAvailable: false, meetupLocation: "ABU Samaru", views: 89, favoriteCount: 6,
    images: [{ fullUrl: IMG(17, 800, 800), thumbUrl: IMG(17, 200, 200), position: 0 }],
    coverUrl: IMG(17, 600, 600), createdAt: "2025-09-03T16:00:00Z",
  },
  {
    id: "l18", sellerId: "u7", title: "Skincare Bundle - CeraVe + The Ordinary", description: "Authentic products, bought from Sephora US (cousin brought). Selling because skin changed.\n\n- CeraVe Foaming Cleanser (almost full)\n- The Ordinary Niacinamide (new)\n- CeraVe Moisturizer (70% left)\n- Sunscreen (new)\n\nAll authentic, receipts available.",
    category: "beauty", subcategory: "skincare", condition: "like-new", conditionLabel: "Like New", priceKobo: 1800000, negotiable: true, quantity: 1, status: "active", shipAvailable: true, meetupLocation: "CU Campus", views: 234, favoriteCount: 29,
    images: [{ fullUrl: IMG(18, 800, 800), thumbUrl: IMG(18, 200, 200), position: 0 }],
    coverUrl: IMG(18, 600, 600), createdAt: "2025-09-12T15:00:00Z",
  },
  {
    id: "l19", sellerId: "u8", title: "Power Bank 20000mAh - Oraimo - Fast Charge", description: "Oraimo 20000mAh power bank, fast charge, 2 USB ports + Type C. Bought 2 months ago, used few times. Still under warranty.\n\n- 20000mAh\n- 22.5W fast charge\n- Type C + 2 USB\n- LED display\n\nReason: got 30000mAh as gift.",
    category: "electronics", subcategory: "accessories", condition: "like-new", conditionLabel: "Like New", priceKobo: 900000, negotiable: false, quantity: 2, status: "active", shipAvailable: true, meetupLocation: "UNN Main Campus", views: 178, favoriteCount: 14,
    images: [{ fullUrl: IMG(19, 800, 800), thumbUrl: IMG(19, 200, 200), position: 0 }],
    coverUrl: IMG(19, 600, 600), createdAt: "2025-09-10T10:30:00Z",
  },
  {
    id: "l20", sellerId: "u1", title: "Tutoring: Data Structures & Algorithms - 1-on-1", description: "I aced DSA (A grade). I tutor 100L-300L students. 2 hours per session, at Engineering faculty or online.\n\nWhat I cover:\n- Arrays, Linked Lists, Stacks, Queues\n- Trees, Graphs, Sorting\n- LeetCode practice\n- Interview prep\n\n₦3,000 per hour, discount for 5 sessions. DM to schedule.",
    category: "services", subcategory: "tutoring", condition: "new", conditionLabel: "Brand New", priceKobo: 300000, negotiable: false, quantity: 10, status: "active", shipAvailable: false, meetupLocation: "UNILAG Engineering Faculty", views: 95, favoriteCount: 11,
    images: [{ fullUrl: IMG(20, 800, 800), thumbUrl: IMG(20, 200, 200), position: 0 }],
    coverUrl: IMG(20, 600, 600), createdAt: "2025-09-08T08:00:00Z",
  },
  // More listings to reach 30
  {
    id: "l21", sellerId: "u2", title: "HP Laptop Bag + Mouse Combo", description: "Laptop bag fits up to 15.6\", plus wireless mouse. Both barely used.",
    category: "computing", subcategory: "accessories", condition: "like-new", conditionLabel: "Like New", priceKobo: 700000, negotiable: true, quantity: 1, status: "active", shipAvailable: true, meetupLocation: "UNILAG", views: 56, favoriteCount: 4,
    images: [{ fullUrl: IMG(21, 800, 800), thumbUrl: IMG(21, 200, 200), position: 0 }],
    coverUrl: IMG(21, 600, 600), createdAt: "2025-09-13T08:00:00Z",
  },
  {
    id: "l22", sellerId: "u3", title: "Medical Scrubs - 2 Sets, Size L", description: "2 sets of medical scrubs, size L, blue and green. Washed, ironed.",
    category: "fashion", subcategory: "other", condition: "used-good", conditionLabel: "Used - Good", priceKobo: 1000000, negotiable: false, quantity: 1, status: "active", shipAvailable: true, meetupLocation: "UCH", views: 34, favoriteCount: 2,
    images: [{ fullUrl: IMG(22, 800, 800), thumbUrl: IMG(22, 200, 200), position: 0 }],
    coverUrl: IMG(22, 600, 600), createdAt: "2025-09-02T10:00:00Z",
  },
  {
    id: "l23", sellerId: "u4", title: "Study Desk - Foldable, Wooden", description: "Foldable study desk, perfect for hostel. Light wood, stable.",
    category: "home", subcategory: "furniture", condition: "used-good", conditionLabel: "Used - Good", priceKobo: 1500000, negotiable: true, quantity: 1, status: "active", shipAvailable: false, meetupLocation: "ABU", views: 78, favoriteCount: 6,
    images: [{ fullUrl: IMG(23, 800, 800), thumbUrl: IMG(23, 200, 200), position: 0 }],
    coverUrl: IMG(23, 600, 600), createdAt: "2025-09-01T09:00:00Z",
  },
  {
    id: "l24", sellerId: "u7", title: "Wireless Earbuds - Samsung Buds 2", description: "Samsung Galaxy Buds 2, white, ANC, barely used.",
    category: "electronics", subcategory: "audio", condition: "like-new", conditionLabel: "Like New", priceKobo: 2500000, negotiable: true, quantity: 1, status: "active", shipAvailable: true, meetupLocation: "CU", views: 189, favoriteCount: 16,
    images: [{ fullUrl: IMG(24, 800, 800), thumbUrl: IMG(24, 200, 200), position: 0 }],
    coverUrl: IMG(24, 600, 600), createdAt: "2025-09-14T14:00:00Z",
  },
  {
    id: "l25", sellerId: "u8", title: "Scientific Calculator - Casio FX-991EX", description: "Classwiz calculator, needed for engineering. Almost new.",
    category: "other", subcategory: "other", condition: "like-new", conditionLabel: "Like New", priceKobo: 800000, negotiable: false, quantity: 1, status: "active", shipAvailable: true, meetupLocation: "UNN", views: 67, favoriteCount: 5,
    images: [{ fullUrl: IMG(25, 800, 800), thumbUrl: IMG(25, 200, 200), position: 0 }],
    coverUrl: IMG(25, 600, 600), createdAt: "2025-09-09T11:30:00Z",
  },
  {
    id: "l26", sellerId: "u1", title: "iPad Air 4th Gen 64GB - Sky Blue", description: "iPad Air 4, perfect for notes, Netflix, drawing. Apple Pencil compatible.",
    category: "phones", subcategory: "tablets", condition: "used-good", conditionLabel: "Used - Good", priceKobo: 22000000, negotiable: true, quantity: 1, status: "active", shipAvailable: true, meetupLocation: "UNILAG", views: 267, favoriteCount: 29,
    images: [{ fullUrl: IMG(26, 800, 800), thumbUrl: IMG(26, 200, 200), position: 0 }],
    coverUrl: IMG(26, 600, 600), createdAt: "2025-09-11T10:00:00Z",
  },
  {
    id: "l27", sellerId: "u2", title: "Kettle + Toaster Combo - For Hostel", description: "Electric kettle + pop-up toaster, both working. Hostel approved (low power).",
    category: "home", subcategory: "kitchen", condition: "used-good", conditionLabel: "Used - Good", priceKobo: 1200000, negotiable: true, quantity: 1, status: "active", shipAvailable: false, meetupLocation: "UNILAG", views: 89, favoriteCount: 7,
    images: [{ fullUrl: IMG(27, 800, 800), thumbUrl: IMG(27, 200, 200), position: 0 }],
    coverUrl: IMG(27, 600, 600), createdAt: "2025-09-06T15:30:00Z",
  },
  {
    id: "l28", sellerId: "u4", title: "Logo Design Service - For Student Brands", description: "I design logos for student businesses. 3 concepts, 2 revisions, delivery in 48hrs. Portfolio available.",
    category: "services", subcategory: "design", condition: "new", conditionLabel: "Brand New", priceKobo: 500000, negotiable: true, quantity: 20, status: "active", shipAvailable: false, meetupLocation: "ABU - Online", views: 123, favoriteCount: 13,
    images: [{ fullUrl: IMG(28, 800, 800), thumbUrl: IMG(28, 200, 200), position: 0 }],
    coverUrl: IMG(28, 600, 600), createdAt: "2025-09-07T09:00:00Z",
  },
  {
    id: "l29", sellerId: "u7", title: "Handmade Beaded Bags - 3 Colors", description: "Handmade beaded bags, perfect for Owambe or casual. Red, blue, gold.",
    category: "fashion", subcategory: "bags", condition: "new", conditionLabel: "Brand New", priceKobo: 600000, negotiable: true, quantity: 5, status: "active", shipAvailable: true, meetupLocation: "CU", views: 156, favoriteCount: 18,
    images: [{ fullUrl: IMG(29, 800, 800), thumbUrl: IMG(29, 200, 200), position: 0 }],
    coverUrl: IMG(29, 600, 600), createdAt: "2025-09-10T12:00:00Z",
  },
  {
    id: "l30", sellerId: "u8", title: "Football Boots - Adidas Predator - Size 43", description: "Used 2 times, size 43, firm ground. Selling because I stopped playing.",
    category: "sports", subcategory: "football", condition: "like-new", conditionLabel: "Like New", priceKobo: 1500000, negotiable: true, quantity: 1, status: "active", shipAvailable: true, meetupLocation: "UNN", views: 98, favoriteCount: 9,
    images: [{ fullUrl: IMG(30, 800, 800), thumbUrl: IMG(30, 200, 200), position: 0 }],
    coverUrl: IMG(30, 600, 600), createdAt: "2025-09-05T14:00:00Z",
  },
  {
    id: "l31", sellerId: "u1", title: "Sold Item Example - iPhone 12", description: "This item was sold - example of sold state.",
    category: "phones", subcategory: "iphones", condition: "used-good", conditionLabel: "Used - Good", priceKobo: 20000000, negotiable: true, quantity: 1, status: "sold", shipAvailable: true, meetupLocation: "UNILAG", views: 500, favoriteCount: 60,
    images: [{ fullUrl: IMG(31, 800, 800), thumbUrl: IMG(31, 200, 200), position: 0 }],
    coverUrl: IMG(31, 600, 600), createdAt: "2025-08-20T10:00:00Z",
  },
];

export const MOCK_EVENTS = [
  {
    id: "e1", orgId: "u5", title: "TechTrek 2025 - Code, Ship, Repeat", description: "UNILAG's biggest tech hackathon is back! 48 hours of building, mentorship from Flutterwave, Paystack, Andela engineers. Prizes: ₦1M, internships, MacBooks.\n\nTracks:\n- Fintech for Students\n- Campus Solutions\n- AI & Education\n\nFree food, swag, and accommodation for out-of-campus hackers. No experience needed - just bring your laptop and ideas!\n\nRegister via OjaX - limited slots.",
    category: "hackathons", startsAt: "2025-10-15T09:00:00Z", endsAt: "2025-10-17T18:00:00Z", venue: "UNILAG CITS & Main Auditorium", universityCode: "UNILAG", city: "Lagos", isOnline: false, capacity: 300, priceKobo: 0, status: "published", posterUrl: IMG(100, 1200, 600), rsvpCount: 187, createdAt: "2025-09-01T10:00:00Z",
  },
  {
    id: "e2", orgId: "u5", title: "NACOSS Week - Tech Carnival", description: "One week of tech talks, games, career fair, and party! Day 1: Opening + Keynote (CEO of Paystack). Day 2-4: Workshops. Day 5: Dinner & Awards.\n\nFeaturing:\n- Career fair with 20+ companies\n- Gaming tournament\n- Project exhibitions\n- Tech quiz with prizes",
    category: "academic", startsAt: "2025-10-22T08:00:00Z", endsAt: "2025-10-26T22:00:00Z", venue: "UNILAG Faculty of Science", universityCode: "UNILAG", city: "Lagos", isOnline: false, capacity: 500, priceKobo: 0, status: "published", posterUrl: IMG(101, 1200, 600), rsvpCount: 342, createdAt: "2025-09-05T10:00:00Z",
  },
  {
    id: "e3", orgId: "u5", title: "CV & LinkedIn Masterclass - Land Your Internship", description: "Learn how to write a CV that gets you hired. Facilitator: HR Lead at Andela. Bring your laptop!\n\nYou'll learn:\n- CV structure that works in Nigeria\n- LinkedIn optimization\n- Cover letter tips\n- Mock interviews\n\nFree for NACOSS members, ₦500 for others (pay at venue).",
    category: "career", startsAt: "2025-09-28T14:00:00Z", endsAt: "2025-09-28T17:00:00Z", venue: "UNILAG DLI Hall", universityCode: "UNILAG", city: "Lagos", isOnline: false, capacity: 150, priceKobo: 0, status: "published", posterUrl: IMG(102, 1200, 600), rsvpCount: 89, createdAt: "2025-09-10T10:00:00Z",
  },
  {
    id: "e4", orgId: "u5", title: "Campus Trade Fair - Sell Anything!", description: "One-day market where students sell anything: clothes, food, gadgets, art. Rent a table for ₦2k or just come to shop!\n\n- 50+ student vendors\n- Food court\n- Live music\n- Raffle draw\n\nOrganized by NACOSS + JCI UNILAG.",
    category: "socials", startsAt: "2025-10-05T10:00:00Z", endsAt: "2025-10-05T18:00:00Z", venue: "UNILAG Sports Centre", universityCode: "UNILAG", city: "Lagos", isOnline: false, capacity: 1000, priceKobo: 0, status: "published", posterUrl: IMG(103, 1200, 600), rsvpCount: 256, createdAt: "2025-09-12T10:00:00Z",
  },
  {
    id: "e5", orgId: "u5", title: "UI/UX Design Bootcamp - Figma to Portfolio", description: "3-day intensive bootcamp. Learn Figma, design thinking, and build a portfolio. Certificate included.\n\nFacilitator: Product Designer at Cowrywise.\n\n- Day 1: Figma basics\n- Day 2: Design system & prototyping\n- Day 3: Portfolio & job search\n\nLaptops required. Limited to 40 students.",
    category: "academic", startsAt: "2025-09-30T09:00:00Z", endsAt: "2025-10-02T16:00:00Z", venue: "UNILAG Library E-Learning Centre", universityCode: "UNILAG", city: "Lagos", isOnline: false, capacity: 40, priceKobo: 200000, status: "published", posterUrl: IMG(104, 1200, 600), rsvpCount: 38, createdAt: "2025-09-08T10:00:00Z",
  },
  {
    id: "e6", orgId: "u5", title: "Freshers Welcome Party - Class of 2029", description: "Welcome to UNILAG! Party for 100L students. Music, dance, free drinks, and chance to meet seniors who will guide you.\n\n- DJ, live band\n- Free small chops for first 100\n- Departmental meet & greet\n- OjaX will be there with freebies!\n\nDress code: White & Denim.",
    category: "socials", startsAt: "2025-09-25T18:00:00Z", endsAt: "2025-09-25T23:00:00Z", venue: "UNILAG New Hall", universityCode: "UNILAG", city: "Lagos", isOnline: false, capacity: 400, priceKobo: 0, status: "published", posterUrl: IMG(105, 1200, 600), rsvpCount: 312, createdAt: "2025-09-11T10:00:00Z",
  },
  {
    id: "e7", orgId: "u5", title: "Football Tournament - Inter-Departmental Cup", description: "Annual football competition between departments. 16 teams, knockout format. Winner goes home with ₦100k + trophy.\n\nRegister your department team via NACOSS. Spectators free!\n\n- Group stage: Oct 1-3\n- Semi: Oct 4\n- Final: Oct 5 at Sports Centre",
    category: "sports-events", startsAt: "2025-10-01T15:00:00Z", endsAt: "2025-10-05T18:00:00Z", venue: "UNILAG Sports Centre", universityCode: "UNILAG", city: "Lagos", isOnline: false, capacity: 200, priceKobo: 0, status: "published", posterUrl: IMG(106, 1200, 600), rsvpCount: 145, createdAt: "2025-09-09T10:00:00Z",
  },
  {
    id: "e8", orgId: "u5", title: "Past Event - Tech Talk with Flutterwave CTO", description: "We hosted Flutterwave CTO last month. Recording available on YouTube. 200 students attended.",
    category: "career", startsAt: "2025-08-15T14:00:00Z", endsAt: "2025-08-15T16:00:00Z", venue: "UNILAG Main Auditorium", universityCode: "UNILAG", city: "Lagos", isOnline: false, capacity: 200, priceKobo: 0, status: "published", posterUrl: IMG(107, 1200, 600), rsvpCount: 198, createdAt: "2025-08-01T10:00:00Z",
  },
];

export const MOCK_REVIEWS = [
  { id: "r1", sellerId: "u2", buyerId: "u1", orderId: "o1", rating: 5, comment: "Chiamaka is legit! Phone exactly as described, met at library, tested everything. Fast and honest seller. Will buy again!", itemTitle: "iPhone 13 128GB", createdAt: "2025-09-02T10:00:00Z" },
  { id: "r2", sellerId: "u2", buyerId: "u3", orderId: "o2", rating: 5, comment: "Great seller, very responsive. Speaker sounds amazing. Recommended!", itemTitle: "JBL Charge 5", createdAt: "2025-09-03T11:00:00Z" },
  { id: "r3", sellerId: "u1", buyerId: "u2", orderId: "o3", rating: 4, comment: "MacBook is clean, battery good. Tunde explained everything. Slight delay in meeting but worth it.", itemTitle: "MacBook Air M1", createdAt: "2025-09-04T09:00:00Z" },
  { id: "r4", sellerId: "u1", buyerId: "u4", orderId: "o4", rating: 5, comment: "Keyboard is perfect for coding. Exactly as described.", itemTitle: "Keychron K2", createdAt: "2025-09-05T14:00:00Z" },
];

export const MOCK_CONVERSATIONS = [
  {
    id: "c1", listingId: "l1", participants: ["u1", "u2"], listingTitle: "iPhone 13 128GB",
    messages: [
      { id: "m1", senderId: "u1", body: "Hi Chiamaka, is the iPhone still available?", createdAt: "2025-09-12T10:00:00Z", readAt: "2025-09-12T10:05:00Z" },
      { id: "m2", senderId: "u2", body: "Yes it is! Still available. Are you on campus today?", createdAt: "2025-09-12T10:06:00Z", readAt: "2025-09-12T10:10:00Z" },
      { id: "m3", senderId: "u1", body: "Yes, I'm at Engineering faculty. Can we meet at library by 2pm?", createdAt: "2025-09-12T10:12:00Z", readAt: null },
    ],
    updatedAt: "2025-09-12T10:12:00Z",
  },
];

export function getSellerById(id: string) {
  return MOCK_USERS.find(u => u.id === id) || null;
}

export function getListingById(id: string) {
  return MOCK_LISTINGS.find(l => l.id === id) || null;
}

export function getEventById(id: string) {
  return MOCK_EVENTS.find(e => e.id === id) || null;
}
