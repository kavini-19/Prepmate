# Import all models so Alembic can detect them
from app.models.user import User
from app.models.coding import CodingProblem, CodingSubmission, ProblemBookmark
from app.models.aptitude import AptitudeQuestion, QuizAttempt
from app.models.notes import Note
from app.models.achievements import Badge, UserAchievement
from app.models.company import Company, PlacementDrive
from app.models.notification import Notification
from app.models.resource import Resource
