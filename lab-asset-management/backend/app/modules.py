"""
Schema-driven module registry.

Every module (Google Sheet) is described once here. The generic CRUD router,
the storage layer, seeding, dashboard aggregation and the frontend all use this
single source of truth. Adding a new module = adding one entry below.

Field types: text | number | date | select | textarea
"""

MODULES: dict[str, dict] = {
    "assets": {
        "label": "Asset Inventory",
        "sheet": "Asset Inventory",
        "id_field": "Asset ID",
        "id_prefix": "AST",
        "icon": "Inventory2",
        "columns": [
            {"name": "Asset ID", "type": "text", "readonly": True},
            {"name": "Asset Name", "type": "text", "required": True},
            {"name": "Category", "type": "select",
             "options": ["Computer", "Microscope", "Centrifuge", "Printer",
                         "Server", "Network Device", "Analyzer"]},
            {"name": "Manufacturer", "type": "text"},
            {"name": "Model", "type": "text"},
            {"name": "Serial Number", "type": "text"},
            {"name": "Department", "type": "select",
             "options": ["Pathology", "Microbiology", "Radiology",
                         "Biochemistry", "IT", "Research"]},
            {"name": "Laboratory", "type": "select",
             "options": ["Lab A", "Lab B", "Lab C", "Lab D"]},
            {"name": "Purchase Date", "type": "date"},
            {"name": "Installation Date", "type": "date"},
            {"name": "Warranty Expiry", "type": "date"},
            {"name": "Vendor", "type": "text"},
            {"name": "Purchase Cost", "type": "number"},
            {"name": "Current Status", "type": "select",
             "options": ["Active", "Faulty", "Under Maintenance", "Retired"]},
            {"name": "Assigned To", "type": "text"},
            {"name": "Location", "type": "text"},
            {"name": "Remarks", "type": "textarea"},
        ],
    },
    "stock": {
        "label": "Stock Maintenance",
        "sheet": "Stock Maintenance",
        "id_field": "Item ID",
        "id_prefix": "ITM",
        "icon": "Warehouse",
        "columns": [
            {"name": "Item ID", "type": "text", "readonly": True},
            {"name": "Item Name", "type": "text", "required": True},
            {"name": "Category", "type": "select",
             "options": ["Consumable", "Spare Part", "Reagent", "Component"]},
            {"name": "Supplier", "type": "text"},
            {"name": "Current Stock", "type": "number"},
            {"name": "Minimum Stock", "type": "number"},
            {"name": "Maximum Stock", "type": "number"},
            {"name": "Unit Price", "type": "number"},
            {"name": "Purchase Date", "type": "date"},
            {"name": "Issued Quantity", "type": "number"},
            {"name": "Available Quantity", "type": "number"},
            {"name": "Remarks", "type": "textarea"},
        ],
    },
    "hardware": {
        "label": "Hardware Monitoring",
        "sheet": "Hardware Monitoring",
        "id_field": "Device ID",
        "id_prefix": "DEV",
        "icon": "Memory",
        "columns": [
            {"name": "Device ID", "type": "text", "readonly": True},
            {"name": "CPU Usage", "type": "number"},
            {"name": "RAM Usage", "type": "number"},
            {"name": "Storage Usage", "type": "number"},
            {"name": "Temperature", "type": "number"},
            {"name": "Network Status", "type": "select",
             "options": ["Online", "Offline", "Degraded"]},
            {"name": "Last Checked", "type": "date"},
            {"name": "Health Status", "type": "select",
             "options": ["Healthy", "Warning", "Critical"]},
        ],
    },
    "maintenance": {
        "label": "Maintenance Requests",
        "sheet": "Maintenance Requests",
        "id_field": "Request ID",
        "id_prefix": "REQ",
        "icon": "BuildCircle",
        "columns": [
            {"name": "Request ID", "type": "text", "readonly": True},
            {"name": "Asset ID", "type": "text", "required": True},
            {"name": "Problem Description", "type": "textarea"},
            {"name": "Priority", "type": "select",
             "options": ["Low", "Medium", "High", "Critical"]},
            {"name": "Reported By", "type": "text"},
            {"name": "Assigned Engineer", "type": "text"},
            {"name": "Request Date", "type": "date"},
            {"name": "Completion Date", "type": "date"},
            {"name": "Current Status", "type": "select",
             "options": ["Open", "In Progress", "Resolved", "Closed"]},
            {"name": "Remarks", "type": "textarea"},
        ],
    },
    "preventive": {
        "label": "Preventive Maintenance",
        "sheet": "Preventive Maintenance Schedule",
        "id_field": "Maintenance ID",
        "id_prefix": "PM",
        "icon": "EventRepeat",
        "columns": [
            {"name": "Maintenance ID", "type": "text", "readonly": True},
            {"name": "Asset ID", "type": "text", "required": True},
            {"name": "Maintenance Type", "type": "select",
             "options": ["Inspection", "Calibration", "Cleaning", "Servicing"]},
            {"name": "Scheduled Date", "type": "date"},
            {"name": "Completed Date", "type": "date"},
            {"name": "Next Due Date", "type": "date"},
            {"name": "Status", "type": "select",
             "options": ["Scheduled", "Completed", "Overdue"]},
            {"name": "Engineer", "type": "text"},
        ],
    },
    "predictive": {
        "label": "Predictive Maintenance",
        "sheet": "Predictive Maintenance",
        "id_field": "Asset ID",
        "id_prefix": "AST",
        "icon": "Insights",
        "columns": [
            {"name": "Asset ID", "type": "text", "required": True},
            {"name": "Age", "type": "number"},
            {"name": "Failure Count", "type": "number"},
            {"name": "Downtime Hours", "type": "number"},
            {"name": "Last Service", "type": "date"},
            {"name": "AI Prediction", "type": "text", "readonly": True},
            {"name": "Risk Percentage", "type": "number", "readonly": True},
            {"name": "Recommended Action", "type": "text", "readonly": True},
        ],
    },
    "vendors": {
        "label": "Vendor Details",
        "sheet": "Vendor Details",
        "id_field": "Vendor ID",
        "id_prefix": "VND",
        "icon": "Store",
        "columns": [
            {"name": "Vendor ID", "type": "text", "readonly": True},
            {"name": "Vendor Name", "type": "text", "required": True},
            {"name": "Contact", "type": "text"},
            {"name": "Email", "type": "text"},
            {"name": "AMC Expiry", "type": "date"},
            {"name": "Support Level", "type": "select",
             "options": ["Basic", "Standard", "Premium"]},
        ],
    },
}


def module_headers(module_key: str) -> list[str]:
    return [c["name"] for c in MODULES[module_key]["columns"]]


def all_module_keys() -> list[str]:
    return list(MODULES.keys())
