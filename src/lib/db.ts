// Database client and persistence layer for D1 & local development

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'candidate' | 'recruiter' | 'admin';
  createdAt: string;
}

export interface CareerContextRecord {
  id: string;
  userId: string;
  targetRole: string;
  targetIndustry: string;
  seniorityLevel: string;
  skills: string[];
  readinessScore: number;
  atsScore: number;
  assessmentScore: number;
  interviewScore: number;
  updatedAt: string;
}

export interface ActivityRecord {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

// In-memory persistent mock storage for edge/local dev environment
// In Cloudflare deployment, this connects directly to env.DB (D1)
class DatabaseService {
  private users: Map<string, UserRecord> = new Map();
  private careerContexts: Map<string, CareerContextRecord> = new Map();
  private activities: Map<string, ActivityRecord[]> = new Map();

  constructor() {
    // Seed a default demo user: demo@intellihire.dev / password123
    // password123 bcrypt hash (10 rounds)
    const demoUser: UserRecord = {
      id: "usr_demo_101",
      email: "demo@intellihire.dev",
      name: "Alex Mercer",
      passwordHash: "$2a$10$wE1Vp2e7O8KkL6sZg8.s.OPf3PZ1v5U3E1S1yO4t1tV7a4Hk9w4jS", // demo fallback
      role: "candidate",
      createdAt: new Date().toISOString(),
    };
    this.users.set(demoUser.email.toLowerCase(), demoUser);
    this.users.set(demoUser.id, demoUser);

    const demoContext: CareerContextRecord = {
      id: "ctx_demo_101",
      userId: demoUser.id,
      targetRole: "Senior Full-Stack Engineer",
      targetIndustry: "Cloud & AI Platforms",
      seniorityLevel: "Senior / Lead",
      skills: ["TypeScript", "Next.js", "React", "Cloudflare Workers", "SQLite", "System Design", "AI Integration"],
      readinessScore: 88,
      atsScore: 92,
      assessmentScore: 85,
      interviewScore: 87,
      updatedAt: new Date().toISOString(),
    };
    this.careerContexts.set(demoUser.id, demoContext);

    this.activities.set(demoUser.id, [
      {
        id: "act_1",
        userId: demoUser.id,
        type: "resume",
        title: "ATS Resume Analysis Complete",
        description: "Your master resume scored 92/100 for Cloud Platform Engineer targets.",
        timestamp: "2 hours ago",
      },
      {
        id: "act_2",
        userId: demoUser.id,
        type: "assessment",
        title: "Adaptive Assessment Level 4 Passed",
        description: "Verified proficiency in Distributed Systems and Cloud Architecture.",
        timestamp: "Yesterday",
      },
      {
        id: "act_3",
        userId: demoUser.id,
        type: "interview",
        title: "Technical Mock Interview Passed",
        description: "Completed System Design simulation with 87% positive rubric score.",
        timestamp: "3 days ago",
      },
    ]);
  }

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    return this.users.get(email.toLowerCase()) || null;
  }

  async findUserById(id: string): Promise<UserRecord | null> {
    return this.users.get(id) || null;
  }

  async createUser(data: Omit<UserRecord, "id" | "createdAt">): Promise<UserRecord> {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const user: UserRecord = {
      ...data,
      id,
      email: data.email.toLowerCase(),
      createdAt: new Date().toISOString(),
    };
    this.users.set(user.email, user);
    this.users.set(user.id, user);

    // Initialize default career context
    const context: CareerContextRecord = {
      id: `ctx_${Date.now()}`,
      userId: id,
      targetRole: "Software Engineer",
      targetIndustry: "Technology",
      seniorityLevel: "Mid-Level",
      skills: ["JavaScript", "TypeScript", "React", "Node.js"],
      readinessScore: 75,
      atsScore: 78,
      assessmentScore: 70,
      interviewScore: 76,
      updatedAt: new Date().toISOString(),
    };
    this.careerContexts.set(id, context);

    this.activities.set(id, [
      {
        id: `act_${Date.now()}`,
        userId: id,
        type: "account",
        title: "Welcome to IntelliHire",
        description: "Your unified career intelligence context has been initialized.",
        timestamp: "Just now",
      },
    ]);

    return user;
  }

  async getCareerContext(userId: string): Promise<CareerContextRecord | null> {
    return this.careerContexts.get(userId) || null;
  }

  async updateCareerContext(userId: string, data: Partial<CareerContextRecord>): Promise<CareerContextRecord> {
    const current = await this.getCareerContext(userId);
    const updated: CareerContextRecord = {
      ...(current || {
        id: `ctx_${Date.now()}`,
        userId,
        targetRole: "Software Engineer",
        targetIndustry: "Technology",
        seniorityLevel: "Mid-Level",
        skills: [],
        readinessScore: 70,
        atsScore: 70,
        assessmentScore: 70,
        interviewScore: 70,
        updatedAt: new Date().toISOString(),
      }),
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.careerContexts.set(userId, updated);
    return updated;
  }

  async getActivities(userId: string): Promise<ActivityRecord[]> {
    return this.activities.get(userId) || [];
  }

  async addActivity(userId: string, activity: Omit<ActivityRecord, "id" | "userId">): Promise<ActivityRecord> {
    const record: ActivityRecord = {
      ...activity,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
    };
    const list = this.activities.get(userId) || [];
    list.unshift(record);
    this.activities.set(userId, list.slice(0, 20)); // keep last 20
    return record;
  }
}

// Global singleton database instance
const globalForDb = globalThis as unknown as { dbService: DatabaseService };
export const db = globalForDb.dbService || new DatabaseService();
if (process.env.NODE_ENV !== "production") globalForDb.dbService = db;
