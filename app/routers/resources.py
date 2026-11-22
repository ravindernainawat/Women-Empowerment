from typing import Optional
from fastapi import APIRouter, Query

router = APIRouter(prefix="/api/resources", tags=["Sanctuary & Helplines"])

NATIONAL_HELPLINES = [
    {
        "id": "112",
        "name": "National Emergency Response Support System (ERSS)",
        "number": "112",
        "type": "Immediate Police / Fire / Ambulance",
        "description": "Pan-India single emergency number for immediate distress dispatch and geotagged police response.",
        "operational_hours": "24/7 Toll-Free",
        "urgency_level": "Immediate Critical Emergency",
    },
    {
        "id": "181",
        "name": "Women Helpline (Universal Pan-India)",
        "number": "181",
        "type": "Trauma, Domestic Distress, Legal Counseling",
        "description": "Government of India 24-hour toll-free telecom service providing integrated support and shelter linkages.",
        "operational_hours": "24/7 Toll-Free",
        "urgency_level": "High Distress & Shelter",
    },
    {
        "id": "ncw-wa",
        "name": "National Commission for Women (NCW) Rapid WhatsApp",
        "number": "+91 7827170170",
        "type": "WhatsApp Domestic Violence & Harassment",
        "description": "Direct confidential messaging hotline monitored by NCW grievance officers for silent distress reporting.",
        "operational_hours": "24/7 Online",
        "urgency_level": "Silent / Covert Reporting",
    },
    {
        "id": "1930",
        "name": "National Cyber Crime Helpline (MHA)",
        "number": "1930",
        "type": "Cyberstalking, Blackmail, Morphing, Online Abuse",
        "description": "Specialized cell for cyber harassment against women and online identity fraud.",
        "operational_hours": "24/7 Pan-India",
        "urgency_level": "Cyber Harassment",
    },
    {
        "id": "telemanas",
        "name": "Tele-MANAS Mental Health Distress Line",
        "number": "14416 / 1800 891 4416",
        "type": "Trauma-Informed Psychological First Aid",
        "description": "Government of India national mental health tele-counseling service in 20+ regional languages.",
        "operational_hours": "24/7 Toll-Free",
        "urgency_level": "Mental Health & Stress",
    },
    {
        "id": "1098",
        "name": "Childline & Family Emergency Assistance",
        "number": "1098",
        "type": "Child Protection & Family Emergency",
        "description": "National emergency phone outreach service for children and mothers in crisis situations.",
        "operational_hours": "24/7 Toll-Free",
        "urgency_level": "Child & Mother Support",
    },
]


@router.get("/helplines")
def get_sanctuary_helplines(
    query: Optional[str] = Query(None, description="Search term for helpline")
):
    """
    Returns verified, active national and state emergency crisis helplines.
    Designed for fast, zero-delay rendering in emergency contexts.
    """
    helplines = NATIONAL_HELPLINES
    if query:
        q = query.lower()
        helplines = [
            h
            for h in helplines
            if q in h["name"].lower()
            or q in h["number"].lower()
            or q in h["type"].lower()
        ]

    return {
        "status": "active",
        "helplines": helplines,
        "disclaimer": "If you are in immediate physical danger, dial 112 or 181 immediately.",
    }
