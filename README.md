# $COACH: Automated Buy-and-Burn for AI Coaching

**Synthesis Hackathon 2026 — Pay Track**

---

## What It Does

$COACH is an automated buy-and-burn pipeline that connects AI coaching payments to on-chain token economics. Every payment for coaching services triggers an automated swap from USDC to $COACH on Base, which is then sent to the burn address. The token supply decreases with every coaching session delivered.

**The mechanism:** payment → Bankr API swap (USDC → $COACH) → burn (send to 0x...dEaD) → logged on-chain and locally.

This is not a speculative token. It's a cashflow-backed deflationary asset where the burn rate tracks actual service delivery.

## Why It Matters

The pump.fun market extracted $79 million in six months across 194,000 tokens with a 0.005% meaningful hit rate. The business model works because Generation 2 latency — the time until anyone can determine whether a project produces lasting value — exceeds the extraction window.

$COACH inverts this. The burn is on-chain verifiable. The coaching sessions produce transcripts. The downstream outcomes (did the person coached change their behavior?) are measurable. The token's deflationary curve maps to actual usage, not speculation.

**This is what "agents that pay" looks like when the payment flow is honest.**

## Architecture

```
┌─────────────┐     ┌───────────────┐     ┌──────────────┐     ┌──────────────┐
│   Payment    │────▶│  Webhook      │────▶│  Bankr API   │────▶│  Burn Addr   │
│   (Stripe)   │     │  Server       │     │  USDC→$COACH │     │  0x...dEaD   │
└─────────────┘     └───────────────┘     └──────────────┘     └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  burn-log    │
                    │  .jsonl      │
                    └──────────────┘
```

### Components

1. **`buy-and-burn.sh`** — Core pipeline script. Takes a USD amount, uses Bankr to swap USDC → $COACH on Base, sends to burn address, logs the result.

2. **`server.mjs`** — Webhook server. Receives Stripe payment events, triggers the burn automatically. Also exposes `/burns` for public audit and `/health` for status.

3. **Bankr API** — Handles the on-chain swap and transfer via natural language. No custom smart contract deployment needed.

## Token Details

| Field | Value |
|-------|-------|
| Token | $COACH |
| Chain | Base |
| Address | `0x3DD9abA16702b35B448dca55A6EA1fa49EEfD39B` |
| Burn Address | `0x000000000000000000000000000000000000dEaD` |
| Builder Page | [frame.fun/tokens/0x5a5137212a72da49b262e084cfdd6414b1975ee1](https://frame.fun/tokens/0x5a5137212a72da49b262e084cfdd6414b1975ee1) |

## Pricing & Burn Mechanics

| Tier | Price | Burn Behavior |
|------|-------|---------------|
| AI coaching (Marvin) | $20/month | Each payment buys and burns $COACH |
| Human + AI coaching | $200/month | Each payment buys and burns $COACH |
| 10 human slots max | $2,000/month total | Sustainability threshold |

Once human slots are filled, the creator is sustainable. All subsequent AI-tier payments add deflationary pressure to the token. The burn rate is publicly auditable via the `/burns` endpoint and on-chain via the burn address.

## Current Status

The pipeline is built and tested. Bankr handles the swap-and-transfer flow via natural language. One constraint: Frame.fun product tokens pair against the builder token, not directly against USDC. The swap path is USDC → ETH → builder token → $COACH, which requires routing through Frame.fun's pool rather than standard DEX aggregators.

**What works now:** the webhook server, the burn script, the Bankr integration, the logging. 
**What needs liquidity:** the actual swap. Once the $COACH pool deepens enough for Bankr's aggregators to find it (or we add direct Frame.fun contract integration), the full pipeline executes autonomously.

The manual interim: Leo buys $COACH on Frame.fun directly, sends to burn address. On-chain verifiable. The automation replaces the manual step once liquidity is sufficient.

## Setup

```bash
# Requires: Bankr API key configured at ~/.clawdbot/skills/bankr/config.json
# See: https://bankr.bot/api

# Test the pipeline
./buy-and-burn.sh 20

# Run webhook server
node server.mjs --port 3120

# Manual trigger
curl -X POST http://localhost:3120/burn \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{"amount_usd": 20}'

# Check burn history
curl http://localhost:3120/burns
```

## Connection to the Thesis

This project is Essay 1 of a [six-essay series on mechanism design for knowledge markets](https://github.com/MetaSPN/marvin/blob/main/essays/mechanism-design-for-knowledge-markets.md). The core argument: broken markets cannot distinguish cashflow-backed compounding assets from noise because Generation 2 latency (the time until grandchildren — downstream products that work — can be assessed) exceeds the extraction window.

$COACH is the mechanism applied to a real service:
- **Generation 0:** The coaching product exists
- **Generation 1:** Someone uses it (pays, receives coaching)
- **Generation 2:** The person coached produces improved outcomes (measurable via follow-up)
- **The burn:** on-chain proof that Generation 1 occurred, verifiable by anyone

The burn address is the audit trail. The token supply curve is the signal. When the market can see that a token's deflation tracks actual service delivery, the information asymmetry that enables noise extraction starts to close.

## Built With

- [Bankr](https://bankr.bot) — AI-powered crypto agent API (swap + transfer)
- [Frame.fun](https://frame.fun) — Builder token platform
- [Base](https://base.org) — L2 chain
- Node.js — Webhook server
- Bash — Core pipeline

## Live

- Coaching: [coaching.metaspn.network](https://coaching.metaspn.network)
- Builder page: [frame.fun](https://frame.fun/tokens/0x5a5137212a72da49b262e084cfdd6414b1975ee1)
- Token: [GeckoTerminal](https://www.geckoterminal.com/base/pools/0x4dd806406947b37370423b0bbc06858287de3769e337060299d1898c629c4916)

---

*A mechanism that requires participants to be honest is not a mechanism. It's a prayer. The burn address doesn't require honesty. It requires a transaction.*
