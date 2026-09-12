import clientPromise, { getSellerProductsCollection } from "./mongodb";

export const SEED_PRODUCTS = [
  // 1. Ayurmor (Saish Technofarms) - Ayurvedic, Botanical & Health Mixes
  {
    title: "Ayurmor Pure Organic Moringa Leaf Health Mix Powder (500g)",
    name: "Ayurmor Pure Organic Moringa Leaf Health Mix Powder (500g)",
    brand: "Ayurmor (Saish Technofarms)",
    sellerSlug: "ayurmor",
    portfolioSlug: "ayurmor",
    modelName: "Moringa Vitality Pack",
    sku: "AYUR-MOR-500G",
    shortDesc: "100% natural, sun-dried organic Moringa Oleifera leaf powder packed with 90+ nutrients, 46 antioxidants, and essential amino acids.",
    description: "Ayurmor Moringa Leaf Powder is sourced from organically grown drumstick trees in Maharashtra. Formulated using traditional Ayurvedic grinding methods to preserve bio-active phytonutrients, vitamins A, C, E, iron, and calcium. Promotes daily energy, digestive gut health, and cellular immunity.",
    price: 349,
    originalPrice: 499,
    discount: "30% OFF",
    inventory: 85,
    category: "Ayurvedic Healthcare & Wellness",
    type: "Product",
    city: "Pune",
    state: "Maharashtra",
    images: [
      { url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=700&q=80", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&q=80", isPrimary: false }
    ],
    specs: [
      { key: "Form", value: "Fine Pure Powder" },
      { key: "Weight", value: "500 Grams" },
      { key: "Ingredients", value: "100% Organic Moringa Oleifera Leaves" },
      { key: "Shelf Life", value: "18 Months" },
      { key: "Certifications", value: "FSSAI & GMP Certified" }
    ],
    aiKeywords: ["ayurvedic", "herbal", "wellness", "moringa", "health mix", "ayurmor", "organic", "immunity booster", "healthcare", "healthcare products"],
    aiVisibility: 98,
    aiSubtext: "Top Ayurvedic Wellness Pick",
    badgeType: "verified",
    sourceUrl: "https://ayurmor.com/products/moringa-powder",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Ayurmor Oyster Mushroom Immunity Booster Herbal Soup Mix (250g)",
    name: "Ayurmor Oyster Mushroom Immunity Booster Herbal Soup Mix (250g)",
    brand: "Ayurmor (Saish Technofarms)",
    sellerSlug: "ayurmor",
    portfolioSlug: "ayurmor",
    modelName: "Mushroom Immunity Blend",
    sku: "AYUR-MUSH-250G",
    shortDesc: "Rich protein & beta-glucan herbal mushroom soup mix infused with Ayurvedic black pepper, cumin, and Himalayan pink salt.",
    description: "Formulated from farm-fresh cultivated Pleurotus oyster mushrooms by Saish Technofarms. Highly recommended for strengthening immune defense, balancing cholesterol, and supporting cardiovascular health with instant 3-minute preparation.",
    price: 299,
    originalPrice: 399,
    discount: "25% OFF",
    inventory: 60,
    category: "Ayurvedic Healthcare & Wellness",
    type: "Product",
    city: "Pune",
    state: "Maharashtra",
    images: [
      { url: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=700&q=80", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=700&q=80", isPrimary: false }
    ],
    specs: [
      { key: "Pack Size", value: "250g (Makes 20 Cups)" },
      { key: "Key Active", value: "Beta-Glucan & Polysaccharides" },
      { key: "Preparation", value: "Instant Mix with Hot Water" },
      { key: "Preservatives", value: "Zero Artificial Additives" }
    ],
    aiKeywords: ["ayurvedic", "mushroom", "soup mix", "immunity", "herbal", "wellness", "ayurmor", "healthcare", "organic"],
    aiVisibility: 96,
    aiSubtext: "High Protein Herbal Blend",
    badgeType: "verified",
    sourceUrl: "https://ayurmor.com/products/mushroom-soup",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Ayurmor Organic Ashwagandha & Moringa Herbal Wellness Vitality Blend",
    name: "Ayurmor Organic Ashwagandha & Moringa Herbal Wellness Vitality Blend",
    brand: "Ayurmor (Saish Technofarms)",
    sellerSlug: "ayurmor",
    portfolioSlug: "ayurmor",
    modelName: "Ayurmor Vitality Rasayana",
    sku: "AYUR-ASHWA-300G",
    shortDesc: "Ancient Ayurvedic Rasayana formula combining KSM-66 Grade Ashwagandha with pure green Moringa for stress relief and stamina.",
    description: "Ayurmor Ashwagandha & Moringa Vitality Blend helps reduce cortisol levels, relieves cognitive fatigue, enhances athletic endurance, and rejuvenates bodily tissues through adaptogenic botanical synergy.",
    price: 499,
    originalPrice: 699,
    discount: "28% OFF",
    inventory: 45,
    category: "Ayurvedic Healthcare & Wellness",
    type: "Product",
    city: "Pune",
    state: "Maharashtra",
    images: [
      { url: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=700&q=80", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&q=80", isPrimary: false }
    ],
    specs: [
      { key: "Form", value: "Fine Botanical Powder" },
      { key: "Weight", value: "300 Grams" },
      { key: "Dosage", value: "1 Teaspoon with Warm Milk / Water" },
      { key: "Benefits", value: "Stress Relief, Energy & Deep Sleep" }
    ],
    aiKeywords: ["ashwagandha", "ayurvedic", "herbal", "wellness", "healthcare", "stress relief", "moringa", "ayurmor", "healthcare products"],
    aiVisibility: 97,
    aiSubtext: "Certified Adaptogenic Blend",
    badgeType: "verified",
    sourceUrl: "https://ayurmor.com/products/ashwagandha-moringa",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Ayurmor ABC Sprouted Millet & Malt Health Drink Mix (400g)",
    name: "Ayurmor ABC Sprouted Millet & Malt Health Drink Mix (400g)",
    brand: "Ayurmor (Saish Technofarms)",
    sellerSlug: "ayurmor",
    portfolioSlug: "ayurmor",
    modelName: "Ayurmor ABC Sprouted Malt",
    sku: "AYUR-ABC-400G",
    shortDesc: "Nourishing blend of Apple, Beetroot, Carrot and sprouted Ragi millets with natural Ayurvedic jaggery and cardamom.",
    description: "Ayurmor ABC Sprouted Malt is a complete morning nourishment formula for kids and adults. Naturally rich in dietary fiber, plant-based iron, calcium, and essential micro-minerals with zero refined sugars or chemical preservatives.",
    price: 379,
    originalPrice: 480,
    discount: "21% OFF",
    inventory: 50,
    category: "Ayurvedic Healthcare & Wellness",
    type: "Product",
    city: "Pune",
    state: "Maharashtra",
    images: [
      { url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&q=80", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=700&q=80", isPrimary: false }
    ],
    specs: [
      { key: "Weight", value: "400 Grams" },
      { key: "Ingredients", value: "Apple, Beetroot, Carrot, Sprouted Ragi, Cardamom" },
      { key: "Usage", value: "Mix 2 Spoons with Hot/Cold Milk" },
      { key: "Benefits", value: "Natural Energy & Hemoglobin Support" }
    ],
    aiKeywords: ["abc malt", "millet malt", "ayurvedic", "health drink", "wellness", "ayurmor", "healthcare products", "herbal"],
    aiVisibility: 95,
    aiSubtext: "100% Whole Sprouted Grain Malt",
    badgeType: "verified",
    sourceUrl: "https://ayurmor.com/products/abc-malt",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 2. ANV REEALTY (Anvreeality) - Commercial Real Estate & Properties in Pune
  {
    title: "Grade-A Furnished Commercial Office Space at EON IT Park, Kharadi, Pune",
    name: "Grade-A Furnished Commercial Office Space at EON IT Park, Kharadi, Pune",
    brand: "ANV REEALTY",
    sellerSlug: "anvreeality",
    portfolioSlug: "anvreeality",
    modelName: "EON Tower B Workstation Floor",
    sku: "ANV-EON-12K",
    shortDesc: "12,500 Sq.Ft fully-fitted enterprise IT office with 140 workstations, 4 executive cabins, and 24/7 power backup.",
    description: "Premium Grade-A commercial office space located in Kharadi premier EON Free Zone. Features plug-and-play network infrastructure, centralized HVAC, 2 high-speed conference rooms, cafeteria setup, and 12 reserved basement parking slots. Ideal for MNCs and tech startups.",
    price: 125000000,
    originalPrice: 135000000,
    discount: "₹ 1 Cr Savings",
    inventory: 1,
    category: "Commercial Real Estate",
    type: "Property",
    city: "Pune",
    state: "Maharashtra",
    images: [
      { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80", isPrimary: false }
    ],
    specs: [
      { key: "Super Built-up Area", value: "12,500 Sq.Ft" },
      { key: "Carpet Area", value: "9,800 Sq.Ft" },
      { key: "Floor", value: "7th Floor (Park View)" },
      { key: "Workstations", value: "140 Plug & Play Desks" },
      { key: "MahaRERA Status", value: "Approved Commercial Hub" }
    ],
    aiKeywords: ["commercial office", "office space", "kharadi", "eon it park", "pune", "real estate", "property", "anv reealty", "anvreeality"],
    aiVisibility: 99,
    aiSubtext: "MahaRERA Verified Commercial Asset",
    badgeType: "rera",
    sourceUrl: "https://anvreealty.com/properties/eon-kharadi-office",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Pre-Leased Commercial Retail Showroom on Main Baner Road, Pune",
    name: "Pre-Leased Commercial Retail Showroom on Main Baner Road, Pune",
    brand: "ANV REEALTY",
    sellerSlug: "anvreeality",
    portfolioSlug: "anvreeality",
    modelName: "Baner High Street Retail Corner",
    sku: "ANV-BNR-4200",
    shortDesc: "4,200 Sq.Ft prime ground-floor retail showroom pre-leased to a Tier-1 National Bank with 7.8% Net ROI.",
    description: "High-visibility corner showroom asset on Baner Road with 65-foot wide glass frontage. Leased on a 9-year corporate lease agreement with a 15% rental escalation every 3 years. Immediate rental yield generation with zero vacancy risk.",
    price: 85000000,
    originalPrice: 90000000,
    discount: "High ROI Asset",
    inventory: 1,
    category: "Commercial Real Estate",
    type: "Property",
    city: "Pune",
    state: "Maharashtra",
    images: [
      { url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80", isPrimary: false }
    ],
    specs: [
      { key: "Carpet Area", value: "4,200 Sq.Ft" },
      { key: "Floor", value: "Ground Floor + Mezzanine" },
      { key: "Tenant", value: "National Scheduled Bank" },
      { key: "Net ROI Yield", value: "7.8% Per Annum" },
      { key: "Lease Lock-in", value: "5 Years Remaining" }
    ],
    aiKeywords: ["pre-leased", "showroom", "baner", "commercial property", "pune", "retail", "anv reealty", "anvreeality", "real estate"],
    aiVisibility: 99,
    aiSubtext: "7.8% High ROI Investment",
    badgeType: "rera",
    sourceUrl: "https://anvreealty.com/properties/baner-showroom",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Executive Commercial Office Suite at World Trade Center (WTC), Kharadi",
    name: "Executive Commercial Office Suite at World Trade Center (WTC), Kharadi",
    brand: "ANV REEALTY",
    sellerSlug: "anvreeality",
    portfolioSlug: "anvreeality",
    modelName: "WTC Tower 3 Executive Suite",
    sku: "ANV-WTC-3500",
    shortDesc: "3,500 Sq.Ft boutique corporate office suite with soundproof conference facilities and private executive washrooms.",
    description: "Located within the internationally recognized World Trade Center complex in Kharadi. Complete with modern Italian marble reception, smart biometrics access, VRF air conditioning, and dedicated high-speed fiber internet backbone.",
    price: 41000000,
    originalPrice: 45000000,
    discount: "Prime Location",
    inventory: 1,
    category: "Commercial Real Estate",
    type: "Property",
    city: "Pune",
    state: "Maharashtra",
    images: [
      { url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80", isPrimary: false }
    ],
    specs: [
      { key: "Built-up Area", value: "3,500 Sq.Ft" },
      { key: "Capacity", value: "45-55 Employees" },
      { key: "Cabins", value: "3 MD Cabins + 1 Boardroom" },
      { key: "Car Parks", value: "4 Covered Stalls" }
    ],
    aiKeywords: ["wtc", "kharadi", "commercial office", "office space", "pune", "anv reealty", "anvreeality"],
    aiVisibility: 98,
    aiSubtext: "World Trade Center Landmark",
    badgeType: "rera",
    sourceUrl: "https://anvreealty.com/properties/wtc-kharadi-suite",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 3. ABC Electronics - High-Performance Gaming & Computing
  {
    title: "Custom Liquid-Cooled RTX 4080 Super AI Workstation & Gaming Rig",
    name: "Custom Liquid-Cooled RTX 4080 Super AI Workstation & Gaming Rig",
    brand: "ABC Electronics & IT Solutions",
    sellerSlug: "abc-electronics",
    portfolioSlug: "abc-electronics",
    modelName: "Titanium Forge RTX 4080S",
    sku: "ABC-RIG-4080S",
    shortDesc: "Intel Core i9-14900K, 64GB DDR5 6000MHz RGB RAM, 2TB Gen4 NVMe, NVIDIA RTX 4080 Super 16GB GPU with custom EKWB water loop.",
    description: "Precision-engineered custom workstation for 4K ray-traced gaming, deep learning LLM inference, and 3D architectural rendering. Tested for 48 hours under sustained synthetic stress tests with thermal temps under 68°C.",
    price: 245000,
    originalPrice: 285000,
    discount: "14% OFF",
    inventory: 5,
    category: "Computing & Gaming Hardware",
    type: "Product",
    city: "Mumbai",
    state: "Maharashtra",
    images: [
      { url: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80", isPrimary: false }
    ],
    specs: [
      { key: "Processor", value: "Intel Core i9 14900K 24-Core" },
      { key: "Graphics Card", value: "NVIDIA GeForce RTX 4080 Super 16GB" },
      { key: "Memory", value: "64GB Corsair Dominator DDR5" },
      { key: "Storage", value: "2TB Samsung 990 Pro Gen4 SSD" },
      { key: "Warranty", value: "3 Years On-Site Warranty" }
    ],
    aiKeywords: ["gaming pc", "rtx 4080", "custom pc", "workstation", "gaming laptop", "electronics", "abc electronics"],
    aiVisibility: 99,
    aiSubtext: "Top Gaming Rig Pick",
    badgeType: "verified",
    sourceUrl: "https://abcelectronics.com/products/custom-rtx4080s-rig",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "ASUS ROG Strix SCAR 18 (2024) Core i9 14th Gen Gaming Laptop",
    name: "ASUS ROG Strix SCAR 18 (2024) Core i9 14th Gen Gaming Laptop",
    brand: "ABC Electronics & IT Solutions",
    sellerSlug: "abc-electronics",
    portfolioSlug: "abc-electronics",
    modelName: "G834JYR-R6024WS",
    sku: "ABC-ROG-SCAR18",
    shortDesc: "18-inch 2.5K 240Hz Nebula HDR Display, Core i9-14900HX, RTX 4090 16GB GPU, 32GB DDR5, 2TB SSD, RGB Per-Key Keyboard.",
    description: "The apex of mobile desktop replacement gaming. Featuring Tri-Fan cooling technology, Conductonaut Extreme liquid metal on CPU & GPU, and 100% DCI-P3 color accuracy for video creators and competitive eSports athletes.",
    price: 289990,
    originalPrice: 349990,
    discount: "17% OFF",
    inventory: 8,
    category: "Computing & Gaming Hardware",
    type: "Product",
    city: "Mumbai",
    state: "Maharashtra",
    images: [
      { url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80", isPrimary: false }
    ],
    specs: [
      { key: "Display", value: "18-inch 2.5K (2560x1600) 240Hz Mini-LED" },
      { key: "GPU", value: "NVIDIA RTX 4090 16GB GDDR6 (175W TGP)" },
      { key: "RAM / SSD", value: "32GB DDR5 / 2TB PCIe 4.0 SSD" },
      { key: "Brand Warranty", value: "1 Year Official ASUS International Warranty" }
    ],
    aiKeywords: ["laptop", "gaming laptop", "asus rog", "rtx 4090", "electronics", "abc electronics"],
    aiVisibility: 98,
    aiSubtext: "Official Brand Warranty",
    badgeType: "verified",
    sourceUrl: "https://abcelectronics.com/products/asus-rog-scar-18",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 4. Tissuekart - Custom Printed Napkins & Hygiene Products
  {
    title: "Tissuekart Custom Printed 2-Ply Restaurant Cocktail Napkins (Pack of 5000)",
    name: "Tissuekart Custom Printed 2-Ply Restaurant Cocktail Napkins (Pack of 5000)",
    brand: "Tissuekart",
    sellerSlug: "tissuekart",
    portfolioSlug: "tissuekart",
    modelName: "TK Custom Napkin 2-Ply",
    sku: "TK-NAP-5000",
    shortDesc: "Custom embossed brand logo printed cocktail paper napkins for cafes, bars, hotels, and luxury catering events.",
    description: "Made from 100% food-grade virgin wood pulp with high absorbency and lint-free texture. Safe organic non-toxic soy ink printing with custom merchant logo branding.",
    price: 2199,
    originalPrice: 2899,
    discount: "24% OFF",
    inventory: 150,
    category: "Hygiene & Custom Paper Products",
    type: "Product",
    city: "Mumbai",
    state: "Maharashtra",
    images: [
      { url: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800&q=80", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80", isPrimary: false }
    ],
    specs: [
      { key: "Quantity", value: "5000 Napkins per Box" },
      { key: "Ply", value: "2-Ply Extra Soft" },
      { key: "Print Color", value: "Single / Multi-Color Custom Logo" },
      { key: "Size", value: "25cm x 25cm Unfolded" }
    ],
    aiKeywords: ["tissue", "napkin", "paper napkin", "custom print", "hospitality", "tissuekart"],
    aiVisibility: 95,
    aiSubtext: "B2B Hospitality Grade",
    badgeType: "verified",
    sourceUrl: "https://tissuekart.com/products/custom-napkins",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const SEED_PORTFOLIOS: any[] = [
  {
    slug: "anv-reealty",
    companyName: "ANV REEALTY",
    ownerName: "Abhijit V. (Director & Founder)",
    businessType: "Grade-A Commercial & Residential Real Estate Advisory",
    yearEstablished: "2016",
    tagline: "Pune's Premier Commercial Real Estate Advisory & MahaRERA Certified Hub",
    about: "ANV REEALTY is Pune's leading real estate advisory specializing in Grade-A commercial office space in Magarpatta, EON IT Park Kharadi, Baner, and luxury residential developments with complete MahaRERA compliance.",
    logo: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&q=80",
    bannerImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
    address: "Shop 104-106, Prime Tech Park, Magarpatta City",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411028",
    country: "India",
    gstin: "A52100000055",
    phone: "+91 97661 37115",
    whatsapp: "919766137115",
    email: "contact@anvreealty.com",
    website: "https://anvreealty.com",
    rating: 4.9,
    totalReviews: 210,
    specialities: [
      { id: "spec-1", title: "Grade-A IT Office Space", description: "Furnished plug-and-play offices in EON Kharadi & Magarpatta." },
      { id: "spec-2", title: "Pre-Leased Commercial Assets", description: "High 7.5% - 9% rental yield assets with corporate tenants." },
      { id: "spec-3", title: "MahaRERA Advisory", description: "100% verified legal documentation and title clearances." }
    ],
    isPublished: true
  },
  {
    slug: "anvreeality",
    companyName: "ANV REEALTY",
    ownerName: "Abhijit V. (Director & Founder)",
    businessType: "Grade-A Commercial & Residential Real Estate Advisory",
    yearEstablished: "2016",
    tagline: "Pune's Premier Commercial Real Estate Advisory & MahaRERA Certified Hub",
    about: "ANV REEALTY is Pune's leading real estate advisory specializing in Grade-A commercial office space in Magarpatta, EON IT Park Kharadi, Baner, and luxury residential developments with complete MahaRERA compliance.",
    logo: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&q=80",
    bannerImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
    address: "Shop 104-106, Prime Tech Park, Magarpatta City",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411028",
    country: "India",
    gstin: "A52100000055",
    phone: "+91 97661 37115",
    whatsapp: "919766137115",
    email: "contact@anvreealty.com",
    website: "https://anvreealty.com",
    rating: 4.9,
    totalReviews: 210,
    specialities: [
      { id: "spec-1", title: "Grade-A IT Office Space", description: "Furnished plug-and-play offices in EON Kharadi & Magarpatta." },
      { id: "spec-2", title: "Pre-Leased Commercial Assets", description: "High 7.5% - 9% rental yield assets with corporate tenants." }
    ],
    isPublished: true
  },
  {
    slug: "ayurmor",
    companyName: "Ayurmor (Saish Technofarms)",
    ownerName: "Saish Mor (Founder & Managing Director)",
    businessType: "Certified Organic Ayurvedic & Botanical Healthcare Products",
    yearEstablished: "2018",
    tagline: "100% Pure Organic Ayurvedic Wellness & Cultivated Superfood Mixes",
    about: "Saish Technofarms Ayurmor produces certified pure organic Moringa powder, Oyster mushroom immunity booster soup blends, KSM-66 Ashwagandha vitality mix, and nutrient-dense sprouted millet malts.",
    logo: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=200&q=80",
    bannerImage: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1600&q=80",
    address: "Saish Technofarms Agro Park, Pune-Solapur Highway",
    city: "Pune",
    state: "Maharashtra",
    pincode: "412201",
    country: "India",
    gstin: "27AAYFA8821B1Z3",
    phone: "+91 89032 16178",
    whatsapp: "918903216178",
    email: "support@ayurmor.com",
    website: "https://ayurmor.com",
    rating: 4.9,
    totalReviews: 48,
    specialities: [
      { id: "spec-1", title: "Pure Organic Moringa Superfood", description: "Cold-processed drumstick leaf powder with 90+ vital nutrients." },
      { id: "spec-2", title: "Oyster Mushroom Immunity Soup", description: "High beta-glucan herbal mushroom soup with Himalayan pink salt." },
      { id: "spec-3", title: "KSM-66 Ashwagandha & Sprouted Malts", description: "Ancient adaptogenic Ayurvedic Rasayana formulation." }
    ],
    isPublished: true
  },
  {
    slug: "abc-electronics",
    companyName: "ABC Electronics & IT Solutions",
    ownerName: "Rohit Sharma (Technical Director)",
    businessType: "High-Performance Computing, Custom AI Rigs & Gaming Laptops",
    yearEstablished: "2017",
    tagline: "Authorized ASUS ROG Partner & Custom Liquid-Cooled AI Workstation Hub",
    about: "ABC Electronics is a premier tech destination specializing in custom liquid-cooled NVIDIA RTX 4080/4090 AI workstations, ASUS ROG Strix gaming laptops, and high-performance IT components with full brand warranty.",
    logo: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=200&q=80",
    bannerImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&q=80",
    address: "Shop 24, Prime IT Plaza, Lamington Road",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400007",
    country: "India",
    gstin: "27AABCU9912E1Z8",
    phone: "+91 98200 12345",
    whatsapp: "919820012345",
    email: "sales@abcelectronics.com",
    website: "https://abcelectronics.com",
    rating: 4.8,
    totalReviews: 94,
    specialities: [
      { id: "spec-1", title: "Liquid-Cooled AI Workstations", description: "Custom built with Intel i9 14900K and RTX 4080 Super." },
      { id: "spec-2", title: "Official ASUS ROG Partner", description: "Authorized brand warranty on SCAR 18 and Zephyrus gaming laptops." }
    ],
    isPublished: true
  },
  {
    slug: "tissuekart",
    companyName: "Tissuekart",
    ownerName: "Manish Agrawal (Founder)",
    businessType: "Commercial Paper Products & Custom Printed Napkins",
    yearEstablished: "2019",
    tagline: "Direct Manufacturer of Custom Logo Printed Paper Napkins & Tissue Products",
    about: "Tissuekart delivers high-absorbency, 100% virgin food-grade paper napkins and custom logo printed cocktail napkins for restaurants, luxury hotels, corporate caterers, and events.",
    logo: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=200&q=80",
    bannerImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1600&q=80",
    address: "Unit 12, Industrial Estate, Lower Parel",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400013",
    country: "India",
    gstin: "27AABCT4411C1Z4",
    phone: "+91 98200 12345",
    whatsapp: "919820012345",
    email: "contact@tissuekart.com",
    website: "https://tissuekart.com",
    rating: 4.7,
    totalReviews: 32,
    specialities: [
      { id: "spec-1", title: "Custom Logo Embossed Napkins", description: "High-definition soy ink printing for hospitality and restaurants." },
      { id: "spec-2", title: "Bulk B2B Commercial Dispatch", description: "Direct pan-India delivery for 5000+ box orders." }
    ],
    isPublished: true
  },
  {
    slug: "seller-store",
    companyName: "Seller Store",
    ownerName: "Verified Store Manager",
    businessType: "Verified Enterprise Merchant & Service Provider",
    yearEstablished: "2021",
    tagline: "Verified Products & Services on TrueDeal Marketplace",
    about: "Seller Store provides authentic, high-quality offerings with dedicated customer support, authorized brand warranties, and express pan-India fulfillment.",
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80",
    bannerImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
    address: "Shop 104-106, Prime Tech Park, Lamington Road",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    country: "India",
    phone: "+91 98200 12345",
    whatsapp: "919820012345",
    email: "seller@company.com",
    website: "https://sellerstore.com",
    rating: 4.9,
    totalReviews: 24,
    specialities: [
      { id: "spec-1", title: "Verified Genuine Offerings", description: "Direct warranty & 100% authentic inventory." },
      { id: "spec-2", title: "Express Fulfillment", description: "Dedicated customer support and real-time tracking." }
    ],
    isPublished: true
  }
];

/**
 * Ensures MongoDB products and portfolios collections have authentic marketplace catalog items.
 */
export async function ensureSeedProductsInDatabase() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Seed portfolios
    for (const port of SEED_PORTFOLIOS) {
      await db.collection("portfolios").updateOne(
        { slug: port.slug },
        { $set: { ...port, updatedAt: new Date() } },
        { upsert: true }
      );
      if (port.slug === "ayurmor") {
        await db.collection("portfolios").updateOne(
          { slug: "ayurmor-more" },
          { $set: { ...port, slug: "ayurmor-more", updatedAt: new Date() } },
          { upsert: true }
        );
      }
    }

    // Seed products into their dedicated seller collections
    for (const prod of SEED_PRODUCTS) {
      const col = await getSellerProductsCollection(prod.sellerSlug);
      await col.updateOne(
        { title: prod.title },
        { $set: { ...prod, updatedAt: new Date() } },
        { upsert: true }
      );
      if (prod.sellerSlug === "ayurmor") {
        await db.collection("products_ayurmor_more").updateOne(
          { title: prod.title },
          { $set: { ...prod, portfolioSlug: "ayurmor-more", sellerSlug: "ayurmor-more", updatedAt: new Date() } },
          { upsert: true }
        );
      }
    }
  } catch (err: any) {
    console.warn("Notice checking/seeding marketplace catalog:", err.message);
  }
}
