import os
import sys
import uuid
import random
from datetime import datetime, timedelta

# Add backend dir to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.coding import CodingProblem, CodingSubmission
from app.models.company import Company, PlacementDrive
from app.models.resource import Resource
from app.models.notification import Notification
from app.models.notes import Note
from app.models.aptitude import AptitudeQuestion, QuizAttempt
import app.models

from app.core.security import hash_password


def seed_database():
    db = SessionLocal()
    
    print("Seeding database...")

    # 1. Fetch or create Demo User
    demo_user = db.query(User).filter(User.email == "demo@prepmate.dev").first()

    if not demo_user:
        print("Creating default demo user (demo@prepmate.dev)...")
        demo_user = User(
            name="Alex Johnson",
            email="demo@prepmate.dev",
            hashed_password=hash_password("demo1234"),
            role="user",
            college="MIT",
            branch="Computer Science",
            year=4,
            xp=1250,
            level=3,
            streak=7,
            longest_streak=14,
            target_companies=["Google", "Microsoft", "Amazon"],
            skills=["Python", "React", "System Design"],
            study_hours_per_day=4.0,
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

    # 2. Seed Coding Problems
    problems = [
        CodingProblem(
            title="Two Sum",
            slug="two-sum",
            difficulty="Easy",
            tags=["Arrays", "Hash Table"],
            description="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            examples=[
                {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]"}
            ],
            constraints=["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"],
            hints=["Try using a hash map to store the elements you have seen so far."],
            companies=["Google", "Amazon", "Microsoft"]
        ),
        CodingProblem(
            title="Valid Parentheses",
            slug="valid-parentheses",
            difficulty="Easy",
            tags=["Stack", "Strings"],
            description="Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
            examples=[
                {"input": "s = '()'", "output": "true"},
                {"input": "s = '()[]{}'", "output": "true"}
            ],
            constraints=["1 <= s.length <= 10^4"],
            hints=["Use a stack to keep track of opening brackets."],
            companies=["Facebook", "Amazon"]
        ),
        CodingProblem(
            title="Longest Substring Without Repeating Characters",
            slug="longest-substring",
            difficulty="Medium",
            tags=["Strings", "Sliding Window"],
            description="Given a string s, find the length of the longest substring without repeating characters.",
            examples=[
                {"input": "s = 'abcabcbb'", "output": "3"},
            ],
            constraints=["0 <= s.length <= 5 * 10^4"],
            hints=["A sliding window is a good approach here."],
            companies=["Google", "Microsoft", "TCS"]
        ),
        CodingProblem(
            title="Merge k Sorted Lists",
            slug="merge-k-sorted-lists",
            difficulty="Hard",
            tags=["Linked List", "Divide and Conquer", "Heap"],
            description="You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
            examples=[
                {"input": "lists = [[1,4,5],[1,3,4],[2,6]]", "output": "[1,1,2,3,4,4,5,6]"}
            ],
            constraints=["k == lists.length", "0 <= k <= 10^4"],
            hints=["Can you use a priority queue (min-heap)?"],
            companies=["Amazon", "Microsoft"]
        ),
        CodingProblem(
            title="Climbing Stairs",
            slug="climbing-stairs",
            difficulty="Easy",
            tags=["Dynamic Programming", "Math"],
            description="You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
            examples=[
                {"input": "n = 2", "output": "2"},
                {"input": "n = 3", "output": "3"}
            ],
            constraints=["1 <= n <= 45"],
            hints=["To reach step n, you could have come from step n-1 or step n-2."],
            companies=["Infosys", "Wipro", "TCS"]
        )
    ]
    
    for p in problems:
        if not db.query(CodingProblem).filter_by(slug=p.slug).first():
            db.add(p)
    db.commit()
    print("Coding Problems seeded.")

    # 3. Seed Companies
    companies = [
        Company(
            name="Google",
            slug="google",
            logo="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
            industry="Technology",
            tier="FAANG",
            difficulty="Hard",
            avg_package="30+ LPA",
            website="careers.google.com",
            description="Google is a multinational technology company that specializes in Internet-related services and products.",
            interview_rounds=[
                {"name": "Phone Screen", "description": "45 min DSA round"},
                {"name": "Onsite 1", "description": "DSA and problem solving"},
                {"name": "Onsite 2", "description": "System Design"},
                {"name": "Googlyness", "description": "Behavioral round"}
            ],
            coding_topics=["Graphs", "Dynamic Programming", "Trees"],
            technical_topics=["System Design", "OS", "Networks"],
            is_active=True
        ),
        Company(
            name="Microsoft",
            slug="microsoft",
            logo="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
            industry="Technology",
            tier="FAANG",
            difficulty="Hard",
            avg_package="20+ LPA",
            website="careers.microsoft.com",
            description="Microsoft Corporation is an American multinational technology corporation.",
            interview_rounds=[
                {"name": "Online Assessment", "description": "3 coding questions"},
                {"name": "Technical 1", "description": "DSA & OS"},
                {"name": "Technical 2", "description": "System Design & Projects"},
                {"name": "AA Round", "description": "As Appropriate - Director level"}
            ],
            coding_topics=["Arrays", "Strings", "Linked List"],
            technical_topics=["DBMS", "OOPs", "OS"],
            is_active=True
        ),
        Company(
            name="TCS",
            slug="tcs",
            logo="https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg",
            industry="IT Services",
            tier="Service",
            difficulty="Medium",
            avg_package="3.3 - 7 LPA",
            website="tcs.com/careers",
            description="Tata Consultancy Services is an Indian multinational information technology services and consulting company.",
            interview_rounds=[
                {"name": "TCS NQT", "description": "Aptitude, Verbal, Logical, Coding"},
                {"name": "Technical HR", "description": "Project discussion and basics"},
                {"name": "Managerial HR", "description": "Behavioral assessment"}
            ],
            coding_topics=["Arrays", "Strings", "Math"],
            aptitude_topics=["Time and Work", "Percentages", "Logical Reasoning"],
            is_active=True
        )
    ]
    for c in companies:
        if not db.query(Company).filter_by(slug=c.slug).first():
            db.add(c)
    db.commit()
    print("Companies seeded.")

    # 4. Seed Aptitude Questions
    aptitude_questions = [
        AptitudeQuestion(
            category="Quantitative Aptitude",
            question="If a person walks at 14 km/hr instead of 10 km/hr, he would have walked 20 km more. The actual distance travelled by him is:",
            options=["50 km", "56 km", "70 km", "80 km"],
            correct_answer=0,
            explanation="Let the actual distance travelled be x km. Then, (x + 20)/14 = x/10. Solving this gives x = 50 km.",
            difficulty="Medium",
            time_limit=60
        ),
        AptitudeQuestion(
            category="Logical Reasoning",
            question="Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?",
            options=["(1/3)", "(1/8)", "(2/8)", "(1/16)"],
            correct_answer=1,
            explanation="This is a simple alternating division series; each number is one-half of the previous number.",
            difficulty="Easy",
            time_limit=45
        ),
        AptitudeQuestion(
            category="Verbal Ability",
            question="Antonym of 'ENORMOUS' is:",
            options=["Soft", "Average", "Tiny", "Weak"],
            correct_answer=2,
            explanation="Enormous means very large in size, quantity, or extent. Tiny is its exact opposite.",
            difficulty="Easy",
            time_limit=30
        ),
        AptitudeQuestion(
            category="Data Interpretation",
            question="In a pie chart, if the central angle for a category is 90 degrees, what percentage of the total does it represent?",
            options=["20%", "25%", "30%", "35%"],
            correct_answer=1,
            explanation="A full circle is 360 degrees, which corresponds to 100%. Therefore, 90 degrees corresponds to (90/360) * 100% = 25%.",
            difficulty="Easy",
            time_limit=45
        )
    ]
    for aq in aptitude_questions:
        if not db.query(AptitudeQuestion).filter_by(question=aq.question).first():
            db.add(aq)
    db.commit()
    print("Aptitude Questions seeded.")

    # 5. Seed Resources
    resources = [
        Resource(
            title="NeetCode 150 DSA Roadmap",
            description="Curated list of 150 essential Data Structures & Algorithms patterns for coding interviews.",
            type="cheatsheet",
            category="DSA",
            tags=["DSA", "LeetCode", "Cheat Sheet"],
            url="https://neetcode.io/roadmap",
            download_url="https://neetcode.io/roadmap",
            author="NeetCode",
            rating=4.9,
            views=1240,
            downloads=890
        ),
        Resource(
            title="System Design Primer",
            description="Comprehensive open-source guide to designing large-scale distributed systems.",
            type="article",
            category="System Design",
            tags=["System Design", "Distributed Systems", "Architecture"],
            url="https://github.com/donnemartin/system-design-primer",
            download_url="https://github.com/donnemartin/system-design-primer",
            author="Donne Martin",
            rating=4.9,
            views=3200,
            downloads=2100
        ),
        Resource(
            title="Striver's SDE Sheet & Practice Guide",
            description="Top 180 SDE interview problems covering Arrays, Trees, Graphs, DP and Recursion.",
            type="notes",
            category="DSA",
            tags=["Striver", "SDE Sheet", "Placement Prep"],
            url="https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2",
            download_url="https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2",
            author="Striver (takeUforward)",
            rating=4.8,
            views=2800,
            downloads=1950
        ),
        Resource(
            title="Operating Systems: Three Easy Pieces (OSTEP)",
            description="Complete operating systems textbook covering virtualization, concurrency, and persistence.",
            type="pdf",
            category="OS",
            tags=["OS", "Processes", "Concurrency", "PDF"],
            url="https://pages.cs.wisc.edu/~remzi/OSTEP/",
            download_url="https://pages.cs.wisc.edu/~remzi/OSTEP/",
            author="Remzi Arpaci-Dusseau",
            rating=4.9,
            views=1500,
            downloads=1100
        ),
        Resource(
            title="SQL Zoo Interactive Practice Guide",
            description="Interactive tutorials and quizzes covering SQL Queries, JOINS, GROUP BY, and Aggregations.",
            type="article",
            category="SQL",
            tags=["SQL", "Database", "Queries"],
            url="https://sqlzoo.net/",
            download_url="https://sqlzoo.net/",
            author="SQLZoo",
            rating=4.7,
            views=1650,
            downloads=920
        ),
        Resource(
            title="TCS NQT & Ninja Complete Aptitude Guide",
            description="Official previous year questions, quantitative shortcuts, and logical reasoning practice.",
            type="pdf",
            category="Aptitude",
            tags=["TCS", "NQT", "Aptitude"],
            url="https://www.geeksforgeeks.org/tcs-nqt-preparation/",
            download_url="https://www.geeksforgeeks.org/tcs-nqt-preparation/",
            author="PrepMate & GeeksforGeeks",
            rating=4.8,
            views=2100,
            downloads=1400
        )
    ]
    for r in resources:
        if not db.query(Resource).filter_by(title=r.title).first():
            db.add(r)
    db.commit()
    print("Resources seeded.")

    # 5. Seed Notifications
    notifications = [
        Notification(
            type="drive",
            title="Amazon Off-Campus Drive 2026",
            message="Amazon is hiring SDE 1. Eligibility: 2026 graduates with 8+ CGPA. Apply before 15th Sept.",
            link="/companies/amazon",
            is_global=True
        ),
        Notification(
            type="system",
            title="Welcome to PrepMate!",
            message="Your ultimate AI-powered placement preparation journey begins here.",
            is_global=True
        )
    ]
    for n in notifications:
        if not db.query(Notification).filter_by(title=n.title).first():
            db.add(n)
    db.commit()
    print("Notifications seeded.")

    # 6. Seed Notes for Demo User
    if db.query(Note).filter_by(user_id=demo_user.id).count() == 0:
        notes = [
            Note(
                user_id=demo_user.id,
                title="OS Concepts",
                content="1. Process vs Thread\n2. Deadlock conditions (Mutual exclusion, Hold and wait, No preemption, Circular wait)\n3. Virtual Memory and Paging",
                tags=["OS", "Theory"]
            ),
            Note(
                user_id=demo_user.id,
                title="DBMS Normalization",
                content="1NF: Atomic values\n2NF: 1NF + No partial dependency\n3NF: 2NF + No transitive dependency\nBCNF: stricter 3NF where X -> Y implies X is a superkey.",
                tags=["DBMS", "Theory"]
            )
        ]
        db.add_all(notes)
        db.commit()
        print("Notes seeded.")

    # 7. Seed Analytics (Coding Submissions) for Demo User
    db_problems = db.query(CodingProblem).all()
    if db.query(CodingSubmission).filter_by(user_id=demo_user.id).count() == 0 and db_problems:
        submissions = []
        for i, p in enumerate(db_problems[:3]):
            sub_date = datetime.utcnow() - timedelta(days=i)
            submissions.append(
                CodingSubmission(
                    user_id=demo_user.id,
                    problem_id=p.id,
                    code="def solve():\n    pass",
                    language="python",
                    status="solved",
                    time_taken=1200,
                    submitted_at=sub_date
                )
            )
        db.add_all(submissions)
        demo_user.xp += 150 # 50 XP per solve
        demo_user.streak = 3
        demo_user.longest_streak = 3
        db.commit()
        print("Analytics (Submissions) seeded.")
        
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
