// ===========================================
// TYPESCRIPT TYPES
// ===========================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  displayName?: string;
  bio?: string;
  tagline?: string;
  category?: string;
  profileImage?: string;
  aiPersonality?: string;
  aiTone?: string;
  welcomeMessage?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  coverImage?: string;
  role: 'USER' | 'CREATOR' | 'COMPANY' | 'ADMIN';
  isVerified: boolean;
  isProfileComplete?: boolean;
  isSuspended?: boolean;
  suspendedAt?: string;
  suspendedUntil?: string;
  suspensionReason?: string;
  isBanned?: boolean;
  banReason?: string;
  createdAt: string;
  creator?: CreatorProfile;
  company?: CompanyProfile;
  subscription?: Subscription;
}

export interface Creator {
  id: string;
  userId?: string;       // Underlying user account id (for presence matching)
  isOnline?: boolean;    // Real-time presence — initial value from REST, updated via socket
  displayName: string;
  bio?: string;
  tagline?: string;
  profileImage?: string;
  coverImage?: string;
  category?: string;
  tags: string[];
  isVerified: boolean;
  totalChats: number;
  rating?: number;
  welcomeMessage?: string;
  aiPersonality?: string;
  aiTone?: string;
  bankAccount?: {
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
  };
  createdAt?: string;
  pricePerMessage?: number;
  firstMessageFree?: boolean;
  discountFirstFive?: number;
}

export interface CreatorProfile extends Creator {
  youtubeUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  totalEarnings?: number;
  totalMessages?: number;
  isProfileComplete?: boolean;
  isRejected?: boolean;
  rejected?: boolean;
  rejectionReason?: string;
  rejectedAt?: string;
  performance?: {
    responseRate: number;
    avgResponseTimeMs: number | null;
    avgResponseTimeSeconds: number | null;
    totalChats: number;
    rating: number;
  };
  faqs?: Array<{
    id: string;
    question: string;
    answer: string;
    createdAt: string;
  }>;
  topicExpertise?: Array<{
    topic: string;
    percentage: number;
  }>;
  satisfactionTrend?: Array<{
    month: string;
    score: number;
  }>;
}

export interface CompanyProfile {
  id: string;
  companyName: string;
  logo?: string;
  website?: string;
  industry?: string;
  description?: string;
  isVerified: boolean;
}

export interface Subscription {
  id: string;
  plan: 'FREE' | 'PREMIUM';
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE';
  messagesUsedToday: number;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  tokenBalance?: number;
  tokenGrant?: number;
  tokenGrantedAt?: string;
}

export interface TokenUsage {
  balance: number;
  grant: number;
  grantedAt: string;
  perMessage: number;
}

export interface SubscriptionUsage {
  messagesToday: number;
  messagesThisMonth?: number;
  totalMessages?: number;
  dailyQuota?: number;
  monthlyQuota?: number;
  dailyUsagePercentage?: number;
  monthlyUsagePercentage?: number;
  tokens?: TokenUsage;
}

export interface SubscriptionDetails {
  subscription: Subscription;
  usage?: SubscriptionUsage;
  user?: { name?: string; email?: string };
}

export interface Conversation {
  id: string;
  creatorId: string;
  userId?: string;
  guestId?: string;
  isActive: boolean;
  lastMessageAt?: string;
  createdAt: string;
  creator?: Creator;
  messages?: Message[];
}

export interface MediaFile {
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  name?: string;
  size?: number;
  mimetype?: string;
}

export interface LinkPreview {
  url: string;
  title: string;
  description: string;
  image: string | null;
  siteName: string;
  type: string;
  favicon: string | null;
}

export interface MessageReaction {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  emoji: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  media?: MediaFile[];
  reactions?: { [emoji: string]: MessageReaction[] };
  tokensUsed?: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  parentId?: string;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  _count?: {
    replies: number;
  };
  replies?: Comment[];
}

export interface Review {
  id: string;
  creatorId: string;
  userId: string;
  rating: number;
  review?: string | null;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  breakdown?: Record<string, number> | Record<number, number>;
}

export interface ReviewListResponse {
  reviews: Review[];
  stats?: ReviewStats;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

export interface CreatorContent {
  id: string;
  title: string;
  type: 'YOUTUBE_VIDEO' | 'INSTAGRAM_POST' | 'MANUAL_TEXT' | 'UPLOADED_FILE' | 'FAQ';
  sourceUrl?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  errorMessage?: string;
  createdAt: string;
  processedAt?: string;
  _count?: { chunks: number };
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: string;
  budget?: number;
  budgetType?: string;
  category?: string;
  minFollowers?: number;
  requirements?: string;
  status: string;
  deadline?: string;
  createdAt: string;
  company?: CompanyProfile;
  _count?: { applications: number };
}

export interface Application {
  id: string;
  opportunityId: string;
  creatorId: string;
  pitch: string;
  proposedBudget?: number;
  status: string;
  createdAt: string;
  opportunity?: Opportunity;
  creator?: Creator;
}

export interface Deal {
  id: string;
  amount: number;
  platformFee: number;
  creatorEarnings: number;
  status: string;
  startDate?: string;
  createdAt: string;
  company?: CompanyProfile;
  creator?: Creator;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface LoginCredentials { email: string; password: string; }
export interface RegisterData { email: string; password: string; name: string; role?: string; }
export interface AuthResponse { user: User; token: string; isProfileComplete?: boolean; }
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  data?: any;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  expiresAt?: string | null;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
