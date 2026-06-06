from datetime import datetime


def generate_number(prefix: str, count: int) -> str:
    """Generate a formatted document number like RFQ-2025-0001."""
    year = datetime.utcnow().year
    return f"{prefix}-{year}-{count:04d}"


def format_currency(amount: float, currency: str = "INR") -> str:
    """Format a currency amount with symbol."""
    symbols = {"INR": "₹", "USD": "$", "EUR": "€", "GBP": "£"}
    symbol = symbols.get(currency, currency)
    return f"{symbol}{amount:,.2f}"


def calculate_tax(subtotal: float, tax_rate: float = 18.0) -> dict:
    """Calculate tax amount and grand total."""
    tax_amount = round(subtotal * tax_rate / 100, 2)
    grand_total = round(subtotal + tax_amount, 2)
    return {
        "subtotal": round(subtotal, 2),
        "tax_rate": tax_rate,
        "tax_amount": tax_amount,
        "grand_total": grand_total,
    }
