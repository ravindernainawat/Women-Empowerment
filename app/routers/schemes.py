from typing import Optional
from fastapi import APIRouter, Query

router = APIRouter(prefix="/api/schemes", tags=["Government Scheme Finder"])

SCHEMES_CATALOG = [
    {
        "id": "pmmy",
        "name": "Pradhan Mantri Mudra Yojana (PMMY)",
        "ministry": "Ministry of Finance",
        "category": "Micro-Credit / Business Loan",
        "max_funding": "₹10,00,000",
        "tier": "Shishu (up to ₹50K), Kishore (₹50K-₹5L), Tarun (₹5L-₹10L)",
        "eligibility": "Women micro-entrepreneurs, artisans, home business operators, retail shop owners.",
        "subsidy_or_concession": "Low-interest collateral-free loans with Mudra Debit Card facility.",
        "application_url": "https://www.mudra.org.in/",
        "target_audience": ["Micro-Commerce", "Artisans", "Returnees", "Home Entrepreneurs"],
    },
    {
        "id": "standup-india",
        "name": "Stand-Up India Scheme",
        "ministry": "Department of Financial Services",
        "category": "Enterprise Greenfield Loans",
        "max_funding": "₹1,00,00,000",
        "tier": "₹10 Lakh to ₹1 Crore",
        "eligibility": "At least one woman or SC/ST entrepreneur per bank branch setting up a greenfield enterprise.",
        "subsidy_or_concession": "Direct scheduled commercial bank lending with handholding support via SIDBI.",
        "application_url": "https://www.standupmitra.in/",
        "target_audience": ["Manufacturing", "Services", "Tech Enterprises", "Agri-Business"],
    },
    {
        "id": "mahila-ehaat",
        "name": "Mahila E-Haat Digital Portal",
        "ministry": "Ministry of Women and Child Development",
        "category": "Direct Market Access / Digital Commerce",
        "max_funding": "Zero Onboarding Fee",
        "tier": "Direct Buyer-Seller Gateway",
        "eligibility": "Women entrepreneurs, Self Help Groups (SHGs), NGOs producing organic goods, apparel, or crafts.",
        "subsidy_or_concession": "100% free direct-to-consumer digital storefront with mobile transaction support.",
        "application_url": "https://wcd.nic.in/",
        "target_audience": ["SHGs", "Micro-Commerce", "Handicrafts", "Sustainable Goods"],
    },
    {
        "id": "pmegp",
        "name": "Prime Minister's Employment Generation Programme (PMEGP)",
        "ministry": "Ministry of MSME / KVIC",
        "category": "Capital Subsidy / Project Financing",
        "max_funding": "₹50,00,000",
        "tier": "₹25 Lakh (Services) to ₹50 Lakh (Manufacturing)",
        "eligibility": "Individuals aged 18+ setting up new micro-enterprises. Special concessions for women.",
        "subsidy_or_concession": "25% to 35% margin money government subsidy on total project cost.",
        "application_url": "https://www.kviconline.gov.in/pmegpeportal/",
        "target_audience": ["Manufacturing", "Food Processing", "Tech Services", "Returnee Ventures"],
    },
    {
        "id": "tread",
        "name": "Trade Related Entrepreneurship Assistance (TREAD)",
        "ministry": "Ministry of MSME",
        "category": "Non-Farm Grant & Training",
        "max_funding": "Up to 30% Govt Grant",
        "tier": "Grant through NGOs & Banks",
        "eligibility": "Poor & marginalized women with lack of access to traditional commercial banking.",
        "subsidy_or_concession": "Government provides up to 30% grant while remaining 70% is financed via micro-credit.",
        "application_url": "https://msme.gov.in/",
        "target_audience": ["Vocational Training", "SHGs", "Grassroots Innovators"],
    },
]


@router.get("")
def list_government_schemes(
    category: Optional[str] = Query(None, description="Filter by category (Loan, Grant, Digital Market)"),
    keyword: Optional[str] = Query(None, description="Search keyword in name or eligibility"),
):
    """
    Returns curated, verified Indian Government & Social Impact financial schemes
    designed specifically for women returnees, entrepreneurs, and learners.
    """
    results = SCHEMES_CATALOG

    if category:
        c_lower = category.lower()
        results = [s for s in results if c_lower in s["category"].lower() or c_lower in s["name"].lower()]

    if keyword:
        k_lower = keyword.lower()
        results = [
            s
            for s in results
            if k_lower in s["name"].lower()
            or k_lower in s["eligibility"].lower()
            or any(k_lower in aud.lower() for aud in s["target_audience"])
        ]

    return {
        "total_schemes": len(results),
        "schemes": results,
    }
