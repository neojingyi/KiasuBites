import {
  User,
  Vendor,
  SurpriseBag,
  Order,
  UserRole,
  VendorStats,
  WeeklyAvailability,
  VendorBusinessInfo,
  VendorSettings,
  PayoutOverview,
  PayoutMethod,
  MonthlyStatement,
  DailyInvoice,
  PartnerDetails,
  EmailSettings,
  LegalDocument,
  ImpactEstimate,
  ImpactConfig,
} from "../types";
import pastriesPic from "../assets/pastries_pic.jpg";
import sushiroPic from "../assets/sushiro.png";
import saladPic from "../assets/salad_pic.jpg";

// Initial Mock Data
const MOCK_VENDORS: Vendor[] = [
  {
    id: "v1",
    name: "Bread & Butter Bakery",
    address: "123 Tanjong Pagar Rd",
    lat: 1.31,
    lng: 103.92, // East - Simei
    category: "Bakery",
    rating: 4.8,
    totalReviews: 120,
    tags: ["Vegetarian", "Halal-Friendly"],
    photoUrl: pastriesPic,
    pickupInstructions: "Show code at counter.",
    availability: {
      mon: {
        available: true,
        pickupStart: "18:00",
        pickupEnd: "19:00",
        defaultQuantity: 5,
      },
      tue: {
        available: true,
        pickupStart: "18:00",
        pickupEnd: "19:00",
        defaultQuantity: 5,
      },
      wed: {
        available: true,
        pickupStart: "18:00",
        pickupEnd: "19:00",
        defaultQuantity: 5,
      },
      thu: {
        available: true,
        pickupStart: "18:00",
        pickupEnd: "19:00",
        defaultQuantity: 5,
      },
      fri: {
        available: true,
        pickupStart: "18:00",
        pickupEnd: "19:00",
        defaultQuantity: 8,
      },
      sat: {
        available: false,
        pickupStart: "15:00",
        pickupEnd: "16:00",
        defaultQuantity: 0,
      },
      sun: {
        available: false,
        pickupStart: "15:00",
        pickupEnd: "16:00",
        defaultQuantity: 0,
      },
    },
  },
  {
    id: "v2",
    name: "Sushi Zen",
    address: "45 Orchard Blvd",
    lat: 1.3048,
    lng: 103.8318, // Central - Orchard
    category: "Japanese",
    rating: 4.5,
    totalReviews: 85,
    tags: ["Seafood", "Rice"],
    photoUrl: sushiroPic,
    pickupInstructions: "Enter from side door after 9pm.",
  },
  {
    id: "v3",
    name: "Daily Green Salad",
    address: "10 Raffles Place",
    lat: 1.263,
    lng: 103.821, // South - Harbourfront
    category: "Restaurant",
    rating: 4.2,
    totalReviews: 45,
    tags: ["Vegan", "Healthy", "Gluten-Free"],
    photoUrl: saladPic,
    pickupInstructions: "Collect at the cashier.",
  },
  {
    id: "v4",
    name: "Golden Wok",
    address: "78 Marina Bay Link",
    lat: 1.355,
    lng: 103.945, // East - Tampines
    category: "Chinese",
    rating: 4.6,
    totalReviews: 156,
    tags: ["Vegetarian", "Halal-Friendly"],
    photoUrl: pastriesPic,
    pickupInstructions: "Back entrance, ring bell.",
  },
  {
    id: "v5",
    name: "Spice Route",
    address: "22 Little India Arcade",
    lat: 1.4269,
    lng: 103.8403, // North - Woodlands
    category: "Indian",
    rating: 4.7,
    totalReviews: 203,
    tags: ["Vegetarian", "Halal-Friendly"],
    photoUrl: saladPic,
    pickupInstructions: "Main counter, show confirmation.",
  },
  {
    id: "v6",
    name: "K-BBQ Express",
    address: "15 Orchard Road",
    lat: 1.323,
    lng: 103.93, // East - Bedok
    category: "Korean",
    rating: 4.4,
    totalReviews: 98,
    tags: ["Meat", "Rice"],
    photoUrl: sushiroPic,
    pickupInstructions: "Side door after 8pm.",
  },
  {
    id: "v7",
    name: "Pasta Paradise",
    address: "88 Robertson Quay",
    lat: 1.3305,
    lng: 103.7764, // West - Clementi
    category: "Italian",
    rating: 4.5,
    totalReviews: 127,
    tags: ["Vegetarian", "Gluten-Free"],
    photoUrl: pastriesPic,
    pickupInstructions: "Kitchen entrance, call ahead.",
  },
  {
    id: "v8",
    name: "Sweet Dreams Desserts",
    address: "5 Clarke Quay",
    lat: 1.34,
    lng: 103.98, // East - Changi
    category: "Dessert",
    rating: 4.8,
    totalReviews: 189,
    tags: ["Vegetarian", "Halal-Friendly"],
    photoUrl: saladPic,
    pickupInstructions: "Front counter, mention KiasuBites.",
  },
  {
    id: "v9",
    name: "Fresh Market Co",
    address: "33 Tiong Bahru Plaza",
    lat: 1.3256,
    lng: 103.7425, // West - Jurong East
    category: "Groceries",
    rating: 4.3,
    totalReviews: 67,
    tags: ["Vegetarian", "Vegan", "Organic"],
    photoUrl: pastriesPic,
    pickupInstructions: "Customer service desk.",
  },
  {
    id: "v10",
    name: "Burger Junction",
    address: "12 Holland Village",
    lat: 1.3117,
    lng: 103.7958, // West - Holland Village
    category: "Fast Food",
    rating: 4.1,
    totalReviews: 92,
    tags: ["Meat", "Vegetarian"],
    photoUrl: sushiroPic,
    pickupInstructions: "Drive-thru or counter pickup.",
  },
  {
    id: "v11",
    name: "Tea Time Bakery",
    address: "67 Jurong West",
    lat: 1.3456,
    lng: 103.7056, // Far West - Jurong
    category: "Bakery",
    rating: 4.6,
    totalReviews: 134,
    tags: ["Vegetarian", "Halal-Friendly"],
    photoUrl: pastriesPic,
    pickupInstructions: "Back counter after 7pm.",
  },
  {
    id: "v12",
    name: "Noodle House",
    address: "29 Chinatown Point",
    lat: 1.365,
    lng: 103.955, // East - Pasir Ris
    category: "Chinese",
    rating: 4.4,
    totalReviews: 178,
    tags: ["Vegetarian", "Halal-Friendly"],
    photoUrl: saladPic,
    pickupInstructions: "Main entrance, show code.",
  },
];

const MOCK_BAGS: SurpriseBag[] = [
  {
    id: "b1",
    vendorId: "v1",
    vendorName: "Bread & Butter Bakery",
    vendorCategory: "Bakery",
    title: "Pastry Surprise",
    description: "A mix of croissants, danishes, and muffins.",
    price: 4.5,
    originalPrice: 12.0,
    pickupStart: "20:00",
    pickupEnd: "21:30",
    quantity: 5,
    dietaryTags: ["Vegetarian"],
    status: "active",
    category: "Bread & Pastries",
    imageUrl:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=600&fit=crop",
  },
  {
    id: "b2",
    vendorId: "v2",
    vendorName: "Sushi Zen",
    vendorCategory: "Japanese",
    title: "Sushi Platter Ends",
    description: "Assorted sushi rolls and nigiri.",
    price: 4.8,
    originalPrice: 14.0,
    pickupStart: "21:30",
    pickupEnd: "22:30",
    quantity: 2,
    dietaryTags: ["Seafood"],
    status: "active",
    category: "Meals",
    imageUrl:
      "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop",
  },
  {
    id: "b3",
    vendorId: "v3",
    vendorName: "Daily Green Salad",
    vendorCategory: "Restaurant",
    title: "Healthy Salad Mix",
    description: "Fresh salad bases and toppings.",
    price: 3.5,
    originalPrice: 10.0,
    pickupStart: "14:00",
    pickupEnd: "15:00",
    quantity: 8,
    dietaryTags: ["Vegan", "Gluten-Free"],
    status: "active",
    category: "Meals",
    imageUrl:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
  },
  {
    id: "b4",
    vendorId: "v1",
    vendorName: "Bread & Butter Bakery",
    vendorCategory: "Bakery",
    title: "Morning Bread Bundle",
    description: "Assorted fresh breads and rolls.",
    price: 4.5,
    originalPrice: 12.0,
    pickupStart: "19:00",
    pickupEnd: "20:30",
    quantity: 6,
    dietaryTags: ["Vegetarian"],
    status: "active",
    category: "Bread & Pastries",
    imageUrl:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop",
  },
  {
    id: "b5",
    vendorId: "v4",
    vendorName: "Golden Wok",
    vendorCategory: "Chinese",
    title: "Dim Sum Surprise",
    description: "Mixed dim sum selection.",
    price: 4.2,
    originalPrice: 13.0,
    pickupStart: "20:00",
    pickupEnd: "21:00",
    quantity: 4,
    dietaryTags: ["Vegetarian"],
    status: "active",
    category: "Meals",
    imageUrl:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop",
  },
  {
    id: "b6",
    vendorId: "v5",
    vendorName: "Spice Route",
    vendorCategory: "Indian",
    title: "Curry Combo",
    description: "Assorted curries with rice and naan.",
    price: 4.9,
    originalPrice: 15.0,
    pickupStart: "21:00",
    pickupEnd: "22:00",
    quantity: 5,
    dietaryTags: ["Vegetarian"],
    status: "active",
    category: "Meals",
    imageUrl:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop",
  },
  {
    id: "b7",
    vendorId: "v6",
    vendorName: "K-BBQ Express",
    vendorCategory: "Korean",
    title: "Korean BBQ Set",
    description: "Marinated meats with banchan sides.",
    price: 5.0,
    originalPrice: 16.0,
    pickupStart: "21:30",
    pickupEnd: "22:30",
    quantity: 3,
    dietaryTags: ["Meat"],
    status: "active",
    category: "Meals",
    imageUrl:
      "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&h=600&fit=crop",
  },
  {
    id: "b8",
    vendorId: "v7",
    vendorName: "Pasta Paradise",
    vendorCategory: "Italian",
    title: "Pasta Variety Pack",
    description: "Mixed pasta dishes with sauces.",
    price: 4.0,
    originalPrice: 12.0,
    pickupStart: "20:30",
    pickupEnd: "21:30",
    quantity: 6,
    dietaryTags: ["Vegetarian"],
    status: "active",
    category: "Meals",
    imageUrl:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop",
  },
  {
    id: "b9",
    vendorId: "v8",
    vendorName: "Sweet Dreams Desserts",
    vendorCategory: "Dessert",
    title: "Dessert Sampler",
    description: "Assorted cakes, cookies, and pastries.",
    price: 4.5,
    originalPrice: 12.0,
    pickupStart: "19:00",
    pickupEnd: "20:00",
    quantity: 7,
    dietaryTags: ["Vegetarian"],
    status: "active",
    category: "Dessert",
    imageUrl:
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&h=600&fit=crop",
  },
  {
    id: "b10",
    vendorId: "v9",
    vendorName: "Fresh Market Co",
    vendorCategory: "Groceries",
    title: "Fresh Produce Box",
    description: "Mixed vegetables and fruits.",
    price: 3.5,
    originalPrice: 10.0,
    pickupStart: "18:00",
    pickupEnd: "19:00",
    quantity: 10,
    dietaryTags: ["Vegetarian", "Vegan"],
    status: "active",
    category: "Groceries",
    imageUrl:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop",
  },
  {
    id: "b11",
    vendorId: "v10",
    vendorName: "Burger Junction",
    vendorCategory: "Fast Food",
    title: "Burger Combo Pack",
    description: "Assorted burgers and sides.",
    price: 4.8,
    originalPrice: 14.0,
    pickupStart: "21:00",
    pickupEnd: "22:00",
    quantity: 4,
    dietaryTags: ["Meat"],
    status: "active",
    category: "Meals",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
  },
  {
    id: "b12",
    vendorId: "v11",
    vendorName: "Tea Time Bakery",
    vendorCategory: "Bakery",
    title: "Afternoon Tea Set",
    description: "Scones, sandwiches, and pastries.",
    price: 3.9,
    originalPrice: 11.0,
    pickupStart: "17:00",
    pickupEnd: "18:00",
    quantity: 5,
    dietaryTags: ["Vegetarian"],
    status: "active",
    category: "Bread & Pastries",
    imageUrl:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=600&fit=crop",
  },
  {
    id: "b13",
    vendorId: "v12",
    vendorName: "Noodle House",
    vendorCategory: "Chinese",
    title: "Noodle Variety Pack",
    description: "Mixed noodle dishes.",
    price: 4.2,
    originalPrice: 13.0,
    pickupStart: "20:00",
    pickupEnd: "21:00",
    quantity: 6,
    dietaryTags: ["Vegetarian"],
    status: "active",
    category: "Meals",
    imageUrl:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop",
  },
  {
    id: "b14",
    vendorId: "v2",
    vendorName: "Sushi Zen",
    vendorCategory: "Japanese",
    title: "Sashimi Selection",
    description: "Fresh sashimi platter.",
    price: 5.0,
    originalPrice: 16.0,
    pickupStart: "22:00",
    pickupEnd: "23:00",
    quantity: 2,
    dietaryTags: ["Seafood"],
    status: "active",
    category: "Meals",
    imageUrl:
      "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop",
  },
  {
    id: "b15",
    vendorId: "v4",
    vendorName: "Golden Wok",
    vendorCategory: "Chinese",
    title: "Rice Bowl Mix",
    description: "Various rice bowl combinations.",
    price: 3.8,
    originalPrice: 11.0,
    pickupStart: "19:30",
    pickupEnd: "20:30",
    quantity: 7,
    dietaryTags: ["Vegetarian"],
    status: "active",
    category: "Meals",
    imageUrl:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop",
  },
  {
    id: "b16",
    vendorId: "v8",
    vendorName: "Sweet Dreams Desserts",
    vendorCategory: "Dessert",
    title: "Cake Slice Collection",
    description: "Assorted cake slices.",
    price: 5.0,
    originalPrice: 12.0,
    pickupStart: "18:30",
    pickupEnd: "19:30",
    quantity: 8,
    dietaryTags: ["Vegetarian"],
    status: "active",
    category: "Dessert",
    imageUrl:
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&h=600&fit=crop",
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const KEYS = {
  USERS: "kiasubites_users",
  VENDORS: "kiasubites_vendors",
  BAGS: "kiasubites_bags",
  ORDERS: "kiasubites_orders",
  CURRENT_USER: "kiasubites_current_user",
  PAYOUT_METHODS: "kiasubites_payout_methods",
  PARTNER_DETAILS: "kiasubites_partner_details",
  EMAIL_SETTINGS: "kiasubites_email_settings",
};

const initStorage = () => {
  // Always update vendors to ensure latest images are used
  const existingVendors = localStorage.getItem(KEYS.VENDORS);
  if (!existingVendors) {
    localStorage.setItem(KEYS.VENDORS, JSON.stringify(MOCK_VENDORS));
  } else {
    // Always update existing vendors with latest data (photoUrl, coordinates, etc.)
    const vendors: Vendor[] = JSON.parse(existingVendors);
    const vendorMap = new Map<string, Vendor>(
      vendors.map((v: Vendor) => [v.id, v])
    );

    // Update existing vendors and add new ones
    MOCK_VENDORS.forEach((mockVendor) => {
      const existing = vendorMap.get(mockVendor.id);
      if (existing) {
        // Update with latest mock data but preserve businessInfo and settings if they exist
        vendorMap.set(mockVendor.id, {
          ...mockVendor,
          businessInfo: existing.businessInfo,
          settings: existing.settings,
          availability: existing.availability || mockVendor.availability,
        });
      } else {
        // Add new vendor
        vendorMap.set(mockVendor.id, mockVendor);
      }
    });

    localStorage.setItem(
      KEYS.VENDORS,
      JSON.stringify(Array.from(vendorMap.values()))
    );
  }
  // Always update bags to ensure latest data is used
  const existingBags = localStorage.getItem(KEYS.BAGS);
  if (!existingBags) {
    localStorage.setItem(KEYS.BAGS, JSON.stringify(MOCK_BAGS));
  } else {
    // Merge existing bags with new ones, updating existing and adding new
    const bags: SurpriseBag[] = JSON.parse(existingBags);
    const bagMap = new Map<string, SurpriseBag>(
      bags.map((b: SurpriseBag) => [b.id, b])
    );

    // Update existing bags and add new ones
    MOCK_BAGS.forEach((mockBag) => {
      const existing = bagMap.get(mockBag.id);
      if (existing) {
        // Update existing bag with latest data but keep order status
        bagMap.set(mockBag.id, {
          ...existing,
          ...mockBag,
          status: existing.status,
          imageUrl: mockBag.imageUrl || existing.imageUrl, // Ensure imageUrl is updated
        });
      } else {
        // Add new bag
        bagMap.set(mockBag.id, mockBag);
      }
    });

    localStorage.setItem(
      KEYS.BAGS,
      JSON.stringify(Array.from(bagMap.values()))
    );
  }
  if (!localStorage.getItem(KEYS.ORDERS)) {
    // Add some mock past orders with ratings
    const pastOrders: Order[] = [
      {
        id: "o-past-1",
        consumerId: "c1",
        bagId: "b1",
        vendorId: "v1",
        bagTitle: "Pastry Surprise",
        vendorName: "Bread & Butter Bakery",
        quantity: 1,
        totalPrice: 5.5,
        estimatedValue: 15.0,
        status: "picked_up",
        pickupStart: "20:00",
        pickupEnd: "21:30",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        confirmationCode: "ABC12",
        rating: 5,
        review: "Delicious and great value!",
      },
    ];
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(pastOrders));
  }
};

initStorage();

export const api = {
  // Auth
  login: async (email: string, role: UserRole): Promise<User> => {
    await delay(600);
    // Simulating user retrieval
    const existingUser = localStorage.getItem(KEYS.CURRENT_USER);
    let user = existingUser ? JSON.parse(existingUser) : null;
    
    // If mocking a fresh login for vendor, check verification status
    if (!user || user.role !== role) {
       user = {
        id: role === UserRole.VENDOR ? "v1" : "c1",
        name: role === UserRole.VENDOR ? "Bread & Butter Bakery" : "Alex Wang",
        email,
        role,
        dietaryPreferences: [],
        radiusKm: 5,
        favorites: [],
        isVerified: role === UserRole.VENDOR ? false : undefined, // Default unverified for demo
      };
      
      // If V1 login, check if actually verified in mock vendor DB
      if (role === UserRole.VENDOR) {
        const vendors = JSON.parse(localStorage.getItem(KEYS.VENDORS) || "[]");
        const v = vendors.find((v: Vendor) => v.id === "v1");
         if (v && v.businessInfo) user.isVerified = true;
      }
    }
    
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  },

  logout: async () => {
    await delay(200);
    localStorage.removeItem(KEYS.CURRENT_USER);
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  updateUser: async (updates: Partial<User>): Promise<User> => {
    await delay(300);
    const user = api.getCurrentUser();
    if (!user) throw new Error("No user");
    const updated = { ...user, ...updates };
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(updated));
    return updated;
  },

  toggleFavorite: async (vendorId: string): Promise<User> => {
    await delay(200);
    const user = api.getCurrentUser();
    if (!user) throw new Error("No user");
    
    const favorites = user.favorites || [];
    const newFavorites = favorites.includes(vendorId) 
      ? favorites.filter((id) => id !== vendorId)
      : [...favorites, vendorId];
    
    const updated = { ...user, favorites: newFavorites };
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(updated));
    return updated;
  },

  // Consumer
  getBags: async (): Promise<SurpriseBag[]> => {
    await delay(400);
    const bags = JSON.parse(localStorage.getItem(KEYS.BAGS) || "[]");
    return bags.filter(
      (b: SurpriseBag) => b.status === "active" && b.quantity > 0
    );
  },

  getVendors: async (): Promise<Vendor[]> => {
    await delay(400);
    return JSON.parse(localStorage.getItem(KEYS.VENDORS) || "[]");
  },

  getBagById: async (id: string): Promise<SurpriseBag | undefined> => {
    await delay(300);
    const bags = JSON.parse(localStorage.getItem(KEYS.BAGS) || "[]");
    return bags.find((b: SurpriseBag) => b.id === id);
  },

  getVendorById: async (id: string): Promise<Vendor | undefined> => {
     await delay(300);
    const vendors = JSON.parse(localStorage.getItem(KEYS.VENDORS) || "[]");
     return vendors.find((v: Vendor) => v.id === id);
  },

  getFavoriteVendors: async (
    userId: string
  ): Promise<{ vendor: Vendor; bags: SurpriseBag[] }[]> => {
     await delay(500);
     const user = api.getCurrentUser();
    const allVendors = JSON.parse(localStorage.getItem(KEYS.VENDORS) || "[]");
    const allBags = JSON.parse(localStorage.getItem(KEYS.BAGS) || "[]");

     const favs = user?.favorites || [];
     const vendors = allVendors.filter((v: Vendor) => favs.includes(v.id));
     
     return vendors.map((v: Vendor) => ({
       vendor: v,
      bags: allBags.filter(
        (b: SurpriseBag) => b.vendorId === v.id && b.status === "active"
      ),
     }));
  },

  createOrder: async (
    bagId: string,
    quantity: number,
    user: User
  ): Promise<Order> => {
    await delay(800);
    const bags = JSON.parse(localStorage.getItem(KEYS.BAGS) || "[]");
    const bagIndex = bags.findIndex((b: SurpriseBag) => b.id === bagId);

    if (bagIndex === -1 || bags[bagIndex].quantity < quantity) {
      throw new Error("Bag unavailable");
    }

    bags[bagIndex].quantity -= quantity;
    if (bags[bagIndex].quantity === 0) bags[bagIndex].status = "sold_out";
    localStorage.setItem(KEYS.BAGS, JSON.stringify(bags));

    const bag = bags[bagIndex];
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      consumerId: user.id,
      bagId: bag.id,
      vendorId: bag.vendorId,
      bagTitle: bag.title,
      vendorName: bag.vendorName,
      quantity,
      totalPrice: bag.price * quantity,
      estimatedValue: bag.originalPrice * quantity,
      status: "reserved",
      pickupStart: bag.pickupStart,
      pickupEnd: bag.pickupEnd,
      createdAt: new Date().toISOString(),
      confirmationCode: Math.random().toString(36).substr(2, 5).toUpperCase(),
    };

    const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || "[]");
    orders.push(newOrder);
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));

    return newOrder;
  },

  getConsumerOrders: async (userId: string): Promise<Order[]> => {
    await delay(500);
    const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || "[]");
    return orders.filter((o: Order) => o.consumerId === userId).reverse();
  },

  rateOrder: async (
    orderId: string,
    rating: number,
    review: string
  ): Promise<void> => {
    await delay(500);
    const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || "[]");
    const index = orders.findIndex((o: Order) => o.id === orderId);
    if (index !== -1) {
      orders[index].rating = rating;
      orders[index].review = review;
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    }
  },

  // Vendor Logic
  verifyVendorBusiness: async (
    vendorId: string,
    info: VendorBusinessInfo
  ): Promise<void> => {
    await delay(1000);
    const vendors = JSON.parse(localStorage.getItem(KEYS.VENDORS) || "[]");
    const index = vendors.findIndex((v: Vendor) => v.id === vendorId);
    if (index !== -1) {
      vendors[index].businessInfo = info;
      localStorage.setItem(KEYS.VENDORS, JSON.stringify(vendors));
      
      // Update session user to verified
      const currentUser = api.getCurrentUser();
      if (currentUser && currentUser.role === UserRole.VENDOR) {
        currentUser.isVerified = true;
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(currentUser));
      }
    }
  },

  updateVendorAvailability: async (
    vendorId: string,
    availability: WeeklyAvailability
  ): Promise<void> => {
    await delay(500);
    const vendors = JSON.parse(localStorage.getItem(KEYS.VENDORS) || "[]");
    const index = vendors.findIndex((v: Vendor) => v.id === vendorId);
    if (index !== -1) {
      vendors[index].availability = availability;
      localStorage.setItem(KEYS.VENDORS, JSON.stringify(vendors));
    }
  },

  updateVendorSettings: async (
    vendorId: string,
    settings: VendorSettings
  ): Promise<void> => {
    await delay(500);
    const vendors = JSON.parse(localStorage.getItem(KEYS.VENDORS) || "[]");
    const index = vendors.findIndex((v: Vendor) => v.id === vendorId);
    if (index !== -1) {
      vendors[index].settings = settings;
      localStorage.setItem(KEYS.VENDORS, JSON.stringify(vendors));
    }
  },

  getVendorStats: async (vendorId: string): Promise<VendorStats> => {
    await delay(400);
    return {
      todaySales: 12,
      totalMealsSaved: 145,
      revenueThisMonth: 850.5,
      pickupRate: 98,
      avgRating: 4.7,
      salesHistory: [
        { date: "Mon", amount: 45, bagsSold: 8 },
        { date: "Tue", amount: 52, bagsSold: 10 },
        { date: "Wed", amount: 38, bagsSold: 6 },
        { date: "Thu", amount: 65, bagsSold: 12 },
        { date: "Fri", amount: 80, bagsSold: 15 },
        { date: "Sat", amount: 95, bagsSold: 18 },
        { date: "Sun", amount: 70, bagsSold: 13 },
      ],
      payouts: [
        {
          date: "2023-10-31",
          period: "Oct 1-31",
          gross: 850.5,
          fees: 85.05,
          net: 765.45,
          status: "Upcoming",
        },
        {
          date: "2023-09-30",
          period: "Sep 1-30",
          gross: 720.0,
          fees: 72.0,
          net: 648.0,
          status: "Paid",
        },
      ],
    };
  },

  getVendorReviews: async (vendorId: string): Promise<Order[]> => {
     await delay(500);
    const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || "[]");
     // In a real app we'd join user names, but mock Order has consumerId. 
     // We will filter orders for this vendor that have ratings.
    return orders
      .filter((o: Order) => o.vendorId === vendorId && o.rating)
      .reverse();
  },

  getVendorBags: async (vendorId: string): Promise<SurpriseBag[]> => {
    await delay(500);
    const bags = JSON.parse(localStorage.getItem(KEYS.BAGS) || "[]");
    return bags.filter((b: SurpriseBag) => b.vendorId === vendorId); // Fixed filtering
  },

  createBag: async (bag: Omit<SurpriseBag, "id">): Promise<SurpriseBag> => {
    await delay(800);
    const newBag = { ...bag, id: Math.random().toString(36).substr(2, 9) };
    const bags = JSON.parse(localStorage.getItem(KEYS.BAGS) || "[]");
    bags.push(newBag);
    localStorage.setItem(KEYS.BAGS, JSON.stringify(bags));
    return newBag;
  },

  getVendorOrders: async (vendorId: string): Promise<Order[]> => {
    await delay(500);
    const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || "[]");
    return orders.filter((o: Order) => o.vendorId === vendorId).reverse();
  },

  updateOrderStatus: async (
    orderId: string,
    status: Order["status"]
  ): Promise<void> => {
    await delay(400);
    const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || "[]");
    const index = orders.findIndex((o: Order) => o.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    }
  },

  // Financial APIs
  getPayoutOverview: async (vendorId: string): Promise<PayoutOverview> => {
    await delay(400);
    const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || "[]");
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Calculate current month's accrued amount
    const currentMonthOrders = orders.filter((o: Order) => {
      if (o.vendorId !== vendorId || o.status !== "picked_up") return false;
      const orderDate = new Date(o.createdAt);
      return (
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      );
    });

    const grossRevenue = currentMonthOrders.reduce(
      (sum: number, o: Order) => sum + o.totalPrice,
      0
    );
    const platformFee = grossRevenue * 0.1; // 10% platform fee
    const currentAccrued = grossRevenue - platformFee;

    // Get payout method
    const payoutMethods = JSON.parse(
      localStorage.getItem(KEYS.PAYOUT_METHODS) || "{}"
    );
    const payoutMethod = payoutMethods[vendorId];

    // Calculate next payout date (first day of next month)
    const nextPayoutDate = new Date(currentYear, currentMonth + 1, 1);

    return {
      currentAccrued: Math.max(0, currentAccrued),
      payoutCycle: "Monthly",
      minimumThreshold: 50,
      nextPayoutDate: nextPayoutDate.toISOString(),
      payoutMethod: payoutMethod || undefined,
    };
  },

  savePayoutMethod: async (
    vendorId: string,
    method: Partial<PayoutMethod>
  ): Promise<void> => {
    await delay(500);
    const payoutMethods = JSON.parse(
      localStorage.getItem(KEYS.PAYOUT_METHODS) || "{}"
    );
    const existingMethod = payoutMethods[vendorId];

    const newMethod: PayoutMethod = {
      id: existingMethod?.id || Math.random().toString(36).substr(2, 9),
      type: "bank_account",
      bankName: method.bankName || "",
      accountNumber: method.accountNumber || "",
      accountHolderName: method.accountHolderName || "",
      isDefault: true,
    };

    payoutMethods[vendorId] = newMethod;
    localStorage.setItem(KEYS.PAYOUT_METHODS, JSON.stringify(payoutMethods));
  },

  getMonthlyStatements: async (
    vendorId: string
  ): Promise<MonthlyStatement[]> => {
    await delay(400);
    const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || "[]");
    const statements: MonthlyStatement[] = [];

    // Group orders by month/year
    const ordersByMonth = new Map<string, Order[]>();
    orders.forEach((o: Order) => {
      if (o.vendorId !== vendorId || o.status !== "picked_up") return;
      const date = new Date(o.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!ordersByMonth.has(key)) {
        ordersByMonth.set(key, []);
      }
      ordersByMonth.get(key)!.push(o);
    });

    ordersByMonth.forEach((monthOrders, key) => {
      const [year, month] = key.split("-").map(Number);
      const grossRevenue = monthOrders.reduce(
        (sum, o) => sum + o.totalPrice,
        0
      );
      const platformFee = grossRevenue * 0.1;
      const netPayout = grossRevenue - platformFee;

      statements.push({
        month,
        year,
        totalOrders: monthOrders.length,
        totalRevenue: grossRevenue,
        platformFees: platformFee,
        netPayout,
        status:
          month === new Date().getMonth() + 1 &&
          year === new Date().getFullYear()
            ? "pending"
            : "paid",
      });
    });

    return statements.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  },

  downloadMonthlyStatement: async (
    vendorId: string,
    month: number,
    year: number,
    type: "order_summaries" | "invoices" | "account_statements"
  ): Promise<string> => {
    await delay(800);
    // In a real app, this would generate a PDF server-side
    // For now, we'll create a mock PDF blob URL
    const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || "[]");
    const monthOrders = orders.filter((o: Order) => {
      if (o.vendorId !== vendorId || o.status !== "picked_up") return false;
      const date = new Date(o.createdAt);
      return date.getMonth() + 1 === month && date.getFullYear() === year;
    });

    // Create a simple CSV/PDF-like content
    let content = `${type.toUpperCase().replace("_", " ")}\n`;
    content += `Period: ${new Date(year, month - 1).toLocaleDateString(
      "en-US",
      { month: "long", year: "numeric" }
    )}\n\n`;

    if (type === "order_summaries") {
      content += "Order ID,Date,Amount\n";
      monthOrders.forEach((o: Order) => {
        content += `${o.id},${new Date(
          o.createdAt
        ).toLocaleDateString()},$${o.totalPrice.toFixed(2)}\n`;
      });
    } else if (type === "invoices") {
      content += "Invoice Number,Order ID,Date,Amount\n";
      monthOrders.forEach((o: Order) => {
        content += `INV-${o.id},${o.id},${new Date(
          o.createdAt
        ).toLocaleDateString()},$${o.totalPrice.toFixed(2)}\n`;
      });
    } else {
      const grossRevenue = monthOrders.reduce(
        (sum, o) => sum + o.totalPrice,
        0
      );
      const platformFee = grossRevenue * 0.1;
      const netPayout = grossRevenue - platformFee;
      content += `Total Revenue: $${grossRevenue.toFixed(2)}\n`;
      content += `Platform Fees (10%): $${platformFee.toFixed(2)}\n`;
      content += `Net Payout: $${netPayout.toFixed(2)}\n`;
    }

    const blob = new Blob([content], { type: "text/plain" });
    return URL.createObjectURL(blob);
  },

  getDailyInvoices: async (
    vendorId: string,
    date: string,
    productType: string
  ): Promise<DailyInvoice[]> => {
    await delay(400);
    const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || "[]");
    const bags = JSON.parse(localStorage.getItem(KEYS.BAGS) || "[]");

    const selectedDate = new Date(date);
    const selectedDateStr = selectedDate.toISOString().split("T")[0];

    const dayOrders = orders.filter((o: Order) => {
      if (o.vendorId !== vendorId || o.status !== "picked_up") return false;
      const orderDate = new Date(o.createdAt).toISOString().split("T")[0];
      return orderDate === selectedDateStr;
    });

    return dayOrders
      .map((o: Order) => {
        const bag = bags.find((b: SurpriseBag) => b.id === o.bagId);
        const productTypeMatch =
          productType === "all" || bag?.category === productType;

        if (!productTypeMatch) return null;

        return {
          orderId: o.id,
          date: selectedDateStr,
          productType: bag?.category || "Other",
          totalAmount: o.totalPrice,
          invoiceUrl: `/api/invoices/${o.id}`,
          creditNoteUrl:
            o.status === "cancelled" ? `/api/credit-notes/${o.id}` : undefined,
        };
      })
      .filter((invoice): invoice is DailyInvoice => invoice !== null);
  },

  downloadInvoice: async (
    vendorId: string,
    orderId: string,
    type: "invoice" | "credit_note"
  ): Promise<string> => {
    await delay(600);
    const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || "[]");
    const order = orders.find(
      (o: Order) => o.id === orderId && o.vendorId === vendorId
    );

    if (!order) throw new Error("Order not found");

    let content = `${type === "invoice" ? "INVOICE" : "CREDIT NOTE"}\n\n`;
    content += `Order ID: ${order.id}\n`;
    content += `Date: ${new Date(order.createdAt).toLocaleDateString()}\n`;
    content += `Amount: $${order.totalPrice.toFixed(2)}\n`;
    content += `Status: ${order.status}\n`;

    const blob = new Blob([content], { type: "text/plain" });
    return URL.createObjectURL(blob);
  },

  getPartnerDetails: async (vendorId: string): Promise<PartnerDetails> => {
    await delay(300);
    const stored = localStorage.getItem(KEYS.PARTNER_DETAILS);
    if (stored) {
      const details = JSON.parse(stored);
      if (details[vendorId]) {
        return details[vendorId];
      }
    }

    // Get from vendor business info if available
    const vendors = JSON.parse(localStorage.getItem(KEYS.VENDORS) || "[]");
    const vendor = vendors.find((v: Vendor) => v.id === vendorId);

    const defaultDetails: PartnerDetails = {
      businessName:
        vendor?.businessInfo?.companyName || vendor?.name || "Your Business",
      address: vendor?.businessInfo?.address || vendor?.address || "",
      postalCode: vendor?.businessInfo?.address?.match(/\d{6}/)?.[0] || "",
      city: "Singapore",
      country: "Singapore",
      invoiceEmail: vendor?.businessInfo?.email || "",
    };

    // Save default
    const allDetails = stored ? JSON.parse(stored) : {};
    allDetails[vendorId] = defaultDetails;
    localStorage.setItem(KEYS.PARTNER_DETAILS, JSON.stringify(allDetails));

    return defaultDetails;
  },

  updatePartnerDetails: async (
    vendorId: string,
    details: PartnerDetails
  ): Promise<void> => {
    await delay(500);
    const allDetails = JSON.parse(
      localStorage.getItem(KEYS.PARTNER_DETAILS) || "{}"
    );
    allDetails[vendorId] = details;
    localStorage.setItem(KEYS.PARTNER_DETAILS, JSON.stringify(allDetails));
  },

  getEmailSettings: async (vendorId: string): Promise<EmailSettings> => {
    await delay(300);
    const stored = localStorage.getItem(KEYS.EMAIL_SETTINGS);
    if (stored) {
      const settings = JSON.parse(stored);
      if (settings[vendorId]) {
        return settings[vendorId];
      }
    }

    const defaultSettings: EmailSettings = {
      enabled: true,
      includeAccountStatements: true,
      includeOrderSummaries: true,
      includeInvoices: false,
      includeSelfBillingInvoices: false,
    };

    const allSettings = stored ? JSON.parse(stored) : {};
    allSettings[vendorId] = defaultSettings;
    localStorage.setItem(KEYS.EMAIL_SETTINGS, JSON.stringify(allSettings));

    return defaultSettings;
  },

  updateEmailSettings: async (
    vendorId: string,
    settings: EmailSettings
  ): Promise<void> => {
    await delay(400);
    const allSettings = JSON.parse(
      localStorage.getItem(KEYS.EMAIL_SETTINGS) || "{}"
    );
    allSettings[vendorId] = settings;
    localStorage.setItem(KEYS.EMAIL_SETTINGS, JSON.stringify(allSettings));
  },

  getLegalDocuments: async (): Promise<LegalDocument[]> => {
    await delay(300);
    // In a real app, these would be stored in a database or config
    return [
      {
        id: "terms",
        name: "Terms & Conditions",
        url: "/legal/terms-and-conditions.pdf",
        type: "terms",
      },
      {
        id: "commercial",
        name: "Appendix A - Commercial Terms",
        url: "/legal/commercial-terms.pdf",
        type: "commercial_terms",
      },
      {
        id: "cookies",
        name: "Cookie Policy",
        url: "/legal/cookie-policy.pdf",
        type: "cookie_policy",
      },
      {
        id: "privacy",
        name: "Privacy Policy",
        url: "/legal/privacy-policy.pdf",
        type: "privacy_policy",
      },
    ];
  },

  // Impact Calculator APIs
  getImpactEstimate: async (
    vendorId: string,
    baseBagsPerDay: number,
    extraBagsPerDay: number = 0
  ): Promise<ImpactEstimate> => {
    await delay(400);
    const { getImpactConfig } = await import("../config/impactConfig");
    const { calculateImpact } = await import("../config/impactConfig");

    const config = await getImpactConfig(vendorId);
    const impact = calculateImpact(baseBagsPerDay, extraBagsPerDay, config);

    return {
      baseBagsPerDay,
      extraBagsPerDay,
      ...impact,
      config,
    };
  },

  previewImpact: async (
    vendorId: string,
    baseBagsPerDay: number,
    extraBagsPerDay: number
  ): Promise<ImpactEstimate> => {
    await delay(200); // Faster for preview
    const { getImpactConfig } = await import("../config/impactConfig");
    const { calculateImpact } = await import("../config/impactConfig");

    const config = await getImpactConfig(vendorId);
    const impact = calculateImpact(baseBagsPerDay, extraBagsPerDay, config);

    return {
      baseBagsPerDay,
      extraBagsPerDay,
      ...impact,
      config,
    };
  },

  updateScheduleFromImpact: async (
    vendorId: string,
    baseBagsPerDay: number,
    extraBagsPerDay: number
  ): Promise<WeeklyAvailability> => {
    await delay(600);
    const { distributeBagsAcrossSchedule } = await import(
      "../utils/impactCalculator"
    );

    // Get current availability
    const vendors = JSON.parse(localStorage.getItem(KEYS.VENDORS) || "[]");
    const vendor = vendors.find((v: Vendor) => v.id === vendorId);

    if (!vendor || !vendor.availability) {
      throw new Error("Vendor or availability not found");
    }

    const totalBagsPerDay = baseBagsPerDay + extraBagsPerDay;
    const updatedAvailability = distributeBagsAcrossSchedule(
      vendor.availability,
      totalBagsPerDay
    );

    // Update vendor availability
    const index = vendors.findIndex((v: Vendor) => v.id === vendorId);
    if (index !== -1) {
      vendors[index].availability = updatedAvailability;
      localStorage.setItem(KEYS.VENDORS, JSON.stringify(vendors));
    }

    return updatedAvailability;
  },
};
