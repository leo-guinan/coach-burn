#!/bin/bash
# $COACH Buy-and-Burn Pipeline
# Triggered on coaching payment receipt. Buys $COACH on Base and burns it.
#
# Usage: ./buy-and-burn.sh <amount_usd>
# Example: ./buy-and-burn.sh 20
#
# Flow:
# 1. Receive payment notification (Stripe webhook or manual trigger)
# 2. Use Bankr to swap USDC → $COACH on Base
# 3. Send $COACH to burn address (0x000000000000000000000000000000000000dEaD)
# 4. Log the transaction

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BANKR="$HOME/.openclaw/skills/bankr/scripts/bankr.sh"
LOG_FILE="$SCRIPT_DIR/burn-log.jsonl"

# Token addresses on Base
COACH_TOKEN="0x3DD9abA16702b35B448dca55A6EA1fa49EEfD39B"
BURN_ADDRESS="0x000000000000000000000000000000000000dEaD"

AMOUNT_USD="${1:-20}"

echo "🔥 COACH Buy-and-Burn Pipeline"
echo "   Amount: \$${AMOUNT_USD}"
echo "   Token: ${COACH_TOKEN}"
echo "   Burn to: ${BURN_ADDRESS}"
echo ""

# Step 1: Buy $COACH with USDC on Base
echo "Step 1: Buying \$COACH with ${AMOUNT_USD} USDC on Base..."
BUY_RESULT=$(bash "$BANKR" "Buy ${AMOUNT_USD} USDC worth of token ${COACH_TOKEN} on Base" 2>&1)
BUY_STATUS=$?

echo "$BUY_RESULT" | tail -5

if [ $BUY_STATUS -ne 0 ]; then
    echo "❌ Buy failed"
    echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"action\":\"buy\",\"amount_usd\":${AMOUNT_USD},\"status\":\"failed\",\"error\":\"buy step failed\"}" >> "$LOG_FILE"
    exit 1
fi

echo ""
echo "Step 2: Checking COACH balance..."
BALANCE_RESULT=$(bash "$BANKR" "What is my balance of token ${COACH_TOKEN} on Base?" 2>&1)
echo "$BALANCE_RESULT" | tail -3

echo ""
echo "Step 3: Sending all COACH to burn address..."
BURN_RESULT=$(bash "$BANKR" "Send all of my token ${COACH_TOKEN} on Base to ${BURN_ADDRESS}" 2>&1)
BURN_STATUS=$?

echo "$BURN_RESULT" | tail -5

if [ $BURN_STATUS -ne 0 ]; then
    echo "❌ Burn failed (tokens bought but not burned - manual intervention needed)"
    echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"action\":\"burn\",\"amount_usd\":${AMOUNT_USD},\"status\":\"burn_failed\",\"error\":\"send to burn address failed\"}" >> "$LOG_FILE"
    exit 1
fi

echo ""
echo "✅ Buy-and-burn complete"
echo "   \$${AMOUNT_USD} USDC → COACH → 🔥"

# Log successful burn
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "{\"timestamp\":\"${TIMESTAMP}\",\"action\":\"buy_and_burn\",\"amount_usd\":${AMOUNT_USD},\"token\":\"${COACH_TOKEN}\",\"burn_address\":\"${BURN_ADDRESS}\",\"status\":\"success\"}" >> "$LOG_FILE"

echo "Logged to: $LOG_FILE"
