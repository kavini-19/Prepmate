// Mock data for development — used when backend is not available
import type { CodingProblem, AptitudeQuestion, Company, Note, Badge, Notification, Resource } from "@/types";

export const MOCK_CODING_PROBLEMS: CodingProblem[] = [
  {
    id: "1", title: "Two Sum", slug: "two-sum", difficulty: "Easy",
    tags: ["Arrays", "Hashing"], acceptance: 49.2, submissions: 12500000,
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] == 9, return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
    ],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "Only one valid answer exists."],
    hints: ["Try using a hash map to store complements.", "For each element, check if target - element exists in the map."],
    solution: `def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i`,
    companies: ["Google", "Amazon", "Microsoft"],
    isBookmarked: false, isSolved: true,
  },
  {
    id: "2", title: "Reverse Linked List", slug: "reverse-linked-list", difficulty: "Easy",
    tags: ["Linked List"], acceptance: 73.1, submissions: 5800000,
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    examples: [{ input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" }],
    constraints: ["The number of nodes in the list is in [0, 5000].", "-5000 <= Node.val <= 5000"],
    hints: ["Can you do it iteratively?", "Can you do it recursively?"],
    solution: `def reverseList(head):\n    prev = None\n    curr = head\n    while curr:\n        next_node = curr.next\n        curr.next = prev\n        prev = curr\n        curr = next_node\n    return prev`,
    companies: ["Amazon", "Facebook"],
    isBookmarked: true, isSolved: true,
  },
  {
    id: "3", title: "Longest Substring Without Repeating Characters", slug: "longest-substring-no-repeat",
    difficulty: "Medium", tags: ["Strings", "Hashing"], acceptance: 33.8, submissions: 9200000,
    description: "Given a string `s`, find the length of the longest substring without repeating characters.",
    examples: [
      { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: "1" }
    ],
    constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
    hints: ["Use a sliding window.", "Use a set to track characters in current window."],
    solution: `def lengthOfLongestSubstring(s):\n    char_set = set()\n    left = 0\n    max_len = 0\n    for right in range(len(s)):\n        while s[right] in char_set:\n            char_set.remove(s[left])\n            left += 1\n        char_set.add(s[right])\n        max_len = max(max_len, right - left + 1)\n    return max_len`,
    companies: ["Amazon", "Bloomberg", "Adobe"],
    isBookmarked: false, isSolved: false,
  },
  {
    id: "4", title: "Maximum Subarray", slug: "maximum-subarray", difficulty: "Medium",
    tags: ["Arrays", "Dynamic Programming"], acceptance: 49.8, submissions: 7100000,
    description: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
    examples: [{ input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "Subarray [4,-1,2,1] has the largest sum 6." }],
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    hints: ["Try Kadane's algorithm.", "Keep track of current sum and max sum."],
    solution: `def maxSubArray(nums):\n    max_sum = nums[0]\n    curr_sum = nums[0]\n    for num in nums[1:]:\n        curr_sum = max(num, curr_sum + num)\n        max_sum = max(max_sum, curr_sum)\n    return max_sum`,
    companies: ["Google", "Microsoft", "Apple"],
    isBookmarked: true, isSolved: false,
  },
  {
    id: "5", title: "Binary Tree Level Order Traversal", slug: "binary-tree-level-order",
    difficulty: "Medium", tags: ["Tree"], acceptance: 64.2, submissions: 3400000,
    description: "Given the root of a binary tree, return the level order traversal of its nodes' values.",
    examples: [{ input: "root = [3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]" }],
    constraints: ["The number of nodes in the tree is in the range [0, 2000].", "-1000 <= Node.val <= 1000"],
    hints: ["Use a queue for BFS.", "Process nodes level by level."],
    solution: `from collections import deque\ndef levelOrder(root):\n    if not root: return []\n    result, queue = [], deque([root])\n    while queue:\n        level = []\n        for _ in range(len(queue)):\n            node = queue.popleft()\n            level.append(node.val)\n            if node.left: queue.append(node.left)\n            if node.right: queue.append(node.right)\n        result.append(level)\n    return result`,
    companies: ["Facebook", "Amazon", "Microsoft"],
    isBookmarked: false, isSolved: false,
  },
  {
    id: "6", title: "Merge K Sorted Lists", slug: "merge-k-sorted-lists", difficulty: "Hard",
    tags: ["Linked List", "Sorting"], acceptance: 47.6, submissions: 2100000,
    description: "You are given an array of `k` linked-lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    examples: [{ input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]" }],
    constraints: ["k == lists.length", "0 <= k <= 10^4", "0 <= lists[i].length <= 500"],
    hints: ["Use a min-heap to always extract the minimum.", "Compare the first elements of each list."],
    solution: `import heapq\ndef mergeKLists(lists):\n    heap = []\n    for i, lst in enumerate(lists):\n        if lst: heapq.heappush(heap, (lst.val, i, lst))\n    dummy = ListNode(0)\n    curr = dummy\n    while heap:\n        val, i, node = heapq.heappop(heap)\n        curr.next = node\n        curr = curr.next\n        if node.next: heapq.heappush(heap, (node.next.val, i, node.next))\n    return dummy.next`,
    companies: ["Google", "Facebook", "Amazon", "Microsoft"],
    isBookmarked: false, isSolved: false,
  },
];

export const MOCK_APTITUDE_QUESTIONS: AptitudeQuestion[] = [
  {
    id: "q1", category: "Quantitative Aptitude", difficulty: "Easy", timeLimit: 60,
    question: "A train travels 300 km in 5 hours. What is its average speed in km/h?",
    options: ["50 km/h", "55 km/h", "60 km/h", "65 km/h"],
    correctAnswer: 2,
    explanation: "Average speed = Total distance / Total time = 300 / 5 = 60 km/h",
  },
  {
    id: "q2", category: "Quantitative Aptitude", difficulty: "Medium", timeLimit: 90,
    question: "If 15% of a number is 45, what is 30% of that number?",
    options: ["75", "90", "80", "85"],
    correctAnswer: 1,
    explanation: "15% of x = 45 → x = 300. 30% of 300 = 90.",
  },
  {
    id: "q3", category: "Logical Reasoning", difficulty: "Easy", timeLimit: 45,
    question: "Find the odd one out: Apple, Mango, Banana, Carrot, Grape",
    options: ["Apple", "Mango", "Carrot", "Grape"],
    correctAnswer: 2,
    explanation: "Carrot is a vegetable; all others are fruits.",
  },
  {
    id: "q4", category: "Logical Reasoning", difficulty: "Medium", timeLimit: 60,
    question: "In a certain code, PENCIL is coded as PFODIL. How is MIRROR coded?",
    options: ["NJSSPS", "NJQQPS", "NJRQPS", "NJRROR"],
    correctAnswer: 0,
    explanation: "Each letter is shifted by +1. M→N, I→J, R→S, R→S, O→P, R→S = NJSSPS",
  },
  {
    id: "q5", category: "Verbal Ability", difficulty: "Easy", timeLimit: 30,
    question: "Choose the correct synonym for 'Eloquent':",
    options: ["Silent", "Articulate", "Confused", "Shy"],
    correctAnswer: 1,
    explanation: "'Eloquent' means fluent and persuasive in speaking. 'Articulate' is the closest synonym.",
  },
  {
    id: "q6", category: "Data Interpretation", difficulty: "Medium", timeLimit: 120,
    question: "A company's revenue grew from ₹50 Cr to ₹75 Cr in one year. What is the percentage growth?",
    options: ["25%", "33.3%", "50%", "40%"],
    correctAnswer: 2,
    explanation: "Growth % = ((75 - 50) / 50) × 100 = (25/50) × 100 = 50%",
  },
  {
    id: "q7", category: "Quantitative Aptitude", difficulty: "Hard", timeLimit: 120,
    question: "Two pipes A and B can fill a tank in 12 and 18 hours respectively. If both are opened together, in how many hours will the tank be full?",
    options: ["6.4 hours", "7.2 hours", "8 hours", "9 hours"],
    correctAnswer: 1,
    explanation: "Combined rate = 1/12 + 1/18 = 3/36 + 2/36 = 5/36. Time = 36/5 = 7.2 hours.",
  },
  {
    id: "q8", category: "Logical Reasoning", difficulty: "Hard", timeLimit: 90,
    question: "5 people sit in a row. A is to the right of B. C is to the left of D. E is between A and D. Who sits in the middle?",
    options: ["A", "B", "E", "C"],
    correctAnswer: 2,
    explanation: "Arrangement: B, A, E, D, C → E sits in the middle (3rd position).",
  },
];

export const MOCK_COMPANIES: Company[] = [
  {
    id: "c1", name: "Google", slug: "google",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png",
    industry: "Technology", tier: "FAANG", difficulty: "Hard", avgPackage: "₹30-50 LPA",
    interviewRounds: ["Online Assessment", "Phone Screen", "Technical Round 1", "Technical Round 2", "Googliness Round"],
    codingTopics: ["Arrays", "Dynamic Programming", "Graph", "Tree", "Binary Search"],
    aptitudeTopics: ["Quantitative Aptitude", "Logical Reasoning"],
    hrQuestions: ["Tell me about yourself", "Why Google?", "Describe a challenging project", "Where do you see yourself in 5 years?"],
    technicalTopics: ["System Design", "OOP", "Computer Networks", "Operating Systems"],
    interviewExperiences: [
      { id: "e1", author: "Priya S.", role: "SDE Intern", year: 2024, result: "Selected",
        experience: "The process was rigorous but fair. Focus on problem solving and explain your thought process clearly.",
        rounds: ["OA - 2 coding problems", "Phone screen - 1 problem", "3 technical rounds", "Googliness interview"],
        tips: ["Practice LC medium/hard", "Focus on system design basics", "Be clear about trade-offs"] },
    ],
  },
  {
    id: "c2", name: "Microsoft", slug: "microsoft",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1200px-Microsoft_logo.svg.png",
    industry: "Technology", tier: "FAANG", difficulty: "Hard", avgPackage: "₹25-45 LPA",
    interviewRounds: ["Online Assessment", "Technical Round 1", "Technical Round 2", "Technical Round 3", "HR Round"],
    codingTopics: ["Arrays", "Strings", "Tree", "Dynamic Programming", "Graph"],
    aptitudeTopics: ["Quantitative Aptitude", "Logical Reasoning"],
    hrQuestions: ["Why Microsoft?", "Tell me about a time you failed", "How do you handle conflicts?"],
    technicalTopics: ["OOP", "DBMS", "Operating Systems", "System Design"],
    interviewExperiences: [],
  },
  {
    id: "c3", name: "Amazon", slug: "amazon",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png",
    industry: "Technology", tier: "FAANG", difficulty: "Hard", avgPackage: "₹20-40 LPA",
    interviewRounds: ["Online Assessment", "Technical Round 1", "Technical Round 2", "Bar Raiser", "HR Round"],
    codingTopics: ["Arrays", "Strings", "Tree", "Graph", "Dynamic Programming"],
    aptitudeTopics: ["Quantitative Aptitude"],
    hrQuestions: ["Tell me about a time you showed leadership", "Describe a failure and what you learned", "Why Amazon?"],
    technicalTopics: ["System Design", "OOP", "Java/Python", "SQL"],
    interviewExperiences: [],
  },
  {
    id: "c4", name: "Infosys", slug: "infosys",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Infosys_logo.svg/1200px-Infosys_logo.svg.png",
    industry: "IT Services", tier: "Service", difficulty: "Easy", avgPackage: "₹3.6-8 LPA",
    interviewRounds: ["Online Test", "Technical Interview", "HR Interview"],
    codingTopics: ["Arrays", "Strings", "Sorting", "Basic Data Structures"],
    aptitudeTopics: ["Quantitative Aptitude", "Logical Reasoning", "Verbal Ability"],
    hrQuestions: ["Tell me about yourself", "Why Infosys?", "Are you willing to relocate?"],
    technicalTopics: ["OOP", "Java", "DBMS", "Operating Systems"],
    interviewExperiences: [],
  },
  {
    id: "c5", name: "TCS", slug: "tcs",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg",
    industry: "IT Services", tier: "Service", difficulty: "Easy", avgPackage: "₹3.36-7 LPA",
    interviewRounds: ["TCS NQT", "Technical Interview", "HR Interview"],
    codingTopics: ["Arrays", "Strings", "Basic Algorithms"],
    aptitudeTopics: ["Quantitative Aptitude", "Logical Reasoning", "Verbal Ability", "Data Interpretation"],
    hrQuestions: ["Tell me about yourself", "What are your strengths and weaknesses?", "Why TCS?"],
    technicalTopics: ["OOP", "DBMS", "Computer Networks"],
    interviewExperiences: [],
  },
  {
    id: "c6", name: "Flipkart", slug: "flipkart",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1b/Flipkart_logo.svg/1200px-Flipkart_logo.svg.png",
    industry: "E-Commerce", tier: "Product", difficulty: "Medium", avgPackage: "₹15-30 LPA",
    interviewRounds: ["Online Coding", "Technical Round 1", "Technical Round 2", "Hiring Manager", "HR"],
    codingTopics: ["Arrays", "Tree", "Graph", "Dynamic Programming", "System Design"],
    aptitudeTopics: ["Logical Reasoning"],
    hrQuestions: ["Why Flipkart?", "Describe a challenging project", "How do you work in a team?"],
    technicalTopics: ["System Design", "OOP", "Java", "SQL", "Microservices"],
    interviewExperiences: [],
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "drive", title: "Google SDE Internship 2025", message: "Applications open for Google Summer Internship. Deadline: March 15, 2025.", link: "/companies/google", isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString(), metadata: { company: "Google", deadline: "2025-03-15" } },
  { id: "n2", type: "contest", title: "LeetCode Weekly Contest #380", message: "Weekly coding contest starts in 2 hours. Prize pool: $500.", link: "https://leetcode.com", isRead: false, createdAt: new Date(Date.now() - 7200000).toISOString(), metadata: { platform: "LeetCode", prize: "$500" } },
  { id: "n3", type: "achievement", title: "🔥 7-Day Streak!", message: "Congratulations! You've maintained a 7-day learning streak. Keep it up!", link: "/achievements", isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "n4", type: "drive", title: "Microsoft Off-Campus Drive", message: "Microsoft is hiring fresh graduates. Apply before Feb 28, 2025.", link: "/companies/microsoft", isRead: false, createdAt: new Date(Date.now() - 172800000).toISOString(), metadata: { company: "Microsoft", deadline: "2025-02-28" } },
  { id: "n5", type: "reminder", title: "Resume Review Due", message: "You haven't updated your resume in 30 days. Keep it fresh for recruiters!", link: "/resume", isRead: true, createdAt: new Date(Date.now() - 259200000).toISOString() },
];

export const MOCK_RESOURCES: Resource[] = [
  { id: "r1", title: "DSA Cheat Sheet", description: "Complete Data Structures & Algorithms cheat sheet for interview prep.", type: "cheatsheet", category: "DSA", tags: ["Arrays", "Trees", "Graphs", "DP"], views: 12500, downloads: 4300, rating: 4.8, author: "PrepMate Team", createdAt: "2024-01-15T00:00:00Z" },
  { id: "r2", title: "System Design Interview Guide", description: "Comprehensive guide covering all system design concepts from basics to advanced.", type: "pdf", category: "System Design", tags: ["Scalability", "Databases", "Microservices"], views: 8900, downloads: 3100, rating: 4.9, author: "Gaurav Sen", createdAt: "2024-02-01T00:00:00Z" },
  { id: "r3", title: "Top 50 HR Interview Questions", description: "Curated list of most asked HR questions with model answers.", type: "notes", category: "HR Interview", tags: ["HR", "Behavioral", "Communication"], views: 15600, downloads: 6200, rating: 4.7, author: "PrepMate Team", createdAt: "2024-01-20T00:00:00Z" },
  { id: "r4", title: "SQL Interview Mastery", description: "Master SQL from basic queries to complex joins, subqueries, and window functions.", type: "cheatsheet", category: "SQL", tags: ["SQL", "DBMS", "Joins"], views: 7200, downloads: 2800, rating: 4.6, author: "DB Masters", createdAt: "2024-03-05T00:00:00Z" },
  { id: "r5", title: "Java OOP Concepts Deep Dive", description: "Everything about OOP in Java — inheritance, polymorphism, encapsulation, abstraction.", type: "pdf", category: "Java", tags: ["Java", "OOP", "Design Patterns"], views: 9400, downloads: 3500, rating: 4.5, author: "JavaPro", createdAt: "2024-02-15T00:00:00Z" },
  { id: "r6", title: "Operating Systems Notes", description: "Complete OS notes covering processes, threads, memory management, scheduling.", type: "notes", category: "OS", tags: ["OS", "Processes", "Memory Management"], views: 6800, downloads: 2400, rating: 4.4, author: "CS Fundamentals", createdAt: "2024-01-30T00:00:00Z" },
];

export const MOCK_BADGES: Badge[] = [
  { id: "b1", name: "First Solve", description: "Solved your first coding problem!", icon: "🎯", xpReward: 50, unlocked: true, unlockedAt: "2024-12-01", category: "coding", rarity: "common" },
  { id: "b2", name: "7-Day Streak", description: "Maintained a 7-day learning streak.", icon: "🔥", xpReward: 100, unlocked: true, unlockedAt: "2024-12-07", category: "streak", rarity: "rare" },
  { id: "b3", name: "Quiz Master", description: "Scored 100% in an aptitude quiz.", icon: "🧠", xpReward: 150, unlocked: true, unlockedAt: "2024-12-10", category: "aptitude", rarity: "rare" },
  { id: "b4", name: "Interview Ready", description: "Completed 10 mock interviews.", icon: "🎤", xpReward: 200, unlocked: false, category: "interview", rarity: "epic" },
  { id: "b5", name: "30-Day Streak", description: "Maintained a 30-day learning streak.", icon: "⚡", xpReward: 500, unlocked: false, category: "streak", rarity: "epic" },
  { id: "b6", name: "Problem Crusher", description: "Solved 100 coding problems.", icon: "💪", xpReward: 300, unlocked: false, category: "coding", rarity: "epic" },
  { id: "b7", name: "Algorithm Genius", description: "Solved 10 Hard difficulty problems.", icon: "🏆", xpReward: 400, unlocked: false, category: "coding", rarity: "legendary" },
  { id: "b8", name: "Speed Runner", description: "Solved a Medium problem in under 10 minutes.", icon: "⚡", xpReward: 250, unlocked: false, category: "coding", rarity: "rare" },
  { id: "b9", name: "Resume Pro", description: "Achieved ATS score above 90%.", icon: "📄", xpReward: 200, unlocked: false, category: "special", rarity: "rare" },
  { id: "b10", name: "Company Specialist", description: "Completed prep for 5 companies.", icon: "🏢", xpReward: 300, unlocked: false, category: "special", rarity: "epic" },
  { id: "b11", name: "Aptitude Ace", description: "Completed all aptitude categories.", icon: "📊", xpReward: 250, unlocked: false, category: "aptitude", rarity: "rare" },
  { id: "b12", name: "Legendary Coder", description: "Reached Level 10.", icon: "👑", xpReward: 1000, unlocked: false, category: "special", rarity: "legendary" },
];

export const MOCK_DAILY_ACTIVITY = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(Date.now() - (29 - i) * 86400000);
  return {
    date: date.toISOString().split("T")[0],
    coding: Math.floor(Math.random() * 8),
    aptitude: Math.floor(Math.random() * 15),
    studyHours: parseFloat((Math.random() * 4 + 0.5).toFixed(1)),
    interview: Math.floor(Math.random() * 2),
  };
});

export const MOCK_TOPIC_MASTERY = [
  { topic: "Arrays", solved: 28, total: 45, accuracy: 82 },
  { topic: "Strings", solved: 18, total: 30, accuracy: 75 },
  { topic: "Dynamic Programming", solved: 12, total: 40, accuracy: 60 },
  { topic: "Tree", solved: 15, total: 35, accuracy: 70 },
  { topic: "Graph", solved: 8, total: 30, accuracy: 55 },
  { topic: "Linked List", solved: 22, total: 25, accuracy: 88 },
  { topic: "Stack", solved: 18, total: 20, accuracy: 90 },
  { topic: "Binary Search", solved: 14, total: 20, accuracy: 78 },
];

export const MOCK_UPCOMING_DRIVES = [
  { id: "d1", title: "Google STEP Intern 2025", company: "Google", type: "internship", deadline: "2025-03-15", applyLink: "#" },
  { id: "d2", title: "Microsoft FTE Hiring", company: "Microsoft", type: "campus", deadline: "2025-02-28", applyLink: "#" },
  { id: "d3", title: "Amazon SDE Off-Campus", company: "Amazon", type: "off-campus", deadline: "2025-03-01", applyLink: "#" },
  { id: "d4", title: "Codeforces Round #920", company: "Codeforces", type: "contest", deadline: "2025-02-10", applyLink: "#" },
];

export const MOCK_WEEKLY_PLAN = {
  Monday: [
    { id: "t1", title: "Solve 3 Array problems (LeetCode)", type: "coding" as const, duration: 90, isCompleted: true, priority: "high" as const },
    { id: "t2", title: "Quantitative Aptitude Quiz (20 Qs)", type: "aptitude" as const, duration: 30, isCompleted: true, priority: "medium" as const },
    { id: "t3", title: "Read OS Chapter 3 - CPU Scheduling", type: "revision" as const, duration: 45, isCompleted: false, priority: "medium" as const },
  ],
  Tuesday: [
    { id: "t4", title: "Solve 2 String problems (LeetCode)", type: "coding" as const, duration: 60, isCompleted: true, priority: "high" as const },
    { id: "t5", title: "HR Mock Interview Practice (10 Qs)", type: "interview" as const, duration: 30, isCompleted: false, priority: "high" as const },
    { id: "t6", title: "Logical Reasoning Quiz", type: "aptitude" as const, duration: 30, isCompleted: false, priority: "medium" as const },
  ],
  Wednesday: [
    { id: "t7", title: "Dynamic Programming - Intro Problems", type: "coding" as const, duration: 120, isCompleted: false, priority: "high" as const },
    { id: "t8", title: "Update Resume - Add latest project", type: "resume" as const, duration: 45, isCompleted: false, priority: "medium" as const },
  ],
  Thursday: [
    { id: "t9", title: "Tree traversal problems (BFS/DFS)", type: "coding" as const, duration: 90, isCompleted: false, priority: "high" as const },
    { id: "t10", title: "Technical Interview Simulation - Java", type: "interview" as const, duration: 60, isCompleted: false, priority: "high" as const },
  ],
  Friday: [
    { id: "t11", title: "Graph problems - BFS/DFS", type: "coding" as const, duration: 90, isCompleted: false, priority: "high" as const },
    { id: "t12", title: "Data Interpretation Quiz", type: "aptitude" as const, duration: 45, isCompleted: false, priority: "medium" as const },
  ],
  Saturday: [
    { id: "t13", title: "Mock Interview - Full Round", type: "interview" as const, duration: 90, isCompleted: false, priority: "high" as const },
    { id: "t14", title: "Company Specific Prep - Google", type: "revision" as const, duration: 60, isCompleted: false, priority: "medium" as const },
    { id: "t15", title: "Solve 5 Mixed problems", type: "coding" as const, duration: 120, isCompleted: false, priority: "medium" as const },
  ],
  Sunday: [
    { id: "t16", title: "Weekly Revision - DS Topics", type: "revision" as const, duration: 60, isCompleted: false, priority: "low" as const },
    { id: "t17", title: "Verbal Ability Practice", type: "aptitude" as const, duration: 30, isCompleted: false, priority: "low" as const },
  ],
};
