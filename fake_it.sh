#!/bin/bash
#
TEAM_LIST_FROM=("ED" "SOLV" "SIMU" "SOFT" "DATA")
TEAM_LIST=("ED" "SOLV" "SIMU" "SOFT" "DATA" "SIM/US" "SIM/IND" "B2B" "B2C" "ADV" "PM" "MAT" "DOTI/BS" "DOTI/IN" "DOMF" "GST" "Others")

# Select a random team
SELECTED_TEAM=${TEAM_LIST_FROM[$RANDOM % ${#TEAM_LIST_FROM[@]}]}

# Select a random number of connections (between 1 and 3 for variety)
NUM_CONNECTIONS=$((1 + RANDOM % 3))
SELECTED_CONNECTIONS=()

# Pick random connections (excluding the selected team itself)
for ((i = 0; i < NUM_CONNECTIONS; i++)); do
    RANDOM_TEAM=${TEAM_LIST[$RANDOM % ${#TEAM_LIST[@]}]}
    [[ "$RANDOM_TEAM" != "$SELECTED_TEAM" ]] && SELECTED_CONNECTIONS+=("\"$RANDOM_TEAM\"")
done

# Convert connections to JSON array format
CONNECTIONS_JSON=$(IFS=,; echo "[${SELECTED_CONNECTIONS[*]}]")

# Make the curl request
curl -X POST "http://localhost:3000/api/vote" \
     -H "Content-Type: application/json" \
     -d "{\"team\": \"$SELECTED_TEAM\", \"connections\": $CONNECTIONS_JSON}"

