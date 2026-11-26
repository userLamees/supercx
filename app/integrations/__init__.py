"""Connectors to the association's systems. Each one has a demo mode that works with demo data
today, and a live mode switched on by settings only (no code change):

- members.py    member registry: who is a member, which tier, when it expires
- case_sync.py  support cases sent on to the association's system (webhook or email)
- status.py     what is live and what is still demo, for the admin "التكاملات" page
"""
