import asyncio
import httpx
from app.main import app


async def run_tests():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. Health check
        res = await client.get("/api/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        print("✓ Health check endpoint passed")

        # 2. Categories
        res = await client.get("/api/v1/categories")
        assert res.status_code == 200, f"Categories failed: {res.text}"
        categories = res.json()
        assert len(categories) > 0, "No categories returned"
        print(f"✓ Categories endpoint passed ({len(categories)} categories found)")

        # 3. Citizen Login
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"email": "citizen@example.com", "password": "civicpulse123"}
        )
        assert login_res.status_code == 200, f"Citizen login failed: {login_res.text}"
        citizen_token = login_res.json()["access_token"]
        print("✓ Citizen authentication passed")

        # 4. Citizen Issues List
        res = await client.get(
            "/api/v1/citizen/issues/my",
            headers={"Authorization": f"Bearer {citizen_token}"}
        )
        assert res.status_code == 200, f"Get my issues failed: {res.text}"
        my_issues = res.json()
        print(f"✓ Citizen my issues passed ({my_issues['total']} issues found)")

        # 5. Create Issue by Citizen
        new_issue_payload = {
            "title": "Broken Sidewalk Slab along Elm St",
            "description": "Concrete slab raised 4 inches causing trip hazards.",
            "category_id": categories[0]["id"],
            "priority": "MEDIUM",
            "address": "400 Elm Street, Ward 1",
            "landmark": "Near Elm Community Library",
            "ward": "Ward 1 - Downtown Core",
            "latitude": 37.775,
            "longitude": -122.418,
            "attachments": []
        }
        res = await client.post(
            "/api/v1/citizen/issues",
            json=new_issue_payload,
            headers={"Authorization": f"Bearer {citizen_token}"}
        )
        assert res.status_code == 201, f"Create issue failed: {res.text}"
        created_issue = res.json()
        created_tracking = created_issue["tracking_number"]
        created_id = created_issue["id"]
        print(f"✓ Create issue passed (Tracking: {created_tracking})")

        # 6. Admin Login
        admin_login = await client.post(
            "/api/v1/auth/login",
            json={"email": "admin@civicpulse.gov", "password": "civicpulse123"}
        )
        assert admin_login.status_code == 200, f"Admin login failed: {admin_login.text}"
        admin_token = admin_login.json()["access_token"]
        print("✓ Admin authentication passed")

        # 7. Admin Issues List & Filter
        res = await client.get(
            "/api/v1/admin/issues?ward=Ward 1 - Downtown Core",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 200, f"Admin issues query failed: {res.text}"
        admin_issues = res.json()
        print(f"✓ Admin issue filter passed ({admin_issues['total']} filtered items)")

        # 8. Admin Analytics
        res = await client.get(
            "/api/v1/admin/analytics",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 200, f"Admin analytics query failed: {res.text}"
        analytics = res.json()
        print(f"✓ Admin analytics overview passed ({analytics['total_issues']} total issues logged)")

        # 9. Admin Assign Worker
        workers_res = await client.get(
            "/api/v1/admin/workers",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert workers_res.status_code == 200
        workers = workers_res.json()
        first_worker = workers[0]

        assign_res = await client.post(
            f"/api/v1/admin/issues/{created_id}/assign",
            json={
                "worker_id": first_worker["id"],
                "dispatch_notes": "Urgent sidewalk inspection requested.",
                "priority_override": "HIGH"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert assign_res.status_code == 200, f"Admin assign failed: {assign_res.text}"
        print(f"✓ Admin assign specialist passed")

        # 10. Worker Login & Assigned Task Check
        worker_login = await client.post(
            "/api/v1/auth/login",
            json={"email": "worker@civicpulse.gov", "password": "civicpulse123"}
        )
        assert worker_login.status_code == 200
        worker_token = worker_login.json()["access_token"]
        print("✓ Field Specialist authentication passed")

        worker_issues = await client.get(
            "/api/v1/worker/issues",
            headers={"Authorization": f"Bearer {worker_token}"}
        )
        assert worker_issues.status_code == 200
        print(f"✓ Worker assigned tasks list passed ({len(worker_issues.json())} tasks)")

        # 11. Worker Resolve Issue
        resolve_res = await client.post(
            f"/api/v1/worker/issues/{created_id}/resolve",
            params={"resolution_notes": "Ground down concrete lip and poured fast-curing epoxy leveling compound."},
            headers={"Authorization": f"Bearer {worker_token}"}
        )
        assert resolve_res.status_code == 200, f"Worker resolve failed: {resolve_res.text}"
        print("✓ Worker resolve task passed")

        # 12. Citizen Verify and Rate
        verify_res = await client.post(
            f"/api/v1/citizen/issues/{created_id}/verify",
            json={
                "is_satisfactory": True,
                "rating": 5,
                "feedback": "Smooth and level now. Thank you!"
            },
            headers={"Authorization": f"Bearer {citizen_token}"}
        )
        assert verify_res.status_code == 200, f"Citizen verification failed: {verify_res.text}"
        print("✓ Citizen verification and 5-star rating passed")

        # 13. Public Tracking Lookup
        track_res = await client.get(f"/api/v1/citizen/track/{created_tracking}")
        assert track_res.status_code == 200, f"Track lookup failed: {track_res.text}"
        tracked_data = track_res.json()
        assert tracked_data["status"] == "VERIFIED"
        print(f"✓ Public Tracking lookup for {created_tracking} verified (Status: {tracked_data['status']})")

    print("\n=======================================================")
    print("ALL FASTAPI BACKEND API INTEGRATION TESTS PASSED 100%!")
    print("=======================================================")


if __name__ == "__main__":
    asyncio.run(run_tests())
