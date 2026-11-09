-- Lets creators report a payment problem (a brand that did not pay) from a conversation.
alter type public.report_reason add value if not exists 'non_payment';
