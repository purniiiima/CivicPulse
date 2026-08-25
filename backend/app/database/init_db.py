import logging
import asyncio
from datetime import datetime, timezone, timedelta
from sqlalchemy import select, func
from app.database.session import engine, AsyncSessionLocal
from app.database.base import Base
from app.models.user import User, UserRole
from app.models.organization import Organization
from app.models.worker import Worker, WorkerStatus
from app.models.issue_category import IssueCategory
from app.models.issue import Issue, IssueStatus, IssuePriority
from app.models.issue_status_history import IssueStatusHistory
from app.models.issue_comment import IssueComment
from app.models.issue_attachment import IssueAttachment
from app.models.notification import Notification
from app.core.security import get_password_hash

logger = logging.getLogger("civicpulse.init_db")

SEED_USERS = [
    # Super Administrators (Municipal Command Authority)
    {
        "id": "u-superadmin-01",
        "email": "superadmin@civicpulse.gov",
        "full_name": "Sandeep Kumar",
        "phone": "+1 (555) 019-0001",
        "role": UserRole.SUPER_ADMIN,
        "department": "Citywide Governance Directorate",
        "org_slug": "transportation-works",
        "points": 1000,
    },
    {
        "id": "u-superadmin-02",
        "email": "director.superadmin@civicpulse.gov",
        "full_name": "Rajesh Patel",
        "phone": "+1 (555) 019-0002",
        "role": UserRole.SUPER_ADMIN,
        "department": "Municipal Operations Oversight",
        "org_slug": "transportation-works",
        "points": 1000,
    },
    # Organization Administrators (Departmental Agency Admins)
    {
        "id": "u-admin-01",
        "email": "admin@metropolis.gov",
        "full_name": "Neha Sharma",
        "phone": "+1 (555) 431-9000",
        "role": UserRole.ORGANIZATION_ADMIN,
        "department": "Infrastructure Operations Directorate",
        "org_slug": "transportation-works",
        "points": 500,
    },
    {
        "id": "u-admin-02",
        "email": "admin@civicpulse.gov",
        "full_name": "Amit Verma",
        "phone": "+1 (555) 431-9001",
        "role": UserRole.ORGANIZATION_ADMIN,
        "department": "Transportation & Works",
        "org_slug": "transportation-works",
        "points": 500,
    },
    {
        "id": "u-admin-03",
        "email": "roads.admin@civicpulse.gov",
        "full_name": "Pooja Deshmukh",
        "phone": "+1 (555) 431-9002",
        "role": UserRole.ORGANIZATION_ADMIN,
        "department": "Roadways & Pavements Directorate",
        "org_slug": "transportation-works",
        "points": 500,
    },
    {
        "id": "u-admin-04",
        "email": "water.admin@civicpulse.gov",
        "full_name": "Ananya Iyer",
        "phone": "+1 (555) 431-9003",
        "role": UserRole.ORGANIZATION_ADMIN,
        "department": "Water Supply & Drainage Operations",
        "org_slug": "water-drainage",
        "points": 500,
    },
    {
        "id": "u-admin-05",
        "email": "sanitation.admin@civicpulse.gov",
        "full_name": "Suresh Menon",
        "phone": "+1 (555) 431-9004",
        "role": UserRole.ORGANIZATION_ADMIN,
        "department": "Sanitation & Waste Management",
        "org_slug": "sanitation-environment",
        "points": 500,
    },
    {
        "id": "u-admin-06",
        "email": "electrical.admin@civicpulse.gov",
        "full_name": "Kavita Rao",
        "phone": "+1 (555) 431-9005",
        "role": UserRole.ORGANIZATION_ADMIN,
        "department": "Electrical Grid & Lighting Directorate",
        "org_slug": "transportation-works",
        "points": 500,
    },
    # Citizens
    {
        "id": "u-citizen-01",
        "email": "citizen@example.com",
        "full_name": "Sarah Jenkins",
        "phone": "+1 (555) 892-3112",
        "role": UserRole.CITIZEN,
        "department": None,
        "org_slug": None,
        "points": 120,
    },
    # Field Workers
    {
        "id": "u-worker-01",
        "email": "worker@civicpulse.gov",
        "full_name": "Marcus Thorne",
        "phone": "+1 (555) 782-4410",
        "role": UserRole.WORKER,
        "department": "Transportation & Works",
        "org_slug": "transportation-works",
        "points": 340,
        "employee_code": "PW-104",
        "specialization": "Asphalt & Road Surface Engineering",
        "rating": 4.9,
        "completed_jobs": 84,
        "status": WorkerStatus.ON_JOB,
    },
    {
        "id": "u-worker-02",
        "email": "worker2@civicpulse.gov",
        "full_name": "Elena Cruz",
        "phone": "+1 (555) 661-8932",
        "role": UserRole.WORKER,
        "department": "Water Utilities",
        "org_slug": "water-drainage",
        "points": 280,
        "employee_code": "WU-209",
        "specialization": "High-Pressure Main Leak Repair",
        "rating": 4.8,
        "completed_jobs": 62,
        "status": WorkerStatus.AVAILABLE,
    },
]


async def init_db():
    logger.info("Initializing database schema and seed records...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # 1. Ensure organizations exist
        org_map = {}
        for org_slug, name, dept_type, email, phone, addr in [
            ("transportation-works", "Department of Transportation & Public Works", "Infrastructure", "roads@civicpulse.gov", "(555) 019-2831", "100 City Hall Plaza, Suite 400"),
            ("sanitation-environment", "Public Sanitation & Environmental Management", "Sanitation", "sanitation@civicpulse.gov", "(555) 019-4920", "450 Eco Depot Way"),
            ("water-drainage", "Water Utilities & Drainage Authority", "Utilities", "water@civicpulse.gov", "(555) 019-8833", "220 Reservoir Road"),
        ]:
            res = await session.execute(select(Organization).where(Organization.slug == org_slug))
            existing_org = res.scalar_one_or_none()
            if not existing_org:
                new_org = Organization(
                    name=name,
                    slug=org_slug,
                    department_type=dept_type,
                    contact_email=email,
                    phone=phone,
                    address=addr
                )
                session.add(new_org)
                await session.flush()
                org_map[org_slug] = new_org
            else:
                org_map[org_slug] = existing_org

        # 2. Ensure issue categories exist
        default_categories = [
            ("Pothole & Road Hazard", "pothole-road", "Transportation & Works", "AlertCircle", IssuePriority.HIGH, 24, "Deep potholes, surface cracks, crumbling asphalt, or cave-ins."),
            ("Streetlight & Electrical", "streetlight-outage", "Transportation & Works", "Zap", IssuePriority.MEDIUM, 48, "Dark roadway lamp posts, exposed wiring, flickering luminaires."),
            ("Water Main & Hydrant Leak", "water-leak", "Water Utilities", "Droplets", IssuePriority.CRITICAL, 6, "Gushing pipes, flooded intersections, damaged fire hydrants."),
            ("Garbage & Illegal Dumping", "garbage-dumping", "Public Sanitation", "Trash2", IssuePriority.MEDIUM, 24, "Overflowing community dumpsters, hazardous waste, litter clusters."),
            ("Traffic Signal Failure", "traffic-signal", "Transportation & Works", "ShieldAlert", IssuePriority.CRITICAL, 4, "Unresponsive junction signals, blinking red lights, downed signal poles."),
            ("Fallen Tree & Biohazard", "fallen-tree", "Parks & Recreation", "Trees", IssuePriority.HIGH, 12, "Storm-felled limbs blocking lanes, leaning diseased arbor hazards."),
        ]
        saved_categories = []
        for name, slug, dept, icon, prio, sla, desc in default_categories:
            res = await session.execute(select(IssueCategory).where(IssueCategory.slug == slug))
            existing_cat = res.scalar_one_or_none()
            if not existing_cat:
                new_cat = IssueCategory(
                    name=name,
                    slug=slug,
                    department=dept,
                    icon=icon,
                    default_priority=prio,
                    sla_hours=sla,
                    description=desc
                )
                session.add(new_cat)
                await session.flush()
                saved_categories.append(new_cat)
            else:
                saved_categories.append(existing_cat)

        # 3. Synchronize and seed all users (with Password123! hash)
        password_hash = get_password_hash("Password123!")
        user_entities = {}

        for seed in SEED_USERS:
            email_clean = seed["email"].lower().strip()
            res = await session.execute(select(User).where(func.lower(User.email) == email_clean))
            user = res.scalar_one_or_none()
            org_id = org_map[seed["org_slug"]].id if seed.get("org_slug") and seed["org_slug"] in org_map else None

            if not user:
                user = User(
                    id=seed["id"],
                    email=seed["email"],
                    hashed_password=password_hash,
                    full_name=seed["full_name"],
                    phone=seed["phone"],
                    role=seed["role"],
                    organization_id=org_id,
                    points=seed.get("points", 0),
                    is_active=True
                )
                session.add(user)
                await session.flush()
            else:
                # Update credentials and active state to ensure valid authentication
                user.hashed_password = password_hash
                user.role = seed["role"]
                user.full_name = seed["full_name"]
                user.is_active = True
                if org_id:
                    user.organization_id = org_id

            user_entities[seed["email"]] = user

            # Create or update worker profile if applicable
            if seed["role"] == UserRole.WORKER:
                w_res = await session.execute(select(Worker).where(Worker.user_id == user.id))
                worker_profile = w_res.scalar_one_or_none()
                if not worker_profile:
                    worker_profile = Worker(
                        user_id=user.id,
                        organization_id=org_id or org_map["transportation-works"].id,
                        employee_code=seed.get("employee_code", f"WK-{user.id[:4]}"),
                        specialization=seed.get("specialization", "General Maintenance"),
                        department=seed.get("department", "Transportation & Works"),
                        phone=seed["phone"],
                        rating=seed.get("rating", 4.8),
                        completed_jobs=seed.get("completed_jobs", 10),
                        active_issues_count=1 if seed.get("status") == WorkerStatus.ON_JOB else 0,
                        status=seed.get("status", WorkerStatus.AVAILABLE)
                    )
                    session.add(worker_profile)
                    await session.flush()

        # 4. Check if sample issues exist, seed if empty
        issue_res = await session.execute(select(Issue).limit(1))
        if not issue_res.scalar_one_or_none():
            logger.info("Seeding initial representative issues...")
            citizen_u = user_entities.get("citizen@example.com")
            admin_u = user_entities.get("admin@civicpulse.gov")
            worker_u = user_entities.get("worker@civicpulse.gov")
            dot_org = org_map["transportation-works"]
            water_org = org_map["water-drainage"]

            w_prof_res = await session.execute(select(Worker).where(Worker.user_id == worker_u.id)) if worker_u else None
            w_prof = w_prof_res.scalar_one_or_none() if w_prof_res else None

            if citizen_u and saved_categories:
                issue1 = Issue(
                    tracking_number="CP-2026-08429",
                    title="Severe Pothole Cluster near 5th Ave Crosswalk",
                    description="Deep 8-inch asphalt pothole causing tire rim damage and sudden braking near school crosswalk zone. Rainwater is currently pooling inside it.",
                    category_id=saved_categories[0].id,
                    priority=IssuePriority.HIGH,
                    status=IssueStatus.IN_PROGRESS,
                    address="742 Evergreen Terrace, Ward 1",
                    landmark="Near Lincoln Elementary Crosswalk",
                    ward="Ward 1 - Downtown Core",
                    latitude=37.7749,
                    longitude=-122.4194,
                    reporter_id=citizen_u.id,
                    organization_id=dot_org.id,
                    assigned_worker_id=w_prof.id if w_prof else None,
                    upvotes_count=18
                )

                issue2 = Issue(
                    tracking_number="CP-2026-09102",
                    title="Burst Water Main Flooding North Lane",
                    description="Continuous torrent of water spilling across roadway from damaged subsurface valve box. Low water pressure reported by adjacent residential buildings.",
                    category_id=saved_categories[2].id if len(saved_categories) > 2 else saved_categories[0].id,
                    priority=IssuePriority.CRITICAL,
                    status=IssueStatus.REPORTED,
                    address="1200 Market Street & 8th",
                    landmark="Opposite Metro Plaza Station",
                    ward="Ward 3 - Metro Transit North",
                    latitude=37.7812,
                    longitude=-122.4121,
                    reporter_id=citizen_u.id,
                    organization_id=water_org.id,
                    upvotes_count=34
                )

                issue3 = Issue(
                    tracking_number="CP-2026-07811",
                    title="Dark Roadway Light Pole (#LP-440)",
                    description="Luminaire out for 4 consecutive nights creating hazardous blind spots for cyclists and pedestrians.",
                    category_id=saved_categories[1].id if len(saved_categories) > 1 else saved_categories[0].id,
                    priority=IssuePriority.MEDIUM,
                    status=IssueStatus.RESOLVED,
                    address="350 West Boulevard",
                    landmark="Next to Community Recreation Center",
                    ward="Ward 2 - Westside Park",
                    latitude=37.7650,
                    longitude=-122.4300,
                    reporter_id=citizen_u.id,
                    organization_id=dot_org.id,
                    assigned_worker_id=w_prof.id if w_prof else None,
                    resolution_notes="Replaced faulty ballast and upgraded ballast circuit to energy-efficient 120W LED luminaire.",
                    resolution_rating=5,
                    resolution_feedback="Prompt turnaround! Roadway is safely lit now.",
                    resolved_at=datetime.now(timezone.utc) - timedelta(days=1),
                    upvotes_count=8
                )

                session.add_all([issue1, issue2, issue3])
                await session.flush()

                # Status History
                h1 = IssueStatusHistory(
                    issue_id=issue1.id,
                    old_status=None,
                    new_status=IssueStatus.REPORTED,
                    changed_by_user_id=citizen_u.id,
                    notes="Citizen submitted report via mobile portal."
                )
                h2 = IssueStatusHistory(
                    issue_id=issue1.id,
                    old_status=IssueStatus.REPORTED,
                    new_status=IssueStatus.ASSIGNED,
                    changed_by_user_id=admin_u.id if admin_u else citizen_u.id,
                    notes="Dispatched to Marcus Thorne (PW-104)."
                )
                h3 = IssueStatusHistory(
                    issue_id=issue1.id,
                    old_status=IssueStatus.ASSIGNED,
                    new_status=IssueStatus.IN_PROGRESS,
                    changed_by_user_id=worker_u.id if worker_u else citizen_u.id,
                    notes="Field crew arrived on site; cold-mix patch compaction underway."
                )

                # Comments
                c1 = IssueComment(
                    issue_id=issue1.id,
                    user_id=citizen_u.id,
                    content="Thank you for the quick assignment! The hole is expanding after morning rain.",
                    is_internal=False
                )

                # Notifications
                n1 = Notification(
                    user_id=citizen_u.id,
                    issue_id=issue1.id,
                    title="Specialist Dispatched",
                    message="Marcus Thorne (PW-104) has arrived on site for CP-2026-08429.",
                    notification_type="in_progress",
                    is_read=False
                )

                session.add_all([h1, h2, h3, c1, n1])

        await session.commit()
        logger.info("Database initialization and seed complete!")
