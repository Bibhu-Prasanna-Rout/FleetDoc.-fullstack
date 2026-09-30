from typing import Any
from app.models.models import Vehicle, Document, Loan, EMI, Challan, RoadTax, User

def merge_data(obj, base: dict):
    extra = getattr(obj, "data", {}) or {}
    result = dict(base)
    result.update(extra)
    return result

def user_out(u: User):
    return merge_data(u, {"id":u.id,"name":u.name,"email":u.email,"contactNo":u.phone,"phone":u.phone,"password":"","role":u.role,"status":u.status,"photo":u.photo,"emailVerified":u.email_verified,"phoneVerified":u.phone_verified,"permissions":u.permissions or {}})

def vehicle_out(x: Vehicle):
    return merge_data(x, {"id":x.id,"number":x.number,"type":x.type,"owner":x.owner,"brand":x.brand,"model":x.model,"year":x.year,"status":x.status})

def document_out(x: Document):
    return merge_data(x, {"id":x.id,"vehicle":x.vehicle,"type":x.type,"number":x.number,"start":x.start,"expiry":x.expiry,"amount":x.amount,"status":x.status,"fileName":x.file_name,"fileUrl":x.file_url})

def loan_out(x: Loan):
    return merge_data(x, {"id":x.id,"vehicle":x.vehicle,"bank":x.bank,"principal":x.principal,"amount":x.principal,"monthlyAmount":x.monthly_amount,"interestRate":x.interest_rate,"tenureMonths":x.tenure_months,"startDate":x.start_date,"closingDate":x.closing_date,"status":x.status})

def emi_out(x: EMI):
    return merge_data(x, {"id":x.id,"loanId":x.loan_id,"vehicle":x.vehicle,"bank":x.bank,"due":x.due,"amount":x.amount,"status":x.status,"paidDate":x.paid_date})

def challan_out(x: Challan):
    return merge_data(x, {"id":x.id,"vehicle":x.vehicle,"challanNo":x.challan_no,"date":x.date,"amount":x.amount,"status":x.status,"reason":x.reason,"paymentDate":x.payment_date})

def roadtax_out(x: RoadTax):
    return merge_data(x, {"id":x.id,"vehicle":x.vehicle,"taxType":x.tax_type,"amount":x.amount,"start":x.start,"expiry":x.expiry,"status":x.status})
