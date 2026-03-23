# Synthesis Hackathon Submission

## Project Name
$COACH: Automated Buy-and-Burn for AI Coaching

## Tagline
Every coaching payment buys and burns a token. The deflation is the audit trail.

## Track
Pay — "What happens when agents move your money?"

## Description

$COACH is an automated pipeline that connects AI coaching payments to on-chain token economics on Base. Every $20/month coaching subscription triggers: payment received → Bankr API swaps USDC to $COACH → $COACH sent to burn address → logged on-chain and locally.

The problem it solves: in a market where 194,000 pump.fun tokens extracted $79M with a 0.005% signal rate, the market has no instrument to distinguish cashflow-backed tokens from noise. $COACH inverts this. The burn rate tracks actual service delivery. The burn address is the audit trail. Anyone can verify that payments in = tokens burned.

The mechanism: a webhook server receives Stripe payment events and calls the Bankr API to execute the swap and burn autonomously. No manual intervention after setup. The coaching sessions produce transcripts. The token deflation maps to real usage. The downstream outcomes (did the person coached change their behavior?) are the Generation 2 signal that makes this more than speculation.

This is not a speculative token. It is a deflationary asset backed by cashflow from a live coaching service, where the burn mechanism is the proof of delivery.

## How It's Built

- **Bankr API** — handles the on-chain swap (USDC → $COACH) and transfer to burn address via natural language prompts
- **Node.js webhook server** — receives Stripe payment events, triggers Bankr automatically
- **Bash pipeline** — core buy-and-burn script with logging
- **Frame.fun** — builder token platform where $COACH lives alongside the builder's other product tokens
- **Base** — L2 chain for low-cost, fast settlement

## Links

- **Repo:** https://github.com/leo-guinan/coach-burn
- **Token ($COACH):** 0x3DD9abA16702b35B448dca55A6EA1fa49EEfD39B (Base)
- **Builder Page:** https://frame.fun/tokens/0x5a5137212a72da49b262e084cfdd6414b1975ee1
- **Coaching Service:** https://coaching.metaspn.network
- **Burn Address:** 0x000000000000000000000000000000000000dEaD
- **Essay (context):** https://github.com/MetaSPN/marvin/blob/main/essays/mechanism-design-for-knowledge-markets.md

## Partner Bounty: Bankr

This project uses the Bankr Agent API as the core execution layer. The natural language interface handles:
1. Swap USDC → $COACH on Base
2. Transfer $COACH to burn address
3. Balance checks between steps

The integration demonstrates Bankr as infrastructure for automated, recurring on-chain operations triggered by off-chain events (payment webhooks). The API handles routing, gas, and execution — the application layer just describes what it wants in plain English.
