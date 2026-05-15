#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXECUTE=0
SELECTED_STAGE="all"

STAGES=(
  request-schema
  request-typing
  request-builder
  domain-common
  domain-entities
  client-transport
  sports
  barrels
)

usage() {
  cat <<'EOF'
Usage:
  scripts/migrate-project-structure.sh [--execute] [--stage <name>]

Description:
  Establishes the proposed src/core migration layout using a low-churn approach.
  The script creates destination files and barrels at their final paths, with
  re-export modules that point back to the current source locations.

  By default this script runs in dry-run mode and prints what it would write.
  Pass --execute to actually create or overwrite files.

Stages:
  request-schema     Create src/core/request/schema/*
  request-typing     Create src/core/request/builder/* and contracts/* shims
  request-builder    Create src/core/request/builder/RequestBuilder.ts
  domain-common      Create src/core/domain/common/* modules
  domain-entities    Create src/core/domain/<entity>/{model,queries}.ts
  client-transport   Create src/core/client and src/core/transport modules
  sports             Create src/core/sports/* modules
  barrels            Create src/core request/domain barrel files
  all                Run every stage above
EOF
}

log() {
  printf '%s\n' "$*"
}

run_cmd() {
  if [[ "$EXECUTE" -eq 1 ]]; then
    "$@"
  else
    printf '+'
    for arg in "$@"; do
      printf ' %q' "$arg"
    done
    printf '\n'
  fi
}

ensure_parent_dir() {
  local destination="$1"
  run_cmd mkdir -p "$(dirname "$destination")"
}

write_text() {
  local destination="$1"
  local content="$2"

  ensure_parent_dir "$destination"

  if [[ "$EXECUTE" -eq 1 ]]; then
    printf '%s\n' "$content" > "$destination"
  else
    log "cat > $destination <<'EOF'"
    printf '%s\n' "$content"
    log 'EOF'
  fi
}

write_reexport_module() {
  local destination="$1"
  local specifier="$2"

  write_text "$destination" "export * from '$specifier';"
}

write_type_export_module() {
  local destination="$1"
  local names="$2"
  local specifier="$3"

  write_text "$destination" "export type { $names } from '$specifier';"
}

write_request_schema_stage() {
  log "Creating request schema destination modules so the new core layout exists before any destructive moves."

  write_reexport_module "$ROOT_DIR/src/core/request/schema/index.ts" '../../../types/request/schema.js'
  write_reexport_module "$ROOT_DIR/src/core/request/schema/shared.ts" '../../../types/request/schema-runtime/shared.js'
  write_reexport_module "$ROOT_DIR/src/core/request/schema/root.ts" '../../../types/request/schema-runtime/root-stages.js'
  write_reexport_module "$ROOT_DIR/src/core/request/schema/game.ts" '../../../types/request/schema-runtime/game-stages.js'
  write_reexport_module "$ROOT_DIR/src/core/request/schema/league.ts" '../../../types/request/schema-runtime/league-stages.js'
  write_reexport_module "$ROOT_DIR/src/core/request/schema/team.ts" '../../../types/request/schema-runtime/team-stages.js'
  write_reexport_module "$ROOT_DIR/src/core/request/schema/player.ts" '../../../types/request/schema-runtime/player-stages.js'
  write_reexport_module "$ROOT_DIR/src/core/request/schema/user.ts" '../../../types/request/schema-runtime/user-stages.js'
  write_reexport_module "$ROOT_DIR/src/core/request/schema/transaction.ts" '../../../types/request/schema-runtime/transaction-stages.js'
}

write_request_typing_stage() {
  log "Creating request builder and contract modules under src/core/request so import migration can happen stage by stage."

  write_reexport_module "$ROOT_DIR/src/core/request/builder/context.ts" '../../../types/request/context.js'
  write_reexport_module "$ROOT_DIR/src/core/request/builder/filters.ts" '../../../types/request/filters.js'
  write_reexport_module "$ROOT_DIR/src/core/request/builder/graph.ts" '../../../types/request/graph.js'
  write_reexport_module "$ROOT_DIR/src/core/request/builder/response-routes.ts" '../../../types/request/response-routes.js'
  write_reexport_module "$ROOT_DIR/src/core/request/contracts/responses.ts" '../../../types/request/responses.js'
  write_reexport_module "$ROOT_DIR/src/core/request/contracts/wrappers.ts" '../../../types/responses/wrappers.js'
}

write_request_builder_stage() {
  log "Creating the colocated RequestBuilder entry point so runtime request code can move without breaking current callers."

  write_reexport_module "$ROOT_DIR/src/core/request/builder/RequestBuilder.ts" '../../../builders/request.js'
}

write_domain_common_stage() {
  log "Splitting domain-common entry points into focused files while preserving the current source of truth during migration."

  write_type_export_module "$ROOT_DIR/src/core/domain/common/keys.ts" \
    'GameCode, GameType, ResourceKey, PlayerPosition, GameKey, LeagueKey, TeamKey, PlayerKey, TransactionKey, WaiverClaimKey, PendingTradeKey' \
    '../../../types/common.js'

  write_type_export_module "$ROOT_DIR/src/core/domain/common/enums.ts" \
    'ScoringType, DraftStatus, PlayerStatus, TransactionType, TransactionStatus, CoverageType, FeloTier, PositionType, StatValue' \
    '../../../types/common.js'

  write_type_export_module "$ROOT_DIR/src/core/domain/common/metadata.ts" \
    'ImageSource, BaseMetadata' \
    '../../../types/common.js'

  write_type_export_module "$ROOT_DIR/src/core/domain/common/pagination.ts" \
    'PaginationParams, DateRangeParams, SortParams' \
    '../../../types/common.js'

  write_type_export_module "$ROOT_DIR/src/core/domain/common/api.ts" \
    'ApiResponse' \
    '../../../types/common.js'

  write_type_export_module "$ROOT_DIR/src/core/domain/common/config.ts" \
    'Config' \
    '../../../types/common.js'

  write_reexport_module "$ROOT_DIR/src/core/domain/common/errors.ts" '../../../types/errors.js'
}

write_domain_entities_stage() {
  log "Creating domain entity modules at their final paths so each response/resource pair can be migrated independently later."

  local entities=(game league team player transaction user)
  local entity

  for entity in "${entities[@]}"; do
    write_reexport_module "$ROOT_DIR/src/core/domain/$entity/model.ts" "../../../types/responses/$entity.js"
    write_reexport_module "$ROOT_DIR/src/core/domain/$entity/queries.ts" "../../../types/resources/$entity.js"
  done
}

write_client_transport_stage() {
  log "Creating client and transport destination modules so runtime classes have stable final homes before source relocation."

  write_reexport_module "$ROOT_DIR/src/core/client/YahooFantasyClient.ts" '../../client/YahooFantasyClient.js'
  write_reexport_module "$ROOT_DIR/src/core/transport/HttpClient.ts" '../../client/HttpClient.js'
  write_reexport_module "$ROOT_DIR/src/core/transport/OAuth1Client.ts" '../../client/OAuth1Client.js'
  write_reexport_module "$ROOT_DIR/src/core/transport/OAuth2Client.ts" '../../client/OAuth2Client.js'
}

write_sports_stage() {
  log "Creating core sports modules so type exports can stop depending on the constants folder directly."

  write_reexport_module "$ROOT_DIR/src/core/sports/mlb.ts" '../../constants/sports/mlb.js'
  write_reexport_module "$ROOT_DIR/src/core/sports/nba.ts" '../../constants/sports/nba.js'
  write_reexport_module "$ROOT_DIR/src/core/sports/nfl.ts" '../../constants/sports/nfl.js'
  write_reexport_module "$ROOT_DIR/src/core/sports/nhl.ts" '../../constants/sports/nhl.js'
}

write_barrels_stage() {
  log "Writing core barrel files so the new structure has coherent import surfaces immediately after scaffolding."

  write_text "$ROOT_DIR/src/core/request/index.ts" "export * from './builder/index.js';
export * from './contracts/responses.js';
export * from './contracts/wrappers.js';
export * from './schema/index.js';"

  write_text "$ROOT_DIR/src/core/request/builder/index.ts" "export * from './RequestBuilder.js';
export * from './context.js';
export * from './filters.js';
export * from './graph.js';
export * from './response-routes.js';"

  write_text "$ROOT_DIR/src/core/domain/common/index.ts" "export * from './api.js';
export * from './config.js';
export * from './enums.js';
export * from './errors.js';
export * from './keys.js';
export * from './metadata.js';
export * from './pagination.js';"

  write_text "$ROOT_DIR/src/core/domain/index.ts" "export * from './common/index.js';
export * from './game/model.js';
export * from './game/queries.js';
export * from './league/model.js';
export * from './league/queries.js';
export * from './team/model.js';
export * from './team/queries.js';
export * from './player/model.js';
export * from './player/queries.js';
export * from './transaction/model.js';
export * from './transaction/queries.js';
export * from './user/model.js';
export * from './user/queries.js';"
}

run_stage() {
  local stage="$1"

  case "$stage" in
    request-schema)
      write_request_schema_stage
      ;;
    request-typing)
      write_request_typing_stage
      ;;
    request-builder)
      write_request_builder_stage
      ;;
    domain-common)
      write_domain_common_stage
      ;;
    domain-entities)
      write_domain_entities_stage
      ;;
    client-transport)
      write_client_transport_stage
      ;;
    sports)
      write_sports_stage
      ;;
    barrels)
      write_barrels_stage
      ;;
    *)
      log "Unknown stage: $stage"
      exit 1
      ;;
  esac
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --execute)
      EXECUTE=1
      shift
      ;;
    --stage)
      if [[ $# -lt 2 ]]; then
        usage
        exit 1
      fi
      SELECTED_STAGE="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      usage
      exit 1
      ;;
  esac
done

if [[ "$SELECTED_STAGE" == "all" ]]; then
  for stage in "${STAGES[@]}"; do
    run_stage "$stage"
  done
else
  run_stage "$SELECTED_STAGE"
fi

log "Migration scaffold complete."
