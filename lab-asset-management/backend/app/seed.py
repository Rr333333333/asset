"""
Seed sample data so the dashboard, charts and tables are populated on first run.
Only runs for the local backend and only when a module has no rows yet.
"""
import random
from datetime import date, timedelta

from app.modules import MODULES, module_headers
from app.storage import get_storage

random.seed(7)

DEPTS = ["Pathology", "Microbiology", "Radiology", "Biochemistry", "IT", "Research"]
LABS = ["Lab A", "Lab B", "Lab C", "Lab D"]
CATS = ["Computer", "Microscope", "Centrifuge", "Printer", "Server",
        "Network Device", "Analyzer"]
STATUS = ["Active", "Active", "Active", "Faulty", "Under Maintenance", "Retired"]
VENDORS = ["MedTech Inc", "LabSupply Co", "CompWorld", "BioGear Ltd", "NetServe"]


def _d(days_ago: int) -> str:
    return (date.today() - timedelta(days=days_ago)).isoformat()


def _future(days: int) -> str:
    return (date.today() + timedelta(days=days)).isoformat()


def seed_assets(n=40):
    rows = []
    for i in range(1, n + 1):
        cat = random.choice(CATS)
        rows.append({
            "Asset ID": f"AST-{i:04d}",
            "Asset Name": f"{cat} Unit {i}",
            "Category": cat,
            "Manufacturer": random.choice(["Dell", "HP", "Zeiss", "Thermo", "Cisco"]),
            "Model": f"M{random.randint(100,999)}",
            "Serial Number": f"SN{random.randint(10000,99999)}",
            "Department": random.choice(DEPTS),
            "Laboratory": random.choice(LABS),
            "Purchase Date": _d(random.randint(200, 2000)),
            "Installation Date": _d(random.randint(100, 199)),
            "Warranty Expiry": _future(random.randint(-90, 400)),
            "Vendor": random.choice(VENDORS),
            "Purchase Cost": random.randint(500, 25000),
            "Current Status": random.choice(STATUS),
            "Assigned To": random.choice(["A. Kumar", "S. Rao", "J. Lee", "M. Iqbal"]),
            "Location": f"{random.choice(LABS)} - Rack {random.randint(1,9)}",
            "Remarks": "",
        })
    return rows


def seed_stock(n=25):
    items = ["SSD 512GB", "RAM 16GB", "Gloves Box", "Pipette Tips", "Ethanol 1L",
             "Power Supply", "Network Cable", "Toner Cartridge", "Test Tubes"]
    rows = []
    for i in range(1, n + 1):
        cur = random.randint(0, 120)
        mn = random.randint(10, 40)
        issued = random.randint(0, 30)
        rows.append({
            "Item ID": f"ITM-{i:04d}",
            "Item Name": random.choice(items),
            "Category": random.choice(["Consumable", "Spare Part", "Reagent", "Component"]),
            "Supplier": random.choice(VENDORS),
            "Current Stock": cur,
            "Minimum Stock": mn,
            "Maximum Stock": mn * 5,
            "Unit Price": random.randint(5, 500),
            "Purchase Date": _d(random.randint(10, 400)),
            "Issued Quantity": issued,
            "Available Quantity": max(cur - issued, 0),
            "Remarks": "",
        })
    return rows


def seed_hardware(n=20):
    rows = []
    for i in range(1, n + 1):
        cpu = random.randint(5, 99)
        temp = random.randint(30, 88)
        health = "Critical" if (cpu > 85 or temp > 80) else "Warning" if cpu > 65 else "Healthy"
        rows.append({
            "Device ID": f"DEV-{i:04d}",
            "CPU Usage": cpu,
            "RAM Usage": random.randint(20, 98),
            "Storage Usage": random.randint(30, 97),
            "Temperature": temp,
            "Network Status": random.choice(["Online", "Online", "Offline", "Degraded"]),
            "Last Checked": _d(random.randint(0, 5)),
            "Health Status": health,
        })
    return rows


def seed_maintenance(n=30):
    rows = []
    for i in range(1, n + 1):
        st = random.choice(["Open", "In Progress", "Resolved", "Closed"])
        req = random.randint(5, 300)
        rows.append({
            "Request ID": f"REQ-{i:04d}",
            "Asset ID": f"AST-{random.randint(1,40):04d}",
            "Problem Description": random.choice(
                ["Won't power on", "Overheating", "Calibration drift",
                 "Network drop", "Fan noise", "Slow performance"]),
            "Priority": random.choice(["Low", "Medium", "High", "Critical"]),
            "Reported By": random.choice(["A. Kumar", "S. Rao", "J. Lee"]),
            "Assigned Engineer": random.choice(["E. Turner", "R. Das", "P. Nair"]),
            "Request Date": _d(req),
            "Completion Date": _d(max(req - random.randint(1, 20), 0))
                if st in ("Resolved", "Closed") else "",
            "Current Status": st,
            "Remarks": "",
        })
    return rows


def seed_preventive(n=20):
    rows = []
    for i in range(1, n + 1):
        st = random.choice(["Scheduled", "Completed", "Overdue"])
        rows.append({
            "Maintenance ID": f"PM-{i:04d}",
            "Asset ID": f"AST-{random.randint(1,40):04d}",
            "Maintenance Type": random.choice(
                ["Inspection", "Calibration", "Cleaning", "Servicing"]),
            "Scheduled Date": _future(random.randint(-30, 30)),
            "Completed Date": _d(random.randint(1, 30)) if st == "Completed" else "",
            "Next Due Date": _future(random.randint(30, 180)),
            "Status": st,
            "Engineer": random.choice(["E. Turner", "R. Das", "P. Nair"]),
        })
    return rows


def seed_predictive(n=25):
    rows = []
    for i in range(1, n + 1):
        rows.append({
            "Asset ID": f"AST-{i:04d}",
            "Age": random.randint(1, 11),
            "Failure Count": random.randint(0, 8),
            "Downtime Hours": random.randint(0, 350),
            "Last Service": _d(random.randint(10, 400)),
            "AI Prediction": "",
            "Risk Percentage": "",
            "Recommended Action": "",
        })
    return rows


def seed_vendors(n=8):
    rows = []
    for i in range(1, n + 1):
        rows.append({
            "Vendor ID": f"VND-{i:04d}",
            "Vendor Name": VENDORS[i % len(VENDORS)] + f" {i}",
            "Contact": f"+91-90000-{random.randint(10000,99999)}",
            "Email": f"support{i}@vendor.com",
            "AMC Expiry": _future(random.randint(-60, 400)),
            "Support Level": random.choice(["Basic", "Standard", "Premium"]),
        })
    return rows


SEEDERS = {
    "assets": seed_assets,
    "stock": seed_stock,
    "hardware": seed_hardware,
    "maintenance": seed_maintenance,
    "preventive": seed_preventive,
    "predictive": seed_predictive,
    "vendors": seed_vendors,
}


def seed_if_empty() -> None:
    storage = get_storage()
    for key in MODULES:
        if not storage.list_rows(key):
            storage.replace_all(key, SEEDERS[key]())
