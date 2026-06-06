import asyncio
from typing import Any, Callable, Dict, List, Type


class Event:
    """Base event class. All domain events should extend this."""
    pass


class EventBus:
    """Simple in-process event bus for domain events."""
    _handlers: Dict[Type[Event], List[Callable]] = {}

    @classmethod
    def subscribe(cls, event_type: Type[Event], handler: Callable) -> None:
        """Subscribe a handler to an event type."""
        if event_type not in cls._handlers:
            cls._handlers[event_type] = []
        cls._handlers[event_type].append(handler)

    @classmethod
    async def publish(cls, event: Event) -> None:
        """Publish an event to all subscribed handlers."""
        event_type = type(event)
        handlers = cls._handlers.get(event_type, [])
        for handler in handlers:
            if asyncio.iscoroutinefunction(handler):
                await handler(event)
            else:
                handler(event)

    @classmethod
    def clear(cls) -> None:
        """Clear all subscriptions."""
        cls._handlers = {}


# Domain Events
class ApprovalApprovedEvent(Event):
    """Fired when an approval request is approved."""
    def __init__(self, approval_id: Any, quotation_id: Any, approved_by: Any):
        self.approval_id = approval_id
        self.quotation_id = quotation_id
        self.approved_by = approved_by


class RFQPublishedEvent(Event):
    """Fired when an RFQ is published / made open."""
    def __init__(self, rfq_id: Any, vendor_ids: List[Any]):
        self.rfq_id = rfq_id
        self.vendor_ids = vendor_ids


class POCreatedEvent(Event):
    """Fired when a Purchase Order is created."""
    def __init__(self, po_id: Any, vendor_id: Any, created_by: Any):
        self.po_id = po_id
        self.vendor_id = vendor_id
        self.created_by = created_by


class InvoiceSentEvent(Event):
    """Fired when an invoice is sent via email."""
    def __init__(self, invoice_id: Any, recipient_email: str):
        self.invoice_id = invoice_id
        self.recipient_email = recipient_email
