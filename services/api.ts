import { User, Vendor, SurpriseBag, Order, UserRole, VendorStats, WeeklyAvailability, VendorBusinessInfo, VendorSettings } from '../types';

// Initial Mock Data
const MOCK_VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'Bread & Butter Bakery',
    address: '123 Tanjong Pagar Rd',
    lat: 1.2764,
    lng: 103.8446,
    category: 'Bakery',
    rating: 4.8,
    totalReviews: 120,
    tags: ['Vegetarian', 'Halal-Friendly'],
    photoUrl: 'https://picsum.photos/400/300?random=1',
    pickupInstructions: 'Show code at counter.',
    availability: {
      mon: { available: true, pickupStart: '18:00', pickupEnd: '19:00', defaultQuantity: 5 },
      tue: { available: true, pickupStart: '18:00', pickupEnd: '19:00', defaultQuantity: 5 },
      wed: { available: true, pickupStart: '18:00', pickupEnd: '19:00', defaultQuantity: 5 },
      thu: { available: true, pickupStart: '18:00', pickupEnd: '19:00', defaultQuantity: 5 },
      fri: { available: true, pickupStart: '18:00', pickupEnd: '19:00', defaultQuantity: 8 },
      sat: { available: false, pickupStart: '15:00', pickupEnd: '16:00', defaultQuantity: 0 },
      sun: { available: false, pickupStart: '15:00', pickupEnd: '16:00', defaultQuantity: 0 },
    }
  },
  {
    id: 'v2',
    name: 'Sushi Zen',
    address: '45 Orchard Blvd',
    lat: 1.3048,
    lng: 103.8318,
    category: 'Japanese',
    rating: 4.5,
    totalReviews: 85,
    tags: ['Seafood', 'Rice'],
    photoUrl: 'https://picsum.photos/400/300?random=2',
    pickupInstructions: 'Enter from side door after 9pm.'
  },
  {
    id: 'v3',
    name: 'Daily Green Salad',
    address: '10 Raffles Place',
    lat: 1.2830,
    lng: 103.8510,
    category: 'Restaurant',
    rating: 4.2,
    totalReviews: 45,
    tags: ['Vegan', 'Healthy', 'Gluten-Free'],
    photoUrl: 'https://picsum.photos/400/300?random=3',
    pickupInstructions: 'Collect at the cashier.'
  }
];

const MOCK_BAGS: SurpriseBag[] = [
  {
    id: 'b1',
    vendorId: 'v1',
    vendorName: 'Bread & Butter Bakery',
    vendorCategory: 'Bakery',
    title: 'Pastry Surprise',
    description: 'A mix of croissants, danishes, and muffins.',
    price: 5.50,
    originalPrice: 15.00,
    pickupStart: '20:00',
    pickupEnd: '21:30',
    quantity: 5,
    dietaryTags: ['Vegetarian'],
    status: 'active',
    category: 'Bread & Pastries'
  },
  {
    id: 'b2',
    vendorId: 'v2',
    vendorName: 'Sushi Zen',
    vendorCategory: 'Japanese',
    title: 'Sushi Platter Ends',
    description: 'Assorted sushi rolls and nigiri.',
    price: 8.90,
    originalPrice: 22.00,
    pickupStart: '21:30',
    pickupEnd: '22:30',
    quantity: 2,
    dietaryTags: ['Seafood'],
    status: 'active',
    category: 'Meals'
  },
  {
    id: 'b3',
    vendorId: 'v3',
    vendorName: 'Daily Green Salad',
    vendorCategory: 'Restaurant',
    title: 'Healthy Salad Mix',
    description: 'Fresh salad bases and toppings.',
    price: 6.00,
    originalPrice: 14.00,
    pickupStart: '14:00',
    pickupEnd: '15:00',
    quantity: 8,
    dietaryTags: ['Vegan', 'Gluten-Free'],
    status: 'active',
    category: 'Meals'
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const KEYS = {
  USERS: 'kiasubites_users',
  VENDORS: 'kiasubites_vendors',
  BAGS: 'kiasubites_bags',
  ORDERS: 'kiasubites_orders',
  CURRENT_USER: 'kiasubites_current_user'
};

const initStorage = () => {
  if (!localStorage.getItem(KEYS.VENDORS)) {
    localStorage.setItem(KEYS.VENDORS, JSON.stringify(MOCK_VENDORS));
  }
  if (!localStorage.getItem(KEYS.BAGS)) {
    localStorage.setItem(KEYS.BAGS, JSON.stringify(MOCK_BAGS));
  }
  if (!localStorage.getItem(KEYS.ORDERS)) {
    // Add some mock past orders with ratings
    const pastOrders: Order[] = [
      {
        id: 'o-past-1',
        consumerId: 'c1',
        bagId: 'b1',
        vendorId: 'v1',
        bagTitle: 'Pastry Surprise',
        vendorName: 'Bread & Butter Bakery',
        quantity: 1,
        totalPrice: 5.50,
        estimatedValue: 15.00,
        status: 'picked_up',
        pickupStart: '20:00',
        pickupEnd: '21:30',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        confirmationCode: 'ABC12',
        rating: 5,
        review: 'Delicious and great value!'
      }
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
        id: role === UserRole.VENDOR ? 'v1' : 'c1',
        name: role === UserRole.VENDOR ? 'Bread & Butter Bakery' : 'Alex Tan',
        email,
        role,
        dietaryPreferences: [],
        radiusKm: 5,
        favorites: [],
        isVerified: role === UserRole.VENDOR ? false : undefined // Default unverified for demo
      };
      
      // If V1 login, check if actually verified in mock vendor DB
      if (role === UserRole.VENDOR) {
         const vendors = JSON.parse(localStorage.getItem(KEYS.VENDORS) || '[]');
         const v = vendors.find((v: Vendor) => v.id === 'v1');
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
      ? favorites.filter(id => id !== vendorId)
      : [...favorites, vendorId];
    
    const updated = { ...user, favorites: newFavorites };
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(updated));
    return updated;
  },

  // Consumer
  getBags: async (): Promise<SurpriseBag[]> => {
    await delay(400);
    const bags = JSON.parse(localStorage.getItem(KEYS.BAGS) || '[]');
    return bags.filter((b: SurpriseBag) => b.status === 'active' && b.quantity > 0);
  },

  getVendors: async (): Promise<Vendor[]> => {
    await delay(400);
    return JSON.parse(localStorage.getItem(KEYS.VENDORS) || '[]');
  },

  getBagById: async (id: string): Promise<SurpriseBag | undefined> => {
    await delay(300);
    const bags = JSON.parse(localStorage.getItem(KEYS.BAGS) || '[]');
    return bags.find((b: SurpriseBag) => b.id === id);
  },

  getVendorById: async (id: string): Promise<Vendor | undefined> => {
     await delay(300);
     const vendors = JSON.parse(localStorage.getItem(KEYS.VENDORS) || '[]');
     return vendors.find((v: Vendor) => v.id === id);
  },

  getFavoriteVendors: async (userId: string): Promise<{vendor: Vendor, bags: SurpriseBag[]}[]> => {
     await delay(500);
     const user = api.getCurrentUser();
     const allVendors = JSON.parse(localStorage.getItem(KEYS.VENDORS) || '[]');
     const allBags = JSON.parse(localStorage.getItem(KEYS.BAGS) || '[]');

     const favs = user?.favorites || [];
     const vendors = allVendors.filter((v: Vendor) => favs.includes(v.id));
     
     return vendors.map((v: Vendor) => ({
       vendor: v,
       bags: allBags.filter((b: SurpriseBag) => b.vendorId === v.id && b.status === 'active')
     }));
  },

  createOrder: async (bagId: string, quantity: number, user: User): Promise<Order> => {
    await delay(800);
    const bags = JSON.parse(localStorage.getItem(KEYS.BAGS) || '[]');
    const bagIndex = bags.findIndex((b: SurpriseBag) => b.id === bagId);

    if (bagIndex === -1 || bags[bagIndex].quantity < quantity) {
      throw new Error('Bag unavailable');
    }

    bags[bagIndex].quantity -= quantity;
    if (bags[bagIndex].quantity === 0) bags[bagIndex].status = 'sold_out';
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
      status: 'reserved',
      pickupStart: bag.pickupStart,
      pickupEnd: bag.pickupEnd,
      createdAt: new Date().toISOString(),
      confirmationCode: Math.random().toString(36).substr(2, 5).toUpperCase()
    };

    const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
    orders.push(newOrder);
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));

    return newOrder;
  },

  getConsumerOrders: async (userId: string): Promise<Order[]> => {
    await delay(500);
    const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
    return orders.filter((o: Order) => o.consumerId === userId).reverse();
  },

  rateOrder: async (orderId: string, rating: number, review: string): Promise<void> => {
    await delay(500);
    const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
    const index = orders.findIndex((o: Order) => o.id === orderId);
    if (index !== -1) {
      orders[index].rating = rating;
      orders[index].review = review;
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    }
  },

  // Vendor Logic
  verifyVendorBusiness: async (vendorId: string, info: VendorBusinessInfo): Promise<void> => {
    await delay(1000);
    const vendors = JSON.parse(localStorage.getItem(KEYS.VENDORS) || '[]');
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

  updateVendorAvailability: async (vendorId: string, availability: WeeklyAvailability): Promise<void> => {
    await delay(500);
    const vendors = JSON.parse(localStorage.getItem(KEYS.VENDORS) || '[]');
    const index = vendors.findIndex((v: Vendor) => v.id === vendorId);
    if (index !== -1) {
      vendors[index].availability = availability;
      localStorage.setItem(KEYS.VENDORS, JSON.stringify(vendors));
    }
  },

  updateVendorSettings: async (vendorId: string, settings: VendorSettings): Promise<void> => {
    await delay(500);
    const vendors = JSON.parse(localStorage.getItem(KEYS.VENDORS) || '[]');
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
      revenueThisMonth: 850.50,
      pickupRate: 98,
      avgRating: 4.7,
      salesHistory: [
        { date: 'Mon', amount: 45, bagsSold: 8 },
        { date: 'Tue', amount: 52, bagsSold: 10 },
        { date: 'Wed', amount: 38, bagsSold: 6 },
        { date: 'Thu', amount: 65, bagsSold: 12 },
        { date: 'Fri', amount: 80, bagsSold: 15 },
        { date: 'Sat', amount: 95, bagsSold: 18 },
        { date: 'Sun', amount: 70, bagsSold: 13 },
      ],
      payouts: [
        { date: '2023-10-31', period: 'Oct 1-31', gross: 850.50, fees: 85.05, net: 765.45, status: 'Upcoming' },
        { date: '2023-09-30', period: 'Sep 1-30', gross: 720.00, fees: 72.00, net: 648.00, status: 'Paid' }
      ]
    };
  },

  getVendorReviews: async (vendorId: string): Promise<Order[]> => {
     await delay(500);
     const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
     // In a real app we'd join user names, but mock Order has consumerId. 
     // We will filter orders for this vendor that have ratings.
     return orders.filter((o: Order) => o.vendorId === vendorId && o.rating).reverse();
  },

  getVendorBags: async (vendorId: string): Promise<SurpriseBag[]> => {
    await delay(500);
    const bags = JSON.parse(localStorage.getItem(KEYS.BAGS) || '[]');
    return bags.filter((b: SurpriseBag) => b.vendorId === vendorId); // Fixed filtering
  },

  createBag: async (bag: Omit<SurpriseBag, 'id'>): Promise<SurpriseBag> => {
    await delay(800);
    const newBag = { ...bag, id: Math.random().toString(36).substr(2, 9) };
    const bags = JSON.parse(localStorage.getItem(KEYS.BAGS) || '[]');
    bags.push(newBag);
    localStorage.setItem(KEYS.BAGS, JSON.stringify(bags));
    return newBag;
  },

  getVendorOrders: async (vendorId: string): Promise<Order[]> => {
    await delay(500);
    const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
    return orders.filter((o: Order) => o.vendorId === vendorId).reverse();
  },

  updateOrderStatus: async (orderId: string, status: Order['status']): Promise<void> => {
    await delay(400);
    const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
    const index = orders.findIndex((o: Order) => o.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    }
  }
};
